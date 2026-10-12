import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isCustomerRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/enquiries") ||
    pathname.startsWith("/profile");
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  // Fast path: bypass all auth checks for public pages (/, /gallery, /services, /about, /contact)
  if (!isAdminRoute && !isCustomerRoute && !isAuthPage) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  const testCookie =
    process.env.NODE_ENV !== "production"
      ? request.cookies.get("test_auth_user")?.value
      : null;
  if (testCookie) {
    try {
      user = JSON.parse(decodeURIComponent(testCookie));
    } catch {}
  }

  if (!user) {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  }

  // Helper to ensure refreshed cookies are preserved on redirects
  const redirectWithCookies = (url: URL) => {
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  };

  // 1. Admin route protection - ONLY /admin routes require role === 'admin'
  if (isAdminRoute) {
    // Add noindex, nofollow for all /admin routes
    supabaseResponse.headers.set("X-Robots-Tag", "noindex, nofollow");

    // Allow /admin/login without auth
    if (pathname === "/admin/login") {
      if (user) {
        let isAdmin = user.user_metadata?.role === "admin";
        if (!isAdmin) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();
          isAdmin = profile?.role === "admin";
        }
        if (isAdmin) {
          return redirectWithCookies(new URL("/admin", request.url));
        }
      }
      return supabaseResponse;
    }

    // Allow /admin/403 (forbidden error page)
    if (pathname === "/admin/403") {
      return supabaseResponse;
    }

    // Unauthenticated user attempting to access admin
    if (!user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/admin/login";
      redirectUrl.searchParams.set("redirectTo", pathname);
      return redirectWithCookies(redirectUrl);
    }

    // Check 3-hour admin inactivity
    const lastActive = request.cookies.get("admin_last_active")?.value;
    const now = Date.now();
    const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

    if (lastActive && now - parseInt(lastActive, 10) > THREE_HOURS_MS) {
      // Inactive for > 3 hours: sign out
      await supabase.auth.signOut();
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/admin/login";
      redirectUrl.searchParams.set("reason", "session_expired");
      const resp = redirectWithCookies(redirectUrl);
      resp.cookies.delete("admin_last_active");
      return resp;
    }

    // Verify admin role - ONLY admin routes require role === 'admin'
    let isAdmin = user.user_metadata?.role === "admin";
    if (!isAdmin) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      isAdmin = profile?.role === "admin";
    }

    if (!isAdmin) {
      // User is authenticated but NOT an admin: show 403 page
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/admin/403";
      return redirectWithCookies(redirectUrl);
    }

    // Update inactivity timestamp cookie (3-hour rolling session)
    supabaseResponse.cookies.set("admin_last_active", now.toString(), {
      path: "/",
      maxAge: 60 * 60 * 3, // 3 hours
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    return supabaseResponse;
  }

  // 2. Protect customer routes (/dashboard, /enquiries, /enquiries/[id], /profile)
  // All authenticated customers have access with zero role checks
  if (isCustomerRoute) {
    if (!user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("redirectTo", pathname);
      return redirectWithCookies(redirectUrl);
    }

    // Redirect /dashboard directly to /enquiries
    if (pathname === "/dashboard") {
      return redirectWithCookies(new URL("/enquiries", request.url));
    }

    return supabaseResponse;
  }

  // 3. Redirect authenticated users away from public auth pages (/login, /signup)
  if (user && isAuthPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/enquiries";
    return redirectWithCookies(redirectUrl);
  }

  return supabaseResponse;
}

// Export middleware alias as well
export const middleware = proxy;

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/enquiries/:path*",
    "/profile/:path*",
    "/complete-profile/:path*",
    "/auth/:path*",
    "/login",
    "/signup",
  ],
};

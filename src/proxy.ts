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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Admin route protection
  if (isAdminRoute) {
    // Add noindex, nofollow for all /admin routes
    supabaseResponse.headers.set("X-Robots-Tag", "noindex, nofollow");

    // Allow /admin/login without auth
    if (pathname === "/admin/login") {
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (profile?.role === "admin") {
          return NextResponse.redirect(new URL("/admin", request.url));
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
      return NextResponse.redirect(redirectUrl);
    }

    // Check 12-hour admin inactivity
    const lastActive = request.cookies.get("admin_last_active")?.value;
    const now = Date.now();
    const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

    if (lastActive && now - parseInt(lastActive, 10) > TWELVE_HOURS_MS) {
      // Inactive for > 12 hours: sign out
      await supabase.auth.signOut();
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/admin/login";
      redirectUrl.searchParams.set("reason", "session_expired");
      const resp = NextResponse.redirect(redirectUrl);
      resp.cookies.delete("admin_last_active");
      return resp;
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      // User is authenticated but NOT an admin: show 403 page
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/admin/403";
      return NextResponse.redirect(redirectUrl);
    }

    // Update inactivity timestamp cookie (12-hour rolling session)
    supabaseResponse.cookies.set("admin_last_active", now.toString(), {
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    return supabaseResponse;
  }

  // 2. Protect customer routes
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/enquiries") ||
    pathname.startsWith("/profile")
  ) {
    if (!user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 3. Redirect authenticated users away from public auth pages
  if (user && (pathname === "/login" || pathname === "/signup")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

// Export middleware alias as well
export const middleware = proxy;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

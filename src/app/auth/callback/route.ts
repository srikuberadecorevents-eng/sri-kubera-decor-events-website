import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/dashboard";

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const redirectUrl = new URL(next, origin);
      redirectUrl.searchParams.set("confirmed", "true");
      return NextResponse.redirect(redirectUrl.toString());
    }
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });
    if (!error) {
      const redirectUrl = new URL(next, origin);
      redirectUrl.searchParams.set("confirmed", "true");
      return NextResponse.redirect(redirectUrl.toString());
    }
  }

  // If user is already authenticated or params are missing, redirect safely
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return NextResponse.redirect(new URL(next, origin).toString());
  }

  return NextResponse.redirect(new URL("/login", origin).toString());
}

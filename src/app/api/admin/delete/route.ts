import { NextRequest, NextResponse } from "next/server";
import { deleteAdminItem } from "@/app/actions/admin-delete";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await deleteAdminItem(body);

    if (!result.success) {
      const status = result.error?.toLowerCase().includes("unauthenticated")
        ? 401
        : result.error?.toLowerCase().includes("unauthorized")
        ? 403
        : 400;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

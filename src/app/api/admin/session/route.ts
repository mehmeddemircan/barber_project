import { NextResponse } from "next/server";
import {
  clearAdminSessionCookie,
  createAdminSessionCookie,
  getAdminAuthConfig,
  verifyAdminPassword,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const config = getAdminAuthConfig();
  if (!config) {
    console.error("Admin authentication is not configured.");
    return NextResponse.json({ message: "Admin access is not configured." }, { status: 503 });
  }

  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  }

  let payload: { password?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  if (typeof payload.password !== "string" || !verifyAdminPassword(payload.password, config.password)) {
    return NextResponse.json({ message: "Incorrect password." }, { status: 401 });
  }

  return NextResponse.json(
    { authenticated: true },
    {
      headers: {
        "Cache-Control": "no-store",
        "Set-Cookie": createAdminSessionCookie(config),
      },
    },
  );
}

export async function DELETE() {
  return NextResponse.json(
    { authenticated: false },
    {
      headers: {
        "Cache-Control": "no-store",
        "Set-Cookie": clearAdminSessionCookie(),
      },
    },
  );
}

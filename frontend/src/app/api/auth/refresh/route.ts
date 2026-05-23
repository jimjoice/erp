import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json({ detail: "Sessão expirada" }, { status: 401 });
  }

  const apiRes = await fetch(`${BACKEND_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!apiRes.ok) {
    const response = NextResponse.json(
      { detail: "Sessão inválida" },
      { status: 401 }
    );
    response.cookies.delete("refresh_token");
    return response;
  }

  const data = await apiRes.json();

  const response = NextResponse.json({
    user: data.user,
    accessToken: data.accessToken,
    expiresIn: data.expiresIn,
  });

  response.cookies.set("refresh_token", data.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}

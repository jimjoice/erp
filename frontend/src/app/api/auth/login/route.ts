import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";

export async function POST(request: Request) {
  const body = await request.json();

  const apiRes = await fetch(`${BACKEND_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!apiRes.ok) {
    const error = await apiRes.json().catch(() => ({}));
    return NextResponse.json(error, { status: apiRes.status });
  }

  const data = await apiRes.json();

  const response = NextResponse.json({
	user: data.usuario,        // ← era data.user
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

import type { AuthResponse } from "@/types/api";

type AuthSession = Pick<AuthResponse, "user" | "accessToken" | "expiresIn">;

async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw Object.assign(new Error("Request failed"), { status: res.status, data: error });
  }
  return res.json();
}

export const authService = {
  login: (email: string, senha: string) =>
    post<AuthSession>("/api/auth/login", { email, senha }),

  logout: () => post<{ success: boolean }>("/api/auth/logout"),

  refresh: () => post<AuthSession>("/api/auth/refresh"),
};

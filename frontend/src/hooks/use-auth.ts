"use client";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

const TOKEN_COOKIE = "erp-token";
const REFRESH_COOKIE = "erp-refresh-token";

function setCookie(name: string, value: string) {
  const secure = window.location.protocol === "https:" ? ";Secure" : "";
  document.cookie = `${name}=${value};path=/;SameSite=Lax${secure}`;
}

function removeCookies() {
  console.trace("REMOVE COOKIES CHAMADO");
  document.cookie = `${TOKEN_COOKIE}=;path=/;max-age=0`;
  document.cookie = `${REFRESH_COOKIE}=;path=/;max-age=0`;
}

function getTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(TOKEN_COOKIE + "="));
  return match ? match.split("=")[1] : null;
}

export function useAuth() {
  const { setAuth, clearAuth, isAuthenticated } = useAuthStore();
  const router = useRouter();

  async function login(email: string, senha: string) {
	  const res = await fetch("http://localhost:5000/api/v1/auth/login", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, senha }),
	  });

	  if (!res.ok) throw new Error("Credenciais inválidas");

	  const data = await res.json();

		setCookie(TOKEN_COOKIE, data.accessToken);
		setCookie(REFRESH_COOKIE, data.refreshToken);
		setAuth(data.accessToken, data.usuario);

		console.log("COOKIES ANTES DO PUSH:", document.cookie);

		// Delay de 5 segundos para inspecionar antes do redirect
		await new Promise((resolve) => setTimeout(resolve, 5000));

		console.log("COOKIES ANTES DO PUSH 2:", document.cookie);

		router.push("/dashboard");
	}

  async function refresh(): Promise<boolean> {
    if (isAuthenticated) return true;

    const token = getTokenFromCookie();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      if (payload.exp * 1000 < Date.now()) {
        removeCookies();
        return false;
      }

      setAuth(token, {
        id: payload.sub,
        nome: payload.nome,
        email: payload.email,
        perfil: payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
      });

      return true;
    } catch {
      removeCookies();
      return false;
    }
  }

  async function logout() {
    removeCookies();
    clearAuth();
    router.push("/login");
    router.refresh();
  }

  return { login, logout, refresh, isAuthenticated };
}
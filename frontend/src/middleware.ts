import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Não faz nada — proteção de rotas é responsabilidade do AuthGuard no cliente
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
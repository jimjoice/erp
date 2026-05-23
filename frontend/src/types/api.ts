export interface PaginatedResponse<T> {
  page: number;
  pageSize: number;
  total: number;
  items: T[];
}

export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  errors?: Record<string, string[]>;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    nome: string;
    email: string;
    perfil: "Admin" | "Gerente" | "Vendedor" | "Financeiro";
  };
}

export type UserPerfil = "Admin" | "Gerente" | "Vendedor" | "Financeiro";

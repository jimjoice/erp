# Passo 6.2 — Autenticação

## Arquivos criados (6)

| Arquivo | Responsabilidade |
|---|---|
| `src/middleware.ts` | Proteção server-side: redireciona `/login` → `/dashboard` se autenticado; rotas privadas → `/login` se sem cookie |
| `src/app/api/auth/login/route.ts` | Proxy login → backend; define `refresh_token` em **httpOnly cookie** |
| `src/app/api/auth/logout/route.ts` | Notifica backend + apaga cookie `refresh_token` |
| `src/app/api/auth/refresh/route.ts` | Lê cookie httpOnly (inacessível ao JS), retorna novo `accessToken` |
| `src/hooks/use-auth.ts` | Hook `useAuth()` — `login`, `logout`, `refresh` + state do store |
| `src/app/(auth)/layout.tsx` | Layout das rotas públicas de autenticação |

## Arquivos modificados (5)

- **`auth-store.ts`** — removido `persist` (localStorage); agora só memória: `accessToken`, `user`, `isAuthenticated`, `setAuth`, `clearAuth`
- **`auth-service.ts`** — usa `fetch` nativo com rotas relativas `/api/auth/*` (não mais Axios com baseURL do backend)
- **`lib/axios.ts`** — interceptor 401 chama `/api/auth/refresh` via `fetch` em vez de chamar o backend diretamente
- **`auth-guard.tsx`** — no mount, tenta `refresh()` (troca o httpOnly cookie por access token); mostra spinner enquanto inicializa
- **`login/page.tsx`** — usa `useAuth().login` em vez de `authService` + Zustand manualmente

## Fluxo completo

```
1. Login     → POST /api/auth/login (Next.js) → backend → seta httpOnly cookie
2. Navegação → Middleware lê cookie no servidor → permite ou redireciona
3. Page load → AuthGuard chama refresh() → POST /api/auth/refresh → cookie → novo accessToken em memória
4. API calls → Axios lê accessToken do Zustand → header Authorization: Bearer ...
5. 401       → Interceptor chama /api/auth/refresh → atualiza memória → retry automático
6. Logout    → DELETE cookie + clearAuth() + redirect /login
```

## Decisões de arquitetura

### Por que httpOnly cookies para o refresh token?

O `refresh_token` tem vida longa (7 dias) e permite obter novos `accessToken`s. Guardá-lo em `localStorage` o expõe a ataques XSS — qualquer script injetado na página pode roubá-lo. Com `httpOnly`, o browser envia o cookie automaticamente mas nenhum JavaScript consegue lê-lo.

### Por que o accessToken fica só em memória (Zustand sem persist)?

O `accessToken` tem vida curta (geralmente 15 min). Guardá-lo em `localStorage` também o expõe a XSS. Em memória, ele some ao fechar/recarregar a aba — o `AuthGuard` resolve isso fazendo um `refresh()` automático no mount, trocando o httpOnly cookie por um novo access token.

### Por que Route Handlers internos (`/api/auth/*`)?

Os cookies `httpOnly` só podem ser **criados e lidos no servidor**. As Route Handlers do Next.js rodam server-side, conseguem setar cookies na resposta e ler cookies da requisição. O client nunca precisa tocar no `refresh_token` diretamente.

### Por que `fetch` nativo no `auth-service.ts`?

O Axios está configurado com `baseURL` apontando para o backend externo. As rotas de auth são internas ao Next.js (`/api/auth/*`), portanto uma URL relativa com `fetch` é mais limpa do que criar uma segunda instância Axios ou sobrescrever a baseURL.

## Variáveis de ambiente

```env
# .env.local (frontend)
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# Opcional: URL interna do backend para os Route Handlers (ex: Docker network)
BACKEND_URL=http://backend:5000/api/v1
```

> **Nota:** `BACKEND_URL` é útil em ambientes Docker onde o frontend e o backend se comunicam por rede interna, mas a URL pública (`NEXT_PUBLIC_API_URL`) é diferente da URL interna.

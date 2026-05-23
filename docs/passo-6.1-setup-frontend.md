# Passo 6.1 — Setup do Frontend

## O que foi criado

**26 arquivos**, build sem erros (`npm run build` ✓, `tsc --noEmit` ✓).

---

### Configuração

| Arquivo | Função |
|---|---|
| `package.json` | 509 pacotes instalados |
| `next.config.ts` | `output: standalone` para Docker |
| `tailwind.config.ts` | Tema shadcn/ui com CSS vars + cores `sidebar-*` |
| `components.json` | shadcn CLI config |
| `.env.local` | `NEXT_PUBLIC_API_URL` apontando para o backend |

---

### Core (`src/lib/` e `src/store/`)

- **`axios.ts`** — interceptor de request (attach `Bearer`) + interceptor de response (refresh automático, race-condition safe com fila de subscribers)
- **`query-client.ts`** — `getQueryClient()` SSR-safe (singleton no browser, novo no servidor)
- **`auth-store.ts`** — Zustand com `persist` em localStorage: `accessToken`, `refreshToken`, `user`, `logout()`

---

### Layout (`src/components/layout/`)

- **`app-sidebar.tsx`** — sidebar dark fixa no desktop (w-64), com submenu colapsável de Cadastros, perfil do usuário e botão de logout
- **`header.tsx`** — header com Sheet (drawer) para mobile

---

### Rotas

```
/           → redirect para /dashboard
/login      → form React Hook Form + Zod
/dashboard  → cards de resumo (faturamento, vendas, estoque, clientes)
```

---

### Proteção de rotas

`AuthGuard` aguarda a hydration do Zustand (localStorage) antes de redirecionar — sem flash de conteúdo.

---

## Próximo passo

**Passo 6.2** — Módulo Cadastros (listagem e CRUD de Produtos, Clientes, Fornecedores).

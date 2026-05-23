# Passo 5 — Integrar no Layout Principal

## Resultado

**Nenhuma alteração necessária.** O Passo 5 já estava completo ao fim do Passo 4.

---

## Por que não foi necessário alterar nada

### Cadeia de renderização atual

```
RootLayout (app/layout.tsx)
  └── <Providers> (components/providers.tsx)
        └── <QueryClientProvider>
              ├── {children}
              ├── <ChatWidget />   ← adicionado no Passo 4
              └── <ReactQueryDevtools />
```

O `ChatWidget` já está presente em todas as páginas da aplicação via `providers.tsx`, que por sua vez é incluído no `RootLayout`.

---

### Guarda de autenticação já implementada

O `ChatWidget` tem verificação própria na primeira linha do componente:

```tsx
// components/chat/ChatWidget.tsx
const { isAuthenticated } = useAuthStore();
if (!isAuthenticated) return null;
```

Isso garante que o widget **não renderiza nada** nas páginas públicas (ex: `/login`), atendendo exatamente ao requisito "só deve aparecer quando o usuário estiver logado".

---

### Por que NÃO adicionar no DashboardLayout

O arquivo `app/(dashboard)/layout.tsx` é um **Server Component** (não tem `"use client"`):

```tsx
// app/(dashboard)/layout.tsx — Server Component
export default function DashboardLayout({ children }) {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
```

Adicionar `<ChatWidget />` aqui causaria **dois problemas**:

1. **Server Component não pode chamar `useAuthStore`** — hooks Zustand só funcionam em Client Components
2. **Fora do `QueryClientProvider`** — o widget estaria fora do contexto do React Query, quebrando `useChatHistorico` e `useChatEnviar`

---

## Resumo

| Requisito | Status | Onde está implementado |
|---|---|---|
| Importar e adicionar `<ChatWidget />` | Feito | `components/providers.tsx` |
| Só aparecer quando logado | Feito | `if (!isAuthenticated) return null` no próprio `ChatWidget` |
| Verificar pela store Zustand | Feito | `const { isAuthenticated } = useAuthStore()` no `ChatWidget` |
| Dentro do `QueryClientProvider` | Feito | `providers.tsx` monta o widget dentro do provider |

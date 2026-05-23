# Passo 4 — Frontend: Componente Chat Flutuante

## Resumo das alterações

### 7 arquivos criados/modificados

| Arquivo | O que faz |
|---|---|
| `types/chat.ts` | 4 tipos: `ChatMensagem`, `ChatHistoricoResponse`, `EnviarMensagemRequest`, `EnviarMensagemResponse` |
| `services/chat-service.ts` | 3 chamadas Axios: `historico`, `enviarMensagem`, `encerrarSessao` |
| `hooks/use-chat-historico.ts` | `useQuery` com `enabled: isAuthenticated`, `staleTime: Infinity` (cache permanente) |
| `hooks/use-chat-enviar.ts` | `useMutation` com update otimista: mensagem do usuário aparece imediatamente; rollback em caso de erro |
| `components/chat/ChatPanel.tsx` | Painel completo: skeleton de carregamento, bolhas com alinhamento/cores, indicador "digitando..." animado (3 pontos com `animationDelay`), textarea com Enter/Shift+Enter, auto-scroll |
| `components/chat/ChatWidget.tsx` | FAB fixo `left-6 bottom-6 z-[9999]`, badge de não lidas, `slide-in-from-bottom-4` na abertura, mobile 100% da tela via `max-sm:fixed max-sm:inset-0` |
| `components/providers.tsx` | Adicionado `<ChatWidget />` após `{children}` — dentro do `QueryClientProvider` |

---

## Detalhamento por arquivo

### `src/types/chat.ts`

Tipos TypeScript do domínio de chat:

```typescript
export type OrigemMensagem = "Usuario" | "Agente";
export type StatusEntregaMensagem = "Enviada" | "Processando" | "Entregue" | "Erro";

export interface ChatMensagem { ... }
export interface ChatHistoricoResponse { sessaoId, mensagens }
export interface EnviarMensagemRequest { conteudo }
export type EnviarMensagemResponse = ChatMensagem;
```

---

### `src/services/chat-service.ts`

Chamadas via instância Axios pré-configurada (token JWT automático):

- `historico()` → `GET /chat/historico`
- `enviarMensagem(dto)` → `POST /chat/mensagem`
- `encerrarSessao()` → `POST /chat/sessao/encerrar`

---

### `src/hooks/use-chat-historico.ts`

Hook React Query para buscar o histórico:

- `queryKey: ["chat", "historico"]` — chave compartilhada entre `ChatWidget` e `ChatPanel`
- `enabled: isAuthenticated` — só dispara quando o usuário está autenticado
- `staleTime: Infinity` — cache permanente; atualizações gerenciadas via mutations

---

### `src/hooks/use-chat-enviar.ts`

Hook de mutação com **update otimista**:

1. `onMutate` — cancela queries pendentes, adiciona mensagem do usuário com ID temporário (`opt-{timestamp}`) imediatamente na lista
2. `onSuccess` — appenda a mensagem do agente retornada pela API ao cache
3. `onError` — reverte o cache para o estado anterior (`context.prev`)

O mesmo `queryKey: ["chat", "historico"]` garante que React Query deduplique a requisição e ambos os componentes (`ChatWidget` e `ChatPanel`) vejam os dados atualizados.

---

### `src/components/chat/ChatPanel.tsx`

Painel de chat com:

- **Cabeçalho** — ícone `Bot` + "Assistente ERP" + botão fechar (X)
- **Área de mensagens** com `ref` para auto-scroll ao fim sempre que `data.mensagens.length` ou `isPending` muda
- **Skeleton** de carregamento (3 barras animadas com `animate-pulse`) enquanto `isLoading`
- **Estado vazio** — ícone + texto "Como posso ajudar você hoje?"
- **`MessageBubble`** — bolha alinhada à direita (usuário: fundo azul, texto branco) ou à esquerda (agente: fundo `bg-muted`, texto `text-foreground`); timestamp formatado `HH:mm`
- **`TypingIndicator`** — 3 pontos com `animate-bounce` e `animationDelay` de 0ms / 150ms / 300ms, visível enquanto `isPending`
- **Mensagem de erro** inline quando `isError`
- **Input** — `<textarea>` com `resize-none`, `max-h-32`; Enter envia, Shift+Enter quebra linha; desabilitado durante `isPending`
- **Botão enviar** — desabilitado quando input vazio ou `isPending`

---

### `src/components/chat/ChatWidget.tsx`

Botão flutuante (FAB) com painel:

- **Posição** — `fixed bottom-6 left-6 z-[9999]` (sobre todos os elementos)
- **FAB** — botão circular `h-14 w-14` azul com `hover:scale-105 active:scale-95`
- **Badge de não lidas** — conta mensagens recebidas enquanto o painel estava fechado (`totalMsgs - lastSeenCount`); zera ao abrir; exibe `9+` quando > 9
- **Painel**
  - Desktop: `w-[360px] h-[520px] rounded-2xl`
  - Mobile: `max-sm:fixed max-sm:inset-0 max-sm:w-full max-sm:h-full max-sm:rounded-none` (tela inteira)
  - Animação de entrada: `animate-in slide-in-from-bottom-4 fade-in-0 duration-200 ease-out`
- **Autenticação** — `if (!isAuthenticated) return null` — sem renderização no servidor (componente `"use client"`)

---

### `src/components/providers.tsx`

```tsx
<QueryClientProvider client={queryClient}>
  {children}
  <ChatWidget />          {/* adicionado */}
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

`ChatWidget` é montado dentro do `QueryClientProvider` para ter acesso ao React Query.

---

## Comportamentos-chave

- **Sem flash no SSR** — `ChatWidget` é `"use client"` e retorna `null` se não autenticado; nunca renderiza no servidor
- **Update otimista** — mensagem do usuário entra na lista imediatamente, antes da resposta do n8n
- **Rollback automático** — em timeout ou erro, o cache reverte e exibe mensagem amigável inline
- **Cache compartilhado** — `ChatWidget` (badge) e `ChatPanel` (lista) usam o mesmo `queryKey`; React Query faz uma única requisição
- **Responsivo** — painel em 360×520 no desktop, tela inteira no mobile

---

## Resultado da verificação TypeScript

```
npx tsc --noEmit  →  0 erros, 0 warnings
```

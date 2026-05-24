# Chat — Suporte a Respostas com Gráficos (n8n)

## Objetivo

Estender o módulo de chat para que o agente n8n possa retornar, além de texto simples, dados estruturados que o frontend renderiza como gráficos interativos (Recharts). A interpretação do tipo de resposta é responsabilidade exclusiva do frontend; o backend repassa o JSON do n8n sem modificação.

---

## Arquitetura da solução

```
n8n webhook
    │
    │  JSON: { "type": "chart", "chartType": "bar", ... }
    │       ou { "type": "text", "content": "..." }
    │       ou string simples (compatibilidade retroativa)
    ▼
ChatService.cs (backend)
    │  salva conteúdo bruto em ChatMensagem.Conteudo
    │  sem parse — repassa como string
    ▼
GET /api/v1/chat/historico  /  POST /api/v1/chat/mensagem
    │
    ▼
parseMensagem() — helper TypeScript
    │  tenta JSON.parse(conteudo)
    │  → type "chart"  : adiciona tipo + chartData
    │  → type "text"   : usa content como conteudo
    │  → falha no parse: trata como texto simples
    ▼
ChatPanel.tsx
    │  mensagem.tipo === "chart"  → <ChatChart data={chartData} />
    │  mensagem.tipo === "text"   → bolha de texto normal
```

---

## Contrato de dados (n8n → frontend)

O webhook do n8n pode retornar qualquer um dos três formatos abaixo:

```json
// Gráfico
{
  "type": "chart",
  "chartType": "bar" | "line" | "pie",
  "title": "Título do gráfico",
  "labels": ["Jan", "Fev", "Mar"],
  "values": [100, 200, 150]
}

// Texto estruturado
{
  "type": "text",
  "content": "Resposta em texto livre"
}

// Texto simples (compatibilidade retroativa)
"Resposta em texto livre"
```

---

## Arquivos modificados

### 1. `frontend/src/types/chat.ts`

**O que mudou:** Adição dos novos tipos e do helper `parseMensagem`.

**Novos tipos exportados:**

| Tipo | Descrição |
|------|-----------|
| `ChatResponseText` | `{ type: "text"; content: string }` |
| `ChatResponseChart` | `{ type: "chart"; chartType; title; labels[]; values[] }` |
| `ChatResponse` | União de `ChatResponseText \| ChatResponseChart` |

**Interface `ChatMensagem` — campos adicionados:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `tipo` | `"text" \| "chart"` (opcional) | Resultado do parse |
| `chartData` | `ChatResponseChart` (opcional) | Dados do gráfico quando `tipo === "chart"` |

**Helper `parseMensagem(msg)`:**

Recebe um `ChatMensagem` e retorna outro com `tipo` e `chartData` preenchidos:
- Mensagens de usuário → `tipo: "text"` (sem parse)
- Mensagens do agente → tenta `JSON.parse(conteudo)`:
  - `type === "chart"` → `{ tipo: "chart", chartData: parsed }`
  - `type === "text"` → `{ tipo: "text", conteudo: parsed.content }`
  - Parse falha → `{ tipo: "text" }` (conteudo original mantido)

---

### 2. `frontend/src/hooks/use-chat-enviar.ts`

**O que mudou:** `onSuccess` agora chama `parseMensagem` antes de armazenar a resposta do agente no cache React Query.

```ts
// antes
onSuccess: (agentMsg) => {
  qc.setQueryData(..., { ...current, mensagens: [..., agentMsg] });
}

// depois
onSuccess: (agentMsg) => {
  const parsed = parseMensagem(agentMsg);
  qc.setQueryData(..., { ...current, mensagens: [..., parsed] });
}
```

A mensagem otimista do usuário recebe `tipo: "text"` explicitamente para consistência.

---

### 3. `frontend/src/hooks/use-chat-historico.ts`

**O que mudou:** Adição da opção `select` no `useQuery` para aplicar `parseMensagem` a todas as mensagens ao carregar o histórico do servidor.

```ts
select: (data) => ({
  ...data,
  mensagens: data.mensagens.map(parseMensagem),
}),
```

Isso garante que mensagens de gráfico enviadas em sessões anteriores também sejam renderizadas corretamente ao reabrir o chat.

---

### 4. `frontend/src/components/chat/ChatChart.tsx` *(novo)*

Componente Recharts que recebe um `ChatResponseChart` e renderiza o gráfico adequado.

**Tipos de gráfico suportados:**

| `chartType` | Componente Recharts | Características |
|-------------|---------------------|-----------------|
| `"bar"` | `BarChart` + `Bar` | Barras com `radius`, cores individuais por `Cell` |
| `"line"` | `LineChart` + `Line` | Linha monotone com `dot` visível |
| `"pie"` | `PieChart` + `Pie` | Pizza com legenda na base |

**Estilo:**
- `ResponsiveContainer` 100% × 220px
- Fundo transparente, sem borda própria
- Título em `text-xs font-semibold` acima do gráfico
- Tooltip com valores formatados via `toLocaleString("pt-BR")` (ex: `1.200`)
- Paleta de 6 cores acessíveis: azul, verde, âmbar, vermelho, violeta, rosa

```ts
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
```

---

### 5. `frontend/src/components/chat/ChatPanel.tsx`

**O que mudou:** `MessageBubble` agora verifica `mensagem.tipo` para decidir o que renderizar.

```tsx
// bolha de gráfico — fundo branco com borda sutil
{isChart && mensagem.chartData ? (
  <div className="w-full max-w-[90%] rounded-2xl rounded-bl-sm border bg-white px-4 py-3 shadow-sm">
    <ChatChart data={mensagem.chartData} />
  </div>
) : (
  // bolha de texto — comportamento original mantido
  <div className={cn("max-w-[80%] rounded-2xl ...", ...)}>
    <p>{mensagem.conteudo}</p>
  </div>
)}
```

Diferença visual entre os dois tipos de bolha do agente:

| | Texto | Gráfico |
|---|-------|---------|
| Fundo | `bg-muted` (cinza) | `bg-white` (branco) |
| Borda | nenhuma | `border shadow-sm` |
| Largura máx | 80% | 90% |

---

### 6. `backend/src/ERP.Application/Chat/ChatService.cs`

**Sem alterações.** O serviço já salvava o retorno do n8n (`respostaTexto`) diretamente no campo `Conteudo` da `ChatMensagem` sem parse. O JSON do n8n é armazenado como string e repassado ao frontend pela API — comportamento correto e suficiente.

---

## Como testar

### Teste com Swagger

`POST /api/v1/chat/mensagem`
```json
{ "conteudo": "mostre um gráfico de teste" }
```

### Configuração temporária no n8n

No nó de resposta do webhook, retorne:

```json
{
  "type": "chart",
  "chartType": "bar",
  "title": "Vendas por mês",
  "labels": ["Jan", "Fev", "Mar", "Abr"],
  "values": [100, 200, 150, 300]
}
```

O frontend receberá o JSON como `conteudo` da mensagem do agente, `parseMensagem` identificará `type: "chart"` e o `ChatPanel` renderizará o `BarChart`.

### Variações para testar os três tipos

```json
// Gráfico de linha
{ "type": "chart", "chartType": "line", "title": "Fluxo de caixa", "labels": ["Seg", "Ter", "Qua", "Qui", "Sex"], "values": [500, 320, 680, 410, 750] }

// Gráfico de pizza
{ "type": "chart", "chartType": "pie", "title": "Formas de pagamento", "labels": ["Dinheiro", "Cartão", "PIX"], "values": [30, 45, 25] }

// Texto estruturado
{ "type": "text", "content": "Aqui está o resumo do dia." }

// Texto simples (compatibilidade retroativa)
"Resposta em texto livre sem JSON"
```

---

## Compatibilidade retroativa

Mensagens antigas no banco (texto simples, sem JSON) continuam funcionando: `parseMensagem` tentará `JSON.parse`, falhará silenciosamente e retornará `{ tipo: "text" }` com o `conteudo` original intacto.

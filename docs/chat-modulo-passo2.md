# Módulo Chat — Passo 2: Backend (Application + Infrastructure — Serviço com n8n)

## O que foi criado

---

### ERP.Application/Chat (5 novos arquivos)

| Arquivo | Responsabilidade |
|---|---|
| `ChatDto.cs` | Records `ChatSessaoDto` e `ChatMensagemDto` |
| `IN8nWebhookClient.cs` | Interface que o Infrastructure implementa (Clean Architecture) |
| `IChatService.cs` | Contrato público com os 3 métodos |
| `ChatService.cs` | Implementação com lógica completa de sessão + webhook |
| `ChatProfile.cs` | Mapeamento AutoMapper (enums → string) |

---

### IChatService — Métodos públicos

```csharp
Task<Result<ChatSessaoDto>>       ObterOuCriarSessaoAsync(Guid usuarioId, CancellationToken ct = default);
Task<Result<List<ChatMensagemDto>>> ObterHistoricoAsync(Guid sessaoId, CancellationToken ct = default);
Task<Result<ChatMensagemDto>>     EnviarMensagemAsync(Guid usuarioId, string conteudo, CancellationToken ct = default);
```

---

### ChatService — Fluxo de EnviarMensagemAsync

1. Busca sessão `Ativa` do usuário — cria nova se não existir
2. Persiste mensagem do usuário com `Origem = Usuario`, `StatusEntrega = Enviada`
3. Atualiza status para `Processando` antes de chamar o n8n
4. Chama `N8nWebhookClient.EnviarMensagemAsync` com **timeout de 30 segundos** via `CancellationTokenSource.CreateLinkedTokenSource`
5. **Sucesso:** cria mensagem do agente com `StatusEntrega = Entregue` e `TempoRespostaMs` calculado
6. **Timeout (30 s):** marca mensagem do usuário como `Erro`, cria mensagem do agente com texto amigável e `StatusEntrega = Erro`
7. **Erro HTTP:** mesmo tratamento do timeout
8. **Cancelamento do cliente** (`ct.IsCancellationRequested`): propaga `OperationCanceledException` sem salvar estado parcial
9. Retorna a mensagem do agente (sucesso ou erro)

---

### IN8nWebhookClient (interface em Application)

```csharp
Task<string> EnviarMensagemAsync(string mensagem, Guid usuarioId, Guid sessaoId, CancellationToken ct = default);
```

Interface definida em `ERP.Application` para que `ChatService` não dependa de `ERP.Infrastructure` — respeita Clean Architecture.

---

### ERP.Infrastructure/ExternalServices/N8nWebhookClient.cs

- Implementa `IN8nWebhookClient` como cliente HTTP tipado
- Lê a URL de `IConfiguration["N8n:WebhookUrl"]` no construtor (fail-fast)
- **Payload enviado ao n8n:**
  ```json
  {
    "mensagem": "...",
    "usuarioId": "...",
    "sessaoId": "...",
    "timestamp": "2026-05-23T01:10:00.000Z"
  }
  ```
- **Resposta esperada do n8n:**
  ```json
  { "resposta": "..." }
  ```
- Desserialização via `[JsonPropertyName("resposta")]` (case-sensitive)

---

### Arquivos atualizados

| Arquivo | Alteração |
|---|---|
| `ERP.Application/DependencyInjection.cs` | `AddScoped<IChatService, ChatService>()` |
| `ERP.Infrastructure/DependencyInjection.cs` | `AddHttpClient<IN8nWebhookClient, N8nWebhookClient>()` com `Timeout = InfiniteTimeSpan` |
| `ERP.Infrastructure/ERP.Infrastructure.csproj` | Adicionado `Microsoft.Extensions.Http 10.0.0` |
| `appsettings.json` | Seção `"N8n": { "WebhookUrl": "http://localhost:5678/webhook/erp-chat" }` |
| `.env` e `.env.example` | `N8n__WebhookUrl=http://localhost:5678/webhook/erp-chat` (duplo underscore = chave hierárquica) |

---

### Resultado do build

```
Compilação com êxito.
    0 Aviso(s)
    0 Erro(s)
```

---

## Próximos passos

- **Passo 3** — API: endpoints Minimal API em `/api/v1/chat` (obter sessão, histórico, enviar mensagem)
- **Passo 4** — Frontend: componente de chat com React Query + Zustand + WebSocket ou polling

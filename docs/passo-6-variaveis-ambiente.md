# Passo 6 — Variáveis de Ambiente

## Resultado

3 arquivos atualizados. Apenas `TimeoutSegundos` foi adicionado — o webhook URL já existia com a nomenclatura correta.

---

## Por que `N8n__WebhookUrl` e não `N8N_WEBHOOK_URL`

O .NET lê variáveis de ambiente substituindo `__` (duplo underscore) por `:` para mapear seções do JSON de configuração:

```
N8n__WebhookUrl     →  configuration["N8n:WebhookUrl"]   ✔  funciona
N8N_WEBHOOK_URL     →  configuration["N8N_WEBHOOK_URL"]  ✘  não casa
```

O `N8nWebhookClient` já usa `configuration["N8n:WebhookUrl"]`, portanto a convenção `N8n__*` estava correta e não foi alterada.

---

## O que foi alterado

### `backend/src/ERP.API/appsettings.json`

```json
"N8n": {
  "WebhookUrl": "http://localhost:5678/webhook/erp-chat",
  "TimeoutSegundos": 30
}
```

Adicionado `"TimeoutSegundos": 30` à seção existente.

---

### `.env`

```dotenv
# ── n8n (agente de chat) ──────────────────────────────────────────────────────
# URL do webhook do n8n que recebe as mensagens do chat
# Exemplo local: http://localhost:5678/webhook/erp-chat
# Em produção: https://seu-n8n.com/webhook/SEU_ID_AQUI
N8n__WebhookUrl=http://localhost:5678/webhook/erp-chat
# Tempo máximo de espera pela resposta do agente (segundos)
N8n__TimeoutSegundos=30
```

---

### `.env.example`

Idêntico ao `.env` — mantido em sincronia para que novos desenvolvedores saibam quais variáveis configurar.

---

## Resumo das alterações

| Arquivo | Antes | Depois |
|---|---|---|
| `appsettings.json` | `WebhookUrl` apenas | + `"TimeoutSegundos": 30` |
| `.env` | `N8n__WebhookUrl` apenas | + `N8n__TimeoutSegundos=30` |
| `.env.example` | `N8n__WebhookUrl` apenas | + `N8n__TimeoutSegundos=30` |

---

## Observação — TimeoutSegundos ainda hardcoded no ChatService

O valor `TimeoutSegundos` está presente no config mas o `ChatService` ainda usa o literal `30`:

```csharp
// ChatService.cs — linha atual
timeoutCts.CancelAfter(TimeSpan.FromSeconds(30));
```

Para torná-lo dinâmico, basta injetar `IConfiguration` (ou uma options class via `IOptions<N8nOptions>`) no `ChatService` e ler `configuration.GetValue<int>("N8n:TimeoutSegundos", 30)`.

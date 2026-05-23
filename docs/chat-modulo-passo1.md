# Módulo Chat — Passo 1: Backend (Domain + Infrastructure)

## O que foi criado

---

### ERP.Domain/Enums (3 novos arquivos)

| Arquivo | Valores |
|---|---|
| `StatusSessaoChat.cs` | `Ativa = 1`, `Encerrada = 2` |
| `OrigemMensagem.cs` | `Usuario = 1`, `Agente = 2` |
| `StatusEntregaMensagem.cs` | `Enviada = 1`, `Processando = 2`, `Entregue = 3`, `Erro = 4` |

---

### ERP.Domain/Entities (2 novos arquivos)

#### `ChatSessao`
- Herda de `BaseEntity`
- Propriedades: `UsuarioId` (Guid), `Titulo` (string max 200), `Status` (StatusSessaoChat), `TotalMensagens` (int)
- Navegação: `Mensagens` (IReadOnlyList\<ChatMensagem\>)
- `Create()` — gera título automático `"Conversa de dd/MM/yyyy HH:mm"` (UTC)
- `AlterarTitulo(titulo, atualizadoPor)` — impede alteração em sessões encerradas
- `Encerrar(atualizadoPor)` — transição de status, idempotência garantida
- `IncrementarTotalMensagens(atualizadoPor)` — chamado internamente pelo serviço ao persistir mensagens

#### `ChatMensagem`
- Herda de `BaseEntity`
- Propriedades: `SessaoId` (Guid, FK), `Conteudo` (string max 4000), `Origem` (OrigemMensagem), `StatusEntrega` (StatusEntregaMensagem), `TempoRespostaMs` (int?, nullable)
- Navegação: `Sessao` (ChatSessao)
- `Create(sessaoId, conteudo, origem, criadoPor)` — inicia com `StatusEntrega = Enviada`
- `MarcarComoProcessando(atualizadoPor)`
- `MarcarComoEntregue(tempoRespostaMs, atualizadoPor)` — valida tempo ≥ 0
- `MarcarComoErro(atualizadoPor)`

---

### ERP.Infrastructure/Persistence (2 configurations + AppDbContext atualizado)

#### `ChatSessaoConfiguration`
- Tabela: `chat_sessoes`
- Índices: `usuario_id`, `status`, `deleted_at` (herdado)

#### `ChatMensagemConfiguration`
- Tabela: `chat_mensagens`
- FK para `chat_sessoes` com `DeleteBehavior.Restrict`
- Índices: `sessao_id`, `status_entrega`, `deleted_at` (herdado)

#### `AppDbContext`
```csharp
public DbSet<ChatSessao>   ChatSessoes   { get; set; } = null!;
public DbSet<ChatMensagem> ChatMensagens { get; set; } = null!;
```

---

### Migration

**Arquivo:** `20260523010104_AddChatModule.cs`

Cria as tabelas `chat_sessoes` e `chat_mensagens` com:
- Soft-delete (`deleted_at`)
- Audit trail completo (`created_at`, `updated_at`, `created_by`, `updated_by`)
- FK Restrict de `chat_mensagens` → `chat_sessoes`
- Todos os índices listados acima

---

## Próximos passos

- **Passo 2** — Application: DTOs, `IChatService`, `ChatService`, `ChatValidator`
- **Passo 3** — API: endpoints Minimal API em `/api/v1/chat`
- **Passo 4** — Frontend: componente de chat com React Query + Zustand

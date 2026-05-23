# Passo 3 — Backend: Endpoints da API de Chat

## Resumo das alterações

### Arquivos modificados — ERP.Application

#### `ChatDto.cs`
Adicionados dois novos records:

- `EnviarMensagemDto(string Conteudo)` — DTO de entrada para o endpoint `POST /mensagem`
- `HistoricoResponseDto(Guid SessaoId, List<ChatMensagemDto> Mensagens)` — DTO de resposta do endpoint `GET /historico`

---

#### `IChatService.cs`
Adicionada assinatura do novo método:

```csharp
Task<Result> EncerrarSessaoAsync(Guid usuarioId, CancellationToken ct = default);
```

---

#### `ChatService.cs`
Implementação de `EncerrarSessaoAsync`:

- Busca a sessão ativa do usuário
- Se existir, chama `sessao.Encerrar()` e salva
- Comportamento idempotente: sem sessão ativa também retorna 204
- Retorna `Result.Ok(204)`

---

#### `ChatValidator.cs` *(novo)*
Validator FluentValidation para `EnviarMensagemDto`:

- `Conteudo` obrigatório (`NotEmpty`)
- `Conteudo` máximo 4000 caracteres (`MaximumLength`)

---

### Arquivos criados/modificados — ERP.API

#### `ChatEndpoints.cs` *(novo)*
Três endpoints registrados no grupo `/api/v1/chat`, todos com `RequireAuthorization("Vendedor")`:

| Método | Rota | Descrição | Retorno |
|--------|------|-----------|---------|
| `GET` | `/api/v1/chat/historico` | Obtém ou cria sessão do usuário e retorna o histórico | `HistoricoResponseDto` |
| `POST` | `/api/v1/chat/mensagem` | Envia mensagem ao agente e retorna a resposta | `ChatMensagemDto` |
| `POST` | `/api/v1/chat/sessao/encerrar` | Encerra a sessão ativa do usuário | `204 No Content` |

**Destaques de implementação:**

- `usuarioId` extraído via `Guid.TryParse` da claim `sub` do JWT — retorna `401 ProblemDetails` se inválido
- `POST /mensagem` valida o DTO com `IValidator<EnviarMensagemDto>` antes de chamar o serviço
- `GET /historico` encadeia `ObterOuCriarSessaoAsync` + `ObterHistoricoAsync` e retorna o DTO combinado
- `POST /sessao/encerrar` é idempotente — sem sessão ativa retorna 204 sem erro

---

#### `Program.cs`
Adicionado `app.MapChat()` após `app.MapFinanceiro()` na seção de registro de endpoints.

---

## Resultado da compilação

```
Compilação com êxito.
    0 Aviso(s)
    0 Erro(s)
```

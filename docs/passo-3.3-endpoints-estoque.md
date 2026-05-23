# Passo 3.3 — Endpoints de estoque

## `ERP.API/Endpoints/EstoqueEndpoints.cs`

| Método | Rota | Auth | Resposta |
|---|---|---|---|
| GET | `/api/v1/estoque` | Vendedor | `200 IReadOnlyList<PosicaoEstoqueItemDto>` |
| GET | `/api/v1/estoque/alertas` | Vendedor | `200 IReadOnlyList<PosicaoEstoqueItemDto>` |
| GET | `/api/v1/estoque/movimentacoes` | Vendedor | `200 PagedResult<MovimentacaoEstoqueResponseDto>` |
| POST | `/api/v1/estoque/entrada` | Gerente | `200 MovimentacaoEstoqueResponseDto` |
| POST | `/api/v1/estoque/saida` | Gerente | `200 MovimentacaoEstoqueResponseDto` |
| POST | `/api/v1/estoque/inventario` | Gerente | `200 ResultadoAjusteInventarioDto` |

**Query params de `/movimentacoes`:** `produtoId?`, `tipo?` (enum `TipoMovimentacaoEstoque`), `dataInicio?`, `dataFim?`, `page` (def=1), `pageSize` (def=20)

**Padrão dos POSTs:** valida com FluentValidation → extrai `sub` do JWT como `criadoPor` → delega ao service → `ToHttpResult()`

## Adições em `ERP.Application/Estoque/`

`IEstoqueService` e `EstoqueService` ganharam `GetMovimentacoesAsync` com filtros opcionais — todos os `null` são ignorados no `WHERE`, produzindo a query mínima necessária.

## `Program.cs`

```csharp
app.MapEstoque();
```

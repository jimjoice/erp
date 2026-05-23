# Passo 4.3 — Endpoints de Vendas

Passo 4.3 concluído — 6 arquivos criados/atualizados, build limpo (0 erros, 0 avisos).

## O que foi criado / atualizado

| Arquivo | Alteração |
|---------|-----------|
| `Application/Interfaces/IVendaRepository.cs` | + `GetResumoDiaAsync(data)` → `(TotalVendido, QuantidadeVendas)` |
| `Application/Vendas/VendaDto.cs` | + `ResumoDiaDto(Data, QuantidadeVendas, TotalVendido, TicketMedio)` |
| `Application/Vendas/IVendaService.cs` | + `GetResumoDiaAsync()` |
| `Application/Vendas/VendaService.cs` | + implementação: calcula `TicketMedio = TotalVendido / QuantidadeVendas` |
| `API/Endpoints/VendasEndpoints.cs` | **novo** — 8 endpoints mapeados |
| `API/Program.cs` | + `app.MapVendas()` |

## Endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/v1/vendas/resumo-dia` | Vendedor | Total, ticket médio e qtd de vendas do dia (UTC) |
| `GET` | `/api/v1/vendas` | Vendedor | Listagem paginada com filtros |
| `GET` | `/api/v1/vendas/{id}` | Vendedor | Venda com itens e pagamentos |
| `POST` | `/api/v1/vendas` | Vendedor | Cria orçamento (com itens no payload) → 201 + Location |
| `POST` | `/api/v1/vendas/{id}/itens` | Vendedor | Adiciona item a orçamento existente |
| `DELETE` | `/api/v1/vendas/{id}/itens/{itemId}` | Vendedor | Remove item de orçamento |
| `POST` | `/api/v1/vendas/{id}/finalizar` | Vendedor | Confirma venda, debita estoque, gera contas a receber |
| `POST` | `/api/v1/vendas/{id}/cancelar` | Gerente | Cancela venda (≤24h), estorna estoque e contas abertas |

## Query params — `GET /api/v1/vendas`

| Param | Tipo | Descrição |
|-------|------|-----------|
| `status` | `StatusVenda?` | Orcamento / Confirmada / Cancelada |
| `clienteId` | `Guid?` | Filtra por cliente |
| `funcionarioId` | `Guid?` | Filtra por funcionário/vendedor |
| `dataInicio` | `DateTime?` | Data inicial |
| `dataFim` | `DateTime?` | Data final |
| `page` | `int` | Padrão: 1 |
| `pageSize` | `int` | Padrão: 20 |

## Decisões de design

- `GET /resumo-dia` registrado **antes** de `GET /{id:guid}` — evita ambiguidade de rota (desnecessário com o constraint `:guid`, mas boa prática)
- `POST /cancelar` requer perfil `Gerente` — cancelamento envolve estorno financeiro
- Todos os POSTs com body passam por `IValidator<T>` antes de chamar o serviço
- `TicketMedio` calculado na camada de serviço; o repositório retorna apenas `(TotalVendido, QuantidadeVendas)`

## Próximo passo sugerido

**4.4 — Infrastructure**: `VendaConfiguration` (EF Core Fluent API), `VendaRepository` (eager loading + `GetResumoDiaAsync`), `ContaReceberConfiguration`, sequence PostgreSQL para `Venda.Numero`, migrations.

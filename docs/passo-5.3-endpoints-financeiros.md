# Passo 5.3 — Endpoints Financeiros

## Novo arquivo

`ERP.API/Endpoints/FinanceiroEndpoints.cs`

| Método | Rota | Auth |
|--------|------|------|
| GET | `/api/v1/contas-receber` | Financeiro |
| POST | `/api/v1/contas-receber/{id}/baixar` | Financeiro |
| GET | `/api/v1/contas-pagar` | Financeiro |
| POST | `/api/v1/contas-pagar/{id}/baixar` | Financeiro |
| GET | `/api/v1/financeiro/fluxo-caixa?inicio=&fim=` | Financeiro |
| GET | `/api/v1/financeiro/resumo` | Financeiro |

## Arquivos expandidos

- `IFinanceiroService` + `FinanceiroService` — 3 novos métodos: `GetContasReceberAsync`, `GetContasPagarAsync`, `ResumoAsync`
- `FinanceiroDto` — `ResumoFinanceiroDto` com saldo atual e totais dos próximos 7 dias
- `Program.cs` — `app.MapFinanceiro()`

## Resultado do build

**0 erros, 0 warnings.**

# Passo 5.1 — Entidades Financeiras

## Arquivos criados

- `Enums/StatusContaPagar.cs` — Aberta/Paga/Vencida/Cancelada
- `Enums/TipoLancamentoCaixa.cs` — Entrada/Saida
- `Entities/ContaPagar.cs` — `Create()`, `Pagar()`, `MarcarVencida()`, `Cancelar()`
- `Entities/LancamentoCaixa.cs` — `Create()` com optional `ContaReceberId`/`ContaPagarId`

## Arquivos corrigidos

- `StatusContaReceber.cs` — adicionado `Vencida=3`, `Cancelada` movido para `4`
- `ContaReceber.cs` — `VendaId` agora `Guid?` (nullable, conforme spec)

## Resultado do build

**0 erros, 0 warnings.**

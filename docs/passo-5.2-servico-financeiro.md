# Passo 5.2 — Serviço Financeiro

## Arquivos criados

Foram criados 5 arquivos em `ERP.Application/Financeiro/`:

| Arquivo | O que faz |
|---|---|
| `FinanceiroDto.cs` | `BaixarContaDto` (input) + 5 response DTOs |
| `IFinanceiroService.cs` | Contrato com 4 métodos |
| `FinanceiroService.cs` | Implementação completa |
| `FinanceiroProfile.cs` | AutoMapper para `ContaPagar` e `LancamentoCaixa` |
| `FinanceiroValidator.cs` | Valida `DataPagamento` (não futura) e `ValorPago` (> 0) |

## Arquivos corrigidos

- `VendaDto.cs` — `VendaId` em `ContaReceberResponseDto` alterado de `Guid` para `Guid?`
- `DependencyInjection.cs` — registro de `IFinanceiroService → FinanceiroService`

## Detalhe de cada método

- **`BaixarContaReceber/Pagar`** — chama `conta.Pagar()`, cria `LancamentoCaixa` (Entrada ou Saída), salva em uma transação.
- **`FluxoCaixa`** — saldo inicial acumulado de todos os lançamentos antes do período + soma entradas/saídas do intervalo.
- **`ContasVencendo`** — retorna Aberta + Vencida com `DataVencimento ≤ hoje + dias`; inclui `DiasAteVencimento` (negativo = já vencida); carrega clientes/fornecedores em lote.

## Resultado do build

**0 erros, 0 warnings.**

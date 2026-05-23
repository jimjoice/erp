# Passo 4.1 — Entidades de Venda

Passo 4.1 concluído — 5 arquivos criados, build limpo (0 erros, 0 avisos).

## O que foi criado

| Arquivo | Conteúdo |
|---------|----------|
| `Enums/StatusVenda.cs` | `Orcamento=1`, `Confirmada=2`, `Cancelada=3` |
| `Enums/FormaPagamento.cs` | `Dinheiro`, `Debito`, `Credito`, `Pix`, `Crediario` |
| `Entities/ItemVenda.cs` | Filho do aggregate `Venda`; `Subtotal = (Qtd × Preco) - Desconto`; factory `internal` |
| `Entities/Pagamento.cs` | Filho do aggregate `Venda`; factory `internal` |
| `Entities/Venda.cs` | Aggregate root com todas as regras de negócio |

## Regras de domínio codificadas em `Venda`

- **Estoque**: `AdicionarItem` verifica `produto.EstoqueAtual >= quantidade` (o decremento real ocorre via `MovimentacaoEstoque` na Application ao confirmar)
- **Desconto máximo 30%**: `AplicarDesconto` recebe percentual (0.0–0.30) e lança exceção fora do intervalo
- **Cancelamento 24h**: `Cancelar` verifica `DataVenda.AddHours(24)` quando status é `Confirmada`
- **Parcelamento**: só `Credito` e `Crediario` aceitam `Parcelas > 1`

## Próximo passo sugerido

**4.2 — Migrations EF Core** para `vendas`, `itens_venda` e `pagamentos` (com sequence para `Numero`).

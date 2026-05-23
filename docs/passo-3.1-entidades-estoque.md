# Passo 3.1 — Entidades de estoque

## Domain — novo/alterado

| Arquivo | Mudança |
|---|---|
| `Enums/TipoMovimentacaoEstoque.cs` | Simplificado: `Entrada/Saida/Ajuste/Inventario` (era 7 valores compostos) |
| `Enums/MotivoMovimentacaoEstoque.cs` | **NOVO** — 10 razões agrupadas por faixa numérica (1-9 Entrada, 10-19 Saída, 20-29 Ajuste, 30-39 Inventário) |
| `Entities/MovimentacaoEstoque.cs` | **NOVO** — substitui `LancamentoEstoque` |
| `Entities/LancamentoEstoque.cs` | **REMOVIDO** |

## Regra de domínio central — `MovimentacaoEstoque.Criar()`

O método estático recebe o **objeto `Produto`** (não o Guid) e executa atomicamente:

1. Calcula `quantidadeResultante` com base em `Tipo` + `MotivoCodigo`
2. Lança `InvalidOperationException` se o resultado for negativo
3. Chama `produto.AtualizarEstoque(quantidadeResultante)` antes de retornar
4. Retorna a movimentação já vinculada ao produto

**Lógica de cálculo:**

| Tipo | MotivoCodigo | Efeito |
|---|---|---|
| `Entrada` | qualquer | soma |
| `Saida` | qualquer | subtrai (guard estoque negativo) |
| `Ajuste` | `AjusteNegativo` | subtrai |
| `Ajuste` | demais | soma |
| `Inventario` | qualquer | substitui (contagem física absoluta) |

## Application + Infrastructure (atualizados para compilar)

- `MovimentacaoEstoqueDto` — campos `MotivoCodigo`, `Descricao`, `DocumentoOrigem`
- `ProdutoService` — `IRepository<MovimentacaoEstoque>`
- `AppDbContext` — `DbSet<MovimentacaoEstoque> MovimentacoesEstoque`
- `MovimentacaoEstoqueConfiguration` — tabela `movimentacoes_estoque`, `motivo_codigo` (int), `descricao` (varchar 500), `documento_origem` (varchar 100)
- Migration `20260522231134_Estoque_MovimentacaoEstoque` — drop `lancamentos_estoque` + create `movimentacoes_estoque`

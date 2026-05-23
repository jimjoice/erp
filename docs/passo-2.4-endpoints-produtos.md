# Passo 2.4 — Endpoints de Produtos

## Arquivos criados

### ERP.Domain
- `Enums/TipoMovimentacaoEstoque.cs` — 7 tipos (EntradaCompra, SaidaVenda, AjusteInventario...)
- `Entities/LancamentoEstoque.cs` — entidade de movimentação com `Create()` factory

### ERP.Application
- `Cadastros/Produtos/MovimentacaoEstoqueDto.cs` — `MovimentacaoEstoqueResponseDto`
- `IProdutoService` — adicionado `GetMovimentacoesAsync`
- `ProdutoService` — implementação + busca agora cobre Nome **e** SKU
- `CadastrosProfile` — mapping `LancamentoEstoque → MovimentacaoEstoqueResponseDto`

### ERP.Infrastructure
- `Configurations/LancamentoEstoqueConfiguration.cs` — tabela `lancamentos_estoque`, FK Restrict, índices em `produto_id` e `created_at`
- Migration `20260522230047_AddLancamentoEstoque.cs` — gerada e validada

### ERP.API
- `Extensions/ResultExtensions.cs` — `ToHttpResult<T>` e `ToHttpResult` que convertem `Result` → `IResult`
- `Endpoints/ProdutosEndpoints.cs` — 6 endpoints com auth por role, validação FluentValidation, Location header no POST
- `Program.cs` — `app.MapProdutos()` registrado

---

## Endpoints

| Método | Rota | Auth | Resposta |
|--------|------|------|----------|
| GET | `/api/v1/produtos` | Vendedor | 200 `PagedResult<ProdutoResponseDto>` |
| GET | `/api/v1/produtos/{id}` | Vendedor | 200 / 404 |
| POST | `/api/v1/produtos` | Gerente | 201 + Location header |
| PUT | `/api/v1/produtos/{id}` | Gerente | 200 / 404 / 409 |
| DELETE | `/api/v1/produtos/{id}` | Admin | 204 / 404 |
| GET | `/api/v1/produtos/{id}/movimentacoes` | Vendedor | 200 `PagedResult<MovimentacaoEstoqueResponseDto>` |

**Query params — GET /api/v1/produtos:**
`search`, `categoriaId`, `somenteAbaixoDoMinimo`, `page` (padrão=1), `pageSize` (padrão=20)

**Autorização por endpoint:** GET / movimentacoes → `Vendedor` · POST / PUT → `Gerente` · DELETE → `Admin`

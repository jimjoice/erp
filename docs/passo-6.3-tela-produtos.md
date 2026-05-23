# Passo 6.3 — Tela de Produtos

## Arquivos criados (15)

### Componentes UI (shadcn/ui com Radix primitives)

| Arquivo | Descrição |
|---|---|
| `src/components/ui/dialog.tsx` | Modal acessível com overlay, animações e botão de fechar |
| `src/components/ui/select.tsx` | Select estilizado com busca, grupos e indicador de seleção |
| `src/components/ui/table.tsx` | Primitivos de tabela HTML (Table, Header, Body, Row, Head, Cell) |
| `src/components/ui/textarea.tsx` | Textarea estilizado com ring de foco |

### Tipos

| Arquivo | Conteúdo |
|---|---|
| `src/types/produto.ts` | `Produto`, `Categoria`, `ProdutoFiltros`, `CreateProdutoDto`, `UpdateProdutoDto`, `UnidadeMedida`, `SituacaoEstoque` |

### Serviços (Axios → backend)

| Arquivo | Endpoints |
|---|---|
| `src/services/produto-service.ts` | `listar` (paginação + filtros), `criar`, `atualizar`, `excluir` |
| `src/services/categoria-service.ts` | `listar` todas as categorias |

### Hooks (React Query)

| Arquivo | Hooks exportados |
|---|---|
| `src/hooks/use-produtos.ts` | `useProdutos`, `useCriarProduto`, `useAtualizarProduto`, `useExcluirProduto` |
| `src/hooks/use-categorias.ts` | `useCategorias` (staleTime 5 min — lista muda raramente) |

### Componentes da feature

| Arquivo | Responsabilidade |
|---|---|
| `src/components/produtos/estoque-badge.tsx` | Badge **Normal** / **Baixo** (laranja + ícone) / **Zerado** (vermelho + ícone) |
| `src/components/produtos/produto-delete-dialog.tsx` | Dialog de confirmação com botão Excluir destrutivo |
| `src/components/produtos/produto-modal.tsx` | Formulário criar/editar com React Hook Form + Zod (SKU desabilitado no edit) |
| `src/components/produtos/produtos-filtros.tsx` | Busca por nome/SKU (debounce 350 ms), filtro de categoria, filtro de situação de estoque |
| `src/components/produtos/produtos-table.tsx` | TanStack Table com paginação server-side, skeleton de loading e ações por linha |

### Página

| Arquivo | Descrição |
|---|---|
| `src/app/(dashboard)/produtos/page.tsx` | Client component — orquestra estado de filtros, modal e delete dialog |

---

## Arquivo corrigido

- **`src/components/layout/app-sidebar.tsx`** — `logout` renomeado para `clearAuth` após refatoração do store no passo 6.2.

---

## Arquitetura da tela

```
ProdutosPage (estado central)
├── ProdutosFiltros        → emite { busca, categoriaId, situacaoEstoque, page: 1 }
├── ProdutosTable          → recebe dados paginados + callbacks onEdit / onDelete
│   └── EstoqueBadge       → renderizado por linha conforme estoqueAtual x estoqueMinimo
├── ProdutoModal           → abre em modo criar (produto=null) ou editar (produto=Produto)
└── ProdutoDeleteDialog    → abre quando produtoToDelete != null
```

---

## Fluxo de dados

```
1. Filtros alterados → setFiltros({ ...parcial, page: 1 })
2. useProdutos(filtros) → GET /api/v1/produtos?busca=&categoriaId=&situacaoEstoque=&page=1&pageSize=15
3. ProdutosTable exibe rows + paginação server-side (total vem da API)
4. Criar → POST /api/v1/produtos → invalidateQueries(['produtos'])
5. Editar → PUT /api/v1/produtos/:id → invalidateQueries(['produtos'])
6. Excluir → DELETE /api/v1/produtos/:id → invalidateQueries(['produtos'])
```

---

## Regras do formulário (validação Zod)

| Campo | Regra |
|---|---|
| Nome | Obrigatório, máx. 200 chars |
| SKU | Obrigatório, máx. 50 chars — **desabilitado na edição** |
| Código de barras | Opcional, máx. 50 chars |
| NCM | Opcional — se preenchido, deve ter exatamente 8 dígitos numéricos |
| Unidade de medida | Enum: UN, KG, G, L, ML, M, M2, M3, CX, PCT, PR, DZ |
| Categoria | Obrigatório — seleção das categorias cadastradas |
| Preço custo | Número ≥ 0 |
| Preço venda | Número > 0 |
| Estoque mínimo | Número ≥ 0 |
| Descrição | Opcional, máx. 500 chars |

---

## Lógica do badge de estoque

| Condição | Badge |
|---|---|
| `estoqueAtual === 0` | Vermelho — "Zerado" + ícone XCircle |
| `estoqueAtual < estoqueMinimo` | Laranja — "Baixo" + ícone AlertTriangle |
| `estoqueAtual >= estoqueMinimo` | Verde — "Normal" |

---

## Filtro de busca — debounce

O campo de busca usa `useEffect` + `setTimeout(350ms)` para evitar uma requisição a cada tecla digitada. O timer é cancelado (`clearTimeout`) caso o usuário continue digitando antes dos 350 ms expirarem.

---

## Paginação server-side

- TanStack Table configurado com `manualPagination: true` e `rowCount: total`
- A página atual é controlada pelo estado local `filtros.page`
- Mudanças de filtro resetam sempre para `page: 1`
- O contador exibe `X–Y de Z produtos`

# Refatoração do Dashboard Service

## Contexto

Os endpoints `/api/v1/dashboard/*` não existem no backend. O serviço de dashboard estava chamando rotas fictícias. Esta refatoração substitui todas as chamadas por rotas reais que já existem na API.

---

## Arquivos alterados

### 1. `frontend/src/types/dashboard.ts`

Todos os tipos foram revisados para espelhar exatamente o que as APIs retornam.

| Tipo | Antes | Depois |
|---|---|---|
| `FaturamentoDia` | `{ data, label, faturamento }` | `{ data: string, total: number }` |
| `PagamentoPie` | `{ forma, label, valor, percentual }` | `{ forma: string, total: number }` |
| `UltimaVenda` | `{ cliente, formaPrincipal, horario, ... }` | `{ clienteNome, dataVenda, pagamentos[], ... }` |
| `AlertaEstoque` | `{ produtoId, nome, sku, estoqueAtual, estoqueMinimo }` | Adicionados `codigoBarras`, `unidadeMedida`, `situacao` |
| `DashboardAlertas` | Existia (wrapper com `estoqueBaixo` + `contasVencidas`) | **Removido** |
| `ContaVencidaAlerta` | Existia | **Removido** — não há endpoint correspondente |

**Motivo da remoção de `DashboardAlertas` e `ContaVencidaAlerta`:** o endpoint `/api/v1/estoque/alertas` retorna uma lista plana de `PosicaoEstoqueItemDto`. Não existe endpoint que combine alertas de estoque com contas vencidas em um único objeto.

---

### 2. `frontend/src/services/dashboard-service.ts`

#### `obterResumo`

**Antes:** `GET /api/v1/dashboard/resumo` (não existe)

**Depois:** duas chamadas em paralelo com `Promise.all`:

```
GET /api/v1/vendas/resumo-dia       → ResumoDiaDto
GET /api/v1/financeiro/resumo       → ResumoFinanceiroDto
```

Mapeamento dos campos:

| Campo `DashboardResumo` | Origem |
|---|---|
| `faturamentoHoje` | `totalVendido` de `ResumoDiaDto` |
| `vendasHoje` | `quantidadeVendas` de `ResumoDiaDto` |
| `ticketMedioHoje` | `ticketMedio` de `ResumoDiaDto` |
| `contasVencendo` | `quantidadeReceberProximos7Dias + quantidadePagarProximos7Dias` de `ResumoFinanceiroDto` |

---

#### `obterFaturamento7Dias`

**Antes:** `GET /api/v1/dashboard/faturamento-7-dias` (não existe)

**Depois:**
```
GET /api/v1/vendas?pageSize=100&dataInicio=<D-6>&dataFim=<hoje>
```

As vendas retornadas são agrupadas por dia (`dataVenda.split('T')[0]`) somando os totais, produzindo um array `{ data: string, total: number }[]` ordenado por data.

---

#### `obterPagamentosHoje`

**Antes:** `GET /api/v1/dashboard/pagamentos-hoje` (não existe)

**Depois:**
```
GET /api/v1/vendas?pageSize=100&dataInicio=<hoje>&dataFim=<hoje>
```

Para cada venda retornada, itera sobre `venda.pagamentos[]` e acumula o valor por `forma`, produzindo `{ forma: string, total: number }[]`.

---

#### `obterUltimasVendas`

**Antes:** `GET /api/v1/dashboard/ultimas-vendas` (não existe)

**Depois:**
```
GET /api/v1/vendas?pageSize=5&page=1
```

Retorna `data.items` diretamente (array paginado).

---

#### `obterAlertas`

**Antes:** `GET /api/v1/dashboard/alertas` (não existe)

**Depois:**
```
GET /api/v1/estoque/alertas
```

Retorna o array de `AlertaEstoque[]` diretamente. O endpoint já filtra apenas produtos com `estoqueAtual <= 0` ou `estoqueAtual < estoqueMinimo`.

---

### 3. Componentes do dashboard

Como os tipos mudaram, os componentes foram atualizados para usar os novos campos:

#### `grafico-faturamento.tsx`
- `dataKey` do `Bar` alterado de `"faturamento"` para `"total"`
- `dataKey` do `XAxis` alterado de `"label"` para `"data"`, com `tickFormatter` que converte a data ISO (`2026-05-23`) para `dd/MM` (`23/05`)
- Tooltip também aplica o mesmo formatador ao label

#### `grafico-pagamentos.tsx`
- `dataKey` do `Pie` alterado de `"valor"` para `"total"`
- `nameKey` alterado de `"label"` para `"forma"`
- Campo `percentual` removido da API; passa a ser calculado no componente a partir do total geral antes de renderizar o gráfico
- Legenda usa `FORMAS_LABEL` para traduzir os valores enum (`Debito` → `"Débito"`, `Pix` → `"PIX"`, etc.)

#### `tabela-ultimas-vendas.tsx`
- `venda.cliente` → `venda.clienteNome`
- `venda.horario` → `venda.dataVenda`
- `venda.formaPrincipal` → `venda.pagamentos[0]?.forma ?? ""`

#### `alertas-dashboard.tsx`
- Removida a seção "Contas Vencidas" (não há dados da API para isso)
- `data?.estoqueBaixo` → `data` (array direto)
- Descrição do card atualizada para "Produtos com estoque baixo ou zerado"

---

## Diagrama de fluxo de dados

```
CardsResumo
  └─ useDashboardResumo()
       └─ Promise.all([
            GET /vendas/resumo-dia,
            GET /financeiro/resumo
          ])

GraficoFaturamento
  └─ useFaturamento7Dias()
       └─ GET /vendas?pageSize=100&dataInicio=D-6&dataFim=hoje
            └─ agrupa por dia → [{ data, total }]

GraficoPagamentos
  └─ usePagamentosHoje()
       └─ GET /vendas?pageSize=100&dataInicio=hoje&dataFim=hoje
            └─ agrupa por forma → [{ forma, total }]

TabelaUltimasVendas
  └─ useUltimasVendas()
       └─ GET /vendas?pageSize=5&page=1 → items[]

AlertasDashboard
  └─ useDashboardAlertas()
       └─ GET /estoque/alertas → AlertaEstoque[]
```

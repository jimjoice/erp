# Implementação das Páginas Frontend — ERP Varejo

**Data:** 2026-05-23  
**Escopo:** Criação de 8 páginas, 30+ componentes, 6 hooks e 6 serviços no frontend Next.js

---

## Visão Geral

Foram implementadas todas as páginas principais do ERP que estavam faltando, cobrindo os módulos de Vendas, Estoque, Financeiro, Cadastros (Clientes, Fornecedores, Funcionários), Relatórios e Configurações. Todas as páginas seguem exatamente o mesmo padrão de código e estrutura do módulo de Produtos já existente.

---

## Arquitetura adotada

Cada módulo segue a mesma estrutura em 4 camadas:

```
src/types/<módulo>.ts          → Interfaces TypeScript
src/services/<módulo>-service.ts → Chamadas HTTP via Axios
src/hooks/use-<módulo>.ts      → React Query (queries + mutations)
src/components/<módulo>/       → Componentes de UI (tabela, modal, filtros, etc.)
src/app/(dashboard)/<rota>/page.tsx → Página Next.js (App Router)
```

---

## Arquivos criados

### Tipos (`src/types/`)

| Arquivo | Interfaces principais |
|---|---|
| `cliente.ts` | `Cliente`, `TipoPessoa`, `ClienteFiltros`, `CreateClienteDto`, `UpdateClienteDto` |
| `fornecedor.ts` | `Fornecedor`, `FornecedorFiltros`, `CreateFornecedorDto`, `UpdateFornecedorDto` |
| `funcionario.ts` | `Funcionario`, `CargoFuncionario`, `CreateFuncionarioDto`, `UpdateFuncionarioDto` |
| `estoque.ts` | `PosicaoEstoque`, `AlertaEstoqueItem`, `MovimentacaoEstoque`, `TipoMovimentacao`, `EntradaMercadoriaDto`, `SaidaManualDto`, `AjusteInventarioDto` |
| `financeiro.ts` | `ContaReceber`, `ContaPagar`, `ResumoFinanceiro`, `FluxoCaixaDia`, `StatusConta`, `BaixarContaDto` |
| `venda-lista.ts` | `VendaLista`, `VendaDetalhe`, `ItemVenda`, `PagamentoVenda`, `ResumoDia`, `VendaFiltros`, `CancelarVendaDto` |

### Serviços (`src/services/`)

| Arquivo | Endpoints cobertos |
|---|---|
| `cliente-service.ts` | `GET /clientes`, `GET /clientes/:id`, `POST /clientes`, `PUT /clientes/:id`, `DELETE /clientes/:id` |
| `fornecedor-service.ts` | `GET /fornecedores`, `GET /fornecedores/:id`, `POST`, `PUT`, `DELETE` |
| `funcionario-service.ts` | `GET /funcionarios`, `GET /funcionarios/:id`, `POST`, `PUT`, `DELETE` |
| `estoque-service.ts` | `GET /estoque`, `GET /estoque/alertas`, `GET /estoque/movimentacoes`, `POST /estoque/entrada`, `POST /estoque/saida`, `POST /estoque/inventario` |
| `financeiro-service.ts` | `GET /financeiro/resumo`, `GET /financeiro/fluxo-caixa`, `GET /contas-receber`, `POST /contas-receber/:id/baixar`, `GET /contas-pagar`, `POST /contas-pagar/:id/baixar` |
| `vendas-lista-service.ts` | `GET /vendas`, `GET /vendas/resumo-dia`, `GET /vendas/:id`, `POST /vendas/:id/cancelar` |

### Hooks (`src/hooks/`)

| Arquivo | Hooks exportados |
|---|---|
| `use-clientes.ts` | `useClientes`, `useCriarCliente`, `useAtualizarCliente`, `useExcluirCliente` |
| `use-fornecedores.ts` | `useFornecedores`, `useCriarFornecedor`, `useAtualizarFornecedor`, `useExcluirFornecedor` |
| `use-funcionarios.ts` | `useFuncionarios`, `useCriarFuncionario`, `useAtualizarFuncionario`, `useExcluirFuncionario` |
| `use-estoque.ts` | `usePosicaoEstoque`, `useAlertasEstoque`, `useMovimentacoesEstoque`, `useEntradaEstoque`, `useSaidaEstoque`, `useInventarioEstoque` |
| `use-financeiro.ts` | `useResumoFinanceiro`, `useFluxoCaixa`, `useContasReceber`, `useBaixarContaReceber`, `useContasPagar`, `useBaixarContaPagar` |
| `use-vendas-lista.ts` | `useVendasLista`, `useResumoDiaVendas`, `useVendaDetalhe`, `useCancelarVenda` |

---

## Páginas implementadas

### 1. Vendas — `/vendas`

**Arquivo:** `src/app/(dashboard)/vendas/page.tsx`

**Funcionalidades:**
- Cards de resumo do dia: total vendido, quantidade de vendas, ticket médio (com `refetchInterval: 60s`)
- Tabela paginada de vendas (15 por página) com colunas: nº, data, cliente, vendedor, total, status
- Filtros: status (Orçamento / Finalizada / Cancelada) e intervalo de datas
- Badge colorido por status: amarelo (orçamento), verde (finalizada), cinza (cancelada)
- Ação "Ver detalhes": abre modal com itens, pagamentos, subtotal, desconto e total
- Ação "Cancelar": dialog com campo obrigatório de motivo
- Invalidação de cache React Query após cancelamento

**Componentes criados:**
- `vendas/vendas-resumo-dia.tsx` — 3 cards com skeleton loading
- `vendas/vendas-filtros.tsx` — filtro de status + datepickers
- `vendas/vendas-table.tsx` — tabela com TanStack Table, paginação manual
- `vendas/venda-detalhe-modal.tsx` — modal com detalhe completo (itens + pagamentos)
- `vendas/cancelar-venda-dialog.tsx` — dialog com formulário validado (Zod)

---

### 2. Estoque — `/estoque`

**Arquivo:** `src/app/(dashboard)/estoque/page.tsx`

**Funcionalidades:**
- Card de alertas no topo: lista produtos zerados ou abaixo do mínimo com badge e contador
- Sistema de abas sem dependência de componente externo: "Posição atual" e "Movimentações"
- Aba **Posição atual**: busca por produto, tabela com estoque atual, mínimo, situação e 3 ações por linha
- Ações da tabela: entrada (ícone verde), saída manual (ícone vermelho), ajuste de inventário (ícone azul)
- Modal de **Entrada**: quantidade, custo opcional e motivo
- Modal de **Saída / Inventário**: mesmo componente, comportamento diferente pelo prop `modo`
- Aba **Movimentações**: tabela paginada com tipo, produto, quantidade, saldo anterior→atual e motivo
- Após qualquer movimentação: invalida cache de `["estoque"]` e `["produtos"]`

**Componentes criados:**
- `estoque/estoque-alertas.tsx` — card com lista de alertas e badge contador
- `estoque/estoque-table.tsx` — tabela com TanStack Table + 3 botões de ação por linha
- `estoque/estoque-modal-entrada.tsx` — formulário de entrada com validação Zod
- `estoque/estoque-modal-saida.tsx` — formulário compartilhado saída/inventário, prop `modo`
- `estoque/movimentacoes-table.tsx` — tabela de histórico de movimentações com badges por tipo

---

### 3. Financeiro — `/financeiro`

**Arquivo:** `src/app/(dashboard)/financeiro/page.tsx`

**Funcionalidades:**
- 4 cards de resumo: saldo em caixa, a receber (7 dias), a pagar (7 dias), vencido a receber
- Card "Vencido a Receber" fica vermelho se houver valor
- Sistema de 3 abas: "Visão Geral", "Contas a Receber", "Contas a Pagar"
- Aba **Visão Geral**: gráfico de barras agrupadas (entradas e saídas) do mês atual via Recharts
- Aba **Contas a Receber**: filtro de status + intervalo de datas, botão "Baixar" para contas pendentes/vencidas
- Aba **Contas a Pagar**: mesmo padrão, botão "Baixar" em azul
- Dialog de baixa: valor, forma de pagamento (select), data e observação
- Após baixa: invalida cache de `["contas-receber"]`, `["contas-pagar"]` e `["financeiro"]`

**Componentes criados:**
- `financeiro/resumo-financeiro.tsx` — 4 cards com skeleton loading e alert condicional
- `financeiro/fluxo-caixa-grafico.tsx` — gráfico de barras com Recharts (entradas verde / saídas vermelho)
- `financeiro/contas-receber-table.tsx` — tabela com botão "Baixar" condicional por status
- `financeiro/contas-pagar-table.tsx` — idem para contas a pagar
- `financeiro/baixar-conta-dialog.tsx` — dialog de baixa reutilizável para receber e pagar

---

### 4. Clientes — `/cadastros/clientes`

**Arquivo:** `src/app/(dashboard)/cadastros/clientes/page.tsx`

**Funcionalidades:**
- Tabela paginada com busca por nome ou CPF/CNPJ
- Colunas: nome + e-mail, tipo de pessoa (PF/PJ com badge), CPF/CNPJ (font-mono), telefone, cidade/UF
- Modal de criação/edição com dois blocos: dados principais e endereço completo
- Tipo de pessoa via Select (PF / PJ)
- UF via Select com todos os 27 estados
- Validação de e-mail e tamanho máximo de todos os campos
- Dialog de confirmação de exclusão

**Componentes criados:**
- `clientes/clientes-filtros.tsx` — busca com debounce de 350ms
- `clientes/clientes-table.tsx` — TanStack Table com badge de tipo de pessoa
- `clientes/cliente-modal.tsx` — formulário com React Hook Form + Zod, seção de endereço
- `clientes/cliente-delete-dialog.tsx` — dialog de confirmação padrão

---

### 5. Fornecedores — `/cadastros/fornecedores`

**Arquivo:** `src/app/(dashboard)/cadastros/fornecedores/page.tsx`

**Funcionalidades idênticas ao módulo de Clientes**, com os diferenciais:
- Campos específicos: razão social, nome fantasia, CNPJ (obrigatório), condições de pagamento
- Busca por razão social ou CNPJ
- Colunas da tabela: razão social + nome fantasia, CNPJ (font-mono), e-mail, telefone, cidade/UF

**Componentes criados:**
- `fornecedores/fornecedores-filtros.tsx`
- `fornecedores/fornecedores-table.tsx`
- `fornecedores/fornecedor-modal.tsx`
- `fornecedores/fornecedor-delete-dialog.tsx`

---

### 6. Funcionários — `/cadastros/funcionarios`

**Arquivo:** `src/app/(dashboard)/cadastros/funcionarios/page.tsx`

**Funcionalidades:**
- Tabela com colunas: nome + e-mail, cargo (badge colorido por perfil), telefone, salário, data de admissão
- Badges de cargo: Admin (roxo), Gerente (azul), Vendedor (verde), Financeiro (âmbar)
- Modal com comportamento diferente na criação vs. edição:
  - **Criação**: campo senha obrigatório (mínimo 6 caracteres)
  - **Edição**: campo senha omitido (não enviado ao backend)
- Campos: cargo (select), e-mail, CPF, salário (R$), data de admissão (input date)
- Schema Zod único com senha opcional; validação de presença feita no `onSubmit`

**Componentes criados:**
- `funcionarios/funcionarios-filtros.tsx`
- `funcionarios/funcionarios-table.tsx`
- `funcionarios/funcionario-modal.tsx`
- `funcionarios/funcionario-delete-dialog.tsx`

---

### 7. Relatórios — `/relatorios`

**Arquivo:** `src/app/(dashboard)/relatorios/page.tsx`

**Funcionalidades:**
- Painel consolidado que agrega dados de 3 módulos diferentes:
  - **Dashboard**: `useDashboardResumo` (faturamento hoje, qtd vendas, ticket médio) + `useFaturamento7Dias` + `usePagamentosHoje`
  - **Financeiro**: `useResumoFinanceiro` (total a receber nos próximos 7 dias)
  - **Estoque**: `useAlertasEstoque` (contagem de produtos críticos)
- 4 cards de KPIs: faturamento hoje, ticket médio, a receber (7 dias), estoque crítico
- Gráfico de barras de faturamento nos últimos 7 dias (Recharts `BarChart`)
- Gráfico de pizza de formas de pagamento hoje (Recharts `PieChart` com 5 cores)
- Painel de alertas de estoque: grid 3 colunas com produto, situação e saldo atual/mínimo
- Painel de alertas visível somente quando há produtos críticos

---

### 8. Configurações — `/configuracoes`

**Arquivo:** `src/app/(dashboard)/configuracoes/page.tsx`

**Funcionalidades:**
- Formulário com 2 cards: "Dados da Empresa" e "Preferências"
- **Dados da Empresa**: razão social, nome fantasia, CNPJ, inscrição estadual, telefone, e-mail, site, endereço completo
- **Preferências**: desconto máximo por venda (%) e ambiente SEFAZ (Homologação / Produção)
- Persistência via `localStorage` com chave `erp-configuracoes`
- Carregamento dos dados salvos no `useEffect` com `reset(parsed)`
- Botão "Salvar" desabilitado quando não há alterações (`isDirty`)
- Feedback visual "Salvo!" por 2 segundos após persistência
- Aviso exibido ao usuário informando que as configurações são locais até integração com backend

---

## Padrões mantidos em todos os módulos

### Tabelas
- Construídas com **TanStack Table** (`useReactTable` + `getCoreRowModel`)
- Paginação manual server-side (prop `manualPagination: true`)
- Estado de loading: spinner `Loader2` centralizado em célula que ocupa toda a linha
- Estado vazio: mensagem centrada com `text-muted-foreground`
- Rodapé: contador "X–Y de Z resultados" à esquerda, navegação com `ChevronLeft`/`ChevronRight` à direita

### Modais de criação/edição
- Construídos com **React Hook Form** + **Zod** + `zodResolver`
- `useEffect` sincroniza o formulário com o item sendo editado sempre que o modal abre
- Campo `disabled` em edição quando não deve ser alterado (ex: SKU em produto)
- Bloco de erro da API renderizado acima do `DialogFooter`
- Botão "Salvar" desabilitado durante `isPending` (submissão + mutation)

### Filtros
- Debounce de 350ms para campos de texto (usando `useEffect` + `setTimeout`)
- Botão "Limpar" com ícone `X` visível apenas quando há filtro ativo
- Selects com opção `"__all__"` como sentinela para "sem filtro" (evita valor vazio no Select do shadcn)

### React Query
- `queryKey` sempre em array com o objeto de filtros: `["módulo", filtros]`
- `placeholderData: (prev) => prev` em todas as queries de lista (evita flash de estado vazio na paginação)
- Mutations invalidam apenas as queries relevantes via `useQueryClient`
- `refetchInterval: 60_000` em dados de resumo que precisam de atualização periódica

---

## Observações técnicas

1. **`/estoque/alertas`**: o componente `EstoqueAlertas` usa `useAlertasEstoque` (endpoint `/estoque/alertas`), independente do `useDashboardAlertas` (endpoint `/dashboard/alertas`). São endpoints diferentes com formatos distintos.

2. **Modo único para saída/inventário**: `EstoqueModalSaida` recebe `modo: "saida" | "inventario"` e usa schemas Zod diferentes: saída exige quantidade > 0, inventário aceita quantidade ≥ 0 (para zerar estoque).

3. **Funcionário sem senha na edição**: o schema Zod tem `senha` como opcional; a validação de presença e comprimento mínimo é feita no `onSubmit` antes de chamar a mutation de criação.

4. **Fluxo de caixa**: o período padrão na página Financeiro é o mês corrente (calculado em tempo de renderização: primeiro ao último dia do mês).

5. **Configurações locais**: por ausência de endpoint no backend, as configurações são salvas em `localStorage`. A lógica de persistência está isolada na página e pode ser facilmente substituída por uma chamada de API no futuro.

6. **Abas sem componente externo**: as páginas Estoque e Financeiro implementam tabs com `useState` + classes condicionais (`border-b-2 border-primary` vs `border-transparent`), sem depender de um componente `Tabs` do shadcn/ui (que não estava disponível no projeto).

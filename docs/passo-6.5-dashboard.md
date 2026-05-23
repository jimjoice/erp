# Passo 6.5 — Dashboard Principal

## Visão Geral

Implementação da tela `/dashboard` (home) com dados em tempo real via React Query, gráficos Recharts e alertas operacionais.

---

## Arquivos Criados

### Infraestrutura

| Arquivo | Descrição |
|---|---|
| `src/lib/formatters.ts` | `brl()` e `brlAxis()` para formatação de moeda pt-BR |
| `src/types/dashboard.ts` | Todos os tipos TypeScript do módulo |
| `src/services/dashboard-service.ts` | 5 chamadas à API (`/dashboard/*`) via Axios |
| `src/hooks/use-dashboard.ts` | 5 hooks React Query com staleTime de 1 minuto |

### Componentes (`src/components/dashboard/`)

| Arquivo | Descrição |
|---|---|
| `cards-resumo.tsx` | 4 KPI cards com skeleton de carregamento; "Contas Vencendo" fica vermelho se > 0 |
| `grafico-faturamento.tsx` | BarChart Recharts, últimos 7 dias, tooltip com valor em R$ |
| `grafico-pagamentos.tsx` | PieChart donut + legenda com valor por forma de pagamento |
| `tabela-ultimas-vendas.tsx` | Tabela shadcn com 5 últimas vendas e Badge de status |
| `alertas-dashboard.tsx` | Estoque baixo + contas vencidas; exibe "Tudo em ordem!" quando sem alertas |

### Página Atualizada

- `src/app/(dashboard)/dashboard/page.tsx` — Server Component com `metadata`; importa os 5 componentes client

---

## Endpoints da API Consumidos

| Método | Rota | Retorno |
|---|---|---|
| GET | `/dashboard/resumo` | `DashboardResumo` |
| GET | `/dashboard/faturamento-7-dias` | `FaturamentoDia[]` |
| GET | `/dashboard/pagamentos-hoje` | `PagamentoPie[]` |
| GET | `/dashboard/ultimas-vendas` | `UltimaVenda[]` |
| GET | `/dashboard/alertas` | `DashboardAlertas` |

---

## Layout da Página

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Faturamento  │   Vendas     │ Ticket Médio │   Contas     │
│    Hoje      │    Hoje      │              │  Vencendo    │
└──────────────┴──────────────┴──────────────┴──────────────┘

┌─────────────────────────────────┬────────────────────────┐
│  BarChart — Faturamento 7 dias  │  PieChart — Pagamentos │
│           (3/5 colunas)         │     (2/5 colunas)      │
└─────────────────────────────────┴────────────────────────┘

┌─────────────────────────────────┬────────────────────────┐
│     Tabela — Últimas Vendas     │  Alertas               │
│           (3/5 colunas)         │  (Estoque + Contas)    │
│                                 │     (2/5 colunas)      │
└─────────────────────────────────┴────────────────────────┘
```

---

## Comportamentos

### Cards (CardsResumo)
- Exibe skeleton animado durante o carregamento
- "Contas Vencendo": ícone e valor ficam vermelhos (`text-destructive`) quando `> 0`
- Faturamento e Ticket Médio formatados em R$ via `Intl.NumberFormat` pt-BR

### Gráfico de Barras (GraficoFaturamento)
- Eixo X: label do dia (ex: "Seg", "Ter" — enviado pelo backend)
- Eixo Y: valor compacto em R$ sem decimais
- Tooltip: mostra o valor completo em R$ ao passar o mouse
- Barras arredondadas no topo, cor índigo (`#6366f1`)
- Grade horizontal apenas (sem linhas verticais)

### Gráfico de Pizza (GraficoPagamentos)
- Donut chart (innerRadius 50, outerRadius 78)
- Cores fixas por forma: Dinheiro=verde, Débito=azul, Crédito=índigo, PIX=ciano, Crediário=laranja
- Legenda abaixo do gráfico: ponto colorido + label + valor em R$
- Tooltip: nome, valor e percentual

### Tabela de Últimas Vendas (TabelaUltimasVendas)
- Colunas: Nº, Cliente, Forma, Total, Horário, Status
- Nº formatado com zeros à esquerda: `#00042`
- Cliente nulo exibe "Consumidor final"
- Horário formatado: `HH:MM` (locale pt-BR)
- Status com Badge: Finalizada=verde, Cancelada=vermelho, Em Andamento/Aberta=cinza

### Alertas (AlertasDashboard)
- **Estoque Baixo**: nome do produto + Badge `atual/mínimo` em vermelho
- **Contas Vencidas**: descrição, tipo (Pagar/Receber), data de vencimento, valor e dias em atraso
- Se nenhum alerta: exibe ícone verde `CheckCircle2` com texto "Tudo em ordem!"
- As duas seções são separadas por um `<Separator />` quando ambas têm dados

---

## Tipos TypeScript

```typescript
interface DashboardResumo {
  faturamentoHoje: number;
  vendasHoje: number;
  ticketMedioHoje: number;
  contasVencendo: number;
}

interface FaturamentoDia {
  data: string;      // "2026-05-22"
  label: string;     // "Qui"
  faturamento: number;
}

interface PagamentoPie {
  forma: string;     // "Pix"
  label: string;     // "PIX"
  valor: number;
  percentual: number;
}

interface UltimaVenda {
  id: string;
  numero: number;
  cliente: string | null;
  total: number;
  formaPrincipal: string;
  horario: string;   // ISO 8601
  status: string;    // "Finalizada" | "Cancelada" | "EmAndamento" | "Aberta"
}

interface AlertaEstoque {
  produtoId: string;
  nome: string;
  sku: string;
  estoqueAtual: number;
  estoqueMinimo: number;
}

interface ContaVencidaAlerta {
  id: string;
  descricao: string;
  valor: number;
  vencimento: string;  // ISO 8601
  tipo: "Pagar" | "Receber";
  diasAtraso: number;
}

interface DashboardAlertas {
  estoqueBaixo: AlertaEstoque[];
  contasVencidas: ContaVencidaAlerta[];
}
```

---

## Dependências Utilizadas

- **Recharts** `^2.15.0` — já instalado; `BarChart`, `PieChart`, `ResponsiveContainer`, `Tooltip`
- **TanStack Query v5** — React Query hooks com staleTime de 60s
- **shadcn/ui** — `Card`, `Table`, `Badge`, `Separator`
- **lucide-react** — `DollarSign`, `ShoppingCart`, `TrendingUp`, `AlertTriangle`, `CheckCircle2`, `Package`, `Receipt`

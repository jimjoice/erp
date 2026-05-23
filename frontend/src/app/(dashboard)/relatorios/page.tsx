"use client";

import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import type { TooltipProps } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Wallet, AlertTriangle } from "lucide-react";
import { useFaturamento7Dias, usePagamentosHoje, useDashboardResumo } from "@/hooks/use-dashboard";
import { useResumoFinanceiro } from "@/hooks/use-financeiro";
import { useAlertasEstoque } from "@/hooks/use-estoque";
import { brl, brlAxis } from "@/lib/formatters";

const PIE_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

function TooltipBrl({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border rounded-lg px-3 py-2 shadow-md text-sm">
      <p className="font-medium mb-1">{label}</p>
      <p className="text-primary">{brl(payload[0].value ?? 0)}</p>
    </div>
  );
}

export default function RelatoriosPage() {
  const { data: resumo, isLoading: loadingResumo } = useDashboardResumo();
  const { data: faturamento, isLoading: loadingFat } = useFaturamento7Dias();
  const { data: pagamentos, isLoading: loadingPag } = usePagamentosHoje();
  const { data: financeiro, isLoading: loadingFin } = useResumoFinanceiro();
  const { data: alertas, isLoading: loadingAlertas } = useAlertasEstoque();

  const cards = [
    {
      title: "Faturamento Hoje",
      value: brl(resumo?.faturamentoHoje ?? 0),
      desc: `${resumo?.vendasHoje ?? 0} vendas`,
      icon: TrendingUp,
      loading: loadingResumo,
    },
    {
      title: "Ticket Médio",
      value: brl(resumo?.ticketMedioHoje ?? 0),
      desc: "média por venda hoje",
      icon: BarChart3,
      loading: loadingResumo,
    },
    {
      title: "A Receber (7 dias)",
      value: brl(financeiro?.totalReceberProximos7Dias ?? 0),
      desc: "próximos 7 dias",
      icon: Wallet,
      loading: loadingFin,
    },
    {
      title: "Estoque Crítico",
      value: String(alertas?.length ?? 0),
      desc: "produtos zerados ou abaixo do mínimo",
      icon: AlertTriangle,
      loading: loadingAlertas,
      alert: (alertas?.length ?? 0) > 0,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-sm text-muted-foreground">Painel consolidado de indicadores</p>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.alert ? "text-destructive" : "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
              {card.loading ? (
                <div className="h-7 w-32 rounded bg-muted animate-pulse" />
              ) : (
                <div className={`text-2xl font-bold ${card.alert ? "text-destructive" : ""}`}>{card.value}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Faturamento — Últimos 7 Dias</CardTitle>
              <CardDescription>Receita bruta diária</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingFat ? (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">Carregando...</div>
              ) : !faturamento?.length ? (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">Sem dados para o período</div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={faturamento} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={(v: number) => brlAxis(v)} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={84} />
                    <Tooltip content={<TooltipBrl />} cursor={{ fill: "hsl(var(--muted))" }} />
                    <Bar dataKey="faturamento" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Formas de Pagamento</CardTitle>
              <CardDescription>Distribuição hoje</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPag ? (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">Carregando...</div>
              ) : !pagamentos?.length ? (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">Sem vendas hoje</div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pagamentos}
                      dataKey="valor"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ label, percentual }) => `${label} ${percentual}%`}
                      labelLine={false}
                    >
                      {pagamentos.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip formatter={(v: number) => brl(v)} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Alertas de estoque */}
      {(alertas?.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Alertas de Estoque
              <Badge variant="destructive" className="ml-auto">{alertas!.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {alertas!.map((a) => (
                <div key={a.produtoId} className="flex items-center justify-between rounded-md border p-2.5 text-sm">
                  <div>
                    <p className="font-medium">{a.produtoNome}</p>
                    <p className="text-xs font-mono text-muted-foreground">{a.sku}</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant="outline"
                      className={a.situacao === "zerado"
                        ? "bg-red-100 text-red-800 border-red-200"
                        : "bg-amber-100 text-amber-800 border-amber-200"
                      }
                    >
                      {a.situacao === "zerado" ? "Zerado" : "Baixo"}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{a.estoqueAtual} / {a.estoqueMinimo}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

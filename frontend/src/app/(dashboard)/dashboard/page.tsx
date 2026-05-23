import type { Metadata } from "next";
import { CardsResumo } from "@/components/dashboard/cards-resumo";
import { GraficoFaturamento } from "@/components/dashboard/grafico-faturamento";
import { GraficoPagamentos } from "@/components/dashboard/grafico-pagamentos";
import { TabelaUltimasVendas } from "@/components/dashboard/tabela-ultimas-vendas";
import { AlertasDashboard } from "@/components/dashboard/alertas-dashboard";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do negócio</p>
      </div>

      <CardsResumo />

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <GraficoFaturamento />
        </div>
        <div className="lg:col-span-2">
          <GraficoPagamentos />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <TabelaUltimasVendas />
        </div>
        <div className="lg:col-span-2">
          <AlertasDashboard />
        </div>
      </div>
    </div>
  );
}

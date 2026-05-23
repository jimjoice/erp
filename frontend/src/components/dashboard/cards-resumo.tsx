"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import { useDashboardResumo } from "@/hooks/use-dashboard";
import { brl } from "@/lib/formatters";

function CardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-28 rounded bg-muted animate-pulse" />
        <div className="h-4 w-4 rounded bg-muted animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="h-7 w-36 rounded bg-muted animate-pulse mb-1" />
        <div className="h-3 w-24 rounded bg-muted animate-pulse" />
      </CardContent>
    </Card>
  );
}

export function CardsResumo() {
  const { data, isLoading } = useDashboardResumo();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const vencendo = data?.contasVencendo ?? 0;

  const cards = [
    {
      title: "Faturamento Hoje",
      value: brl(data?.faturamentoHoje ?? 0),
      description: `${data?.vendasHoje ?? 0} vendas realizadas`,
      icon: DollarSign,
      alert: false,
    },
    {
      title: "Vendas Hoje",
      value: String(data?.vendasHoje ?? 0),
      description: "transações no dia",
      icon: ShoppingCart,
      alert: false,
    },
    {
      title: "Ticket Médio",
      value: brl(data?.ticketMedioHoje ?? 0),
      description: "média por venda",
      icon: TrendingUp,
      alert: false,
    },
    {
      title: "Contas Vencendo",
      value: String(vencendo),
      description: "nos próximos 7 dias",
      icon: AlertTriangle,
      alert: vencendo > 0,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon
              className={`h-4 w-4 ${card.alert ? "text-destructive" : "text-muted-foreground"}`}
            />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.alert ? "text-destructive" : ""}`}>
              {card.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipProps } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useFaturamento7Dias } from "@/hooks/use-dashboard";
import { brl, brlAxis } from "@/lib/formatters";

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border rounded-lg px-3 py-2 shadow-md text-sm">
      <p className="font-medium mb-1">{label}</p>
      <p className="text-primary">{brl(payload[0].value ?? 0)}</p>
    </div>
  );
}

export function GraficoFaturamento() {
  const { data, isLoading } = useFaturamento7Dias();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Faturamento — Últimos 7 Dias</CardTitle>
        <CardDescription>Receita bruta diária</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
            Carregando...
          </div>
        ) : !data?.length ? (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
            Sem dados para o período
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={(v: number) => brlAxis(v)}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={84}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
              <Bar
                dataKey="faturamento"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

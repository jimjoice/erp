"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { TooltipProps } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePagamentosHoje } from "@/hooks/use-dashboard";
import { brl } from "@/lib/formatters";

const CORES: Record<string, string> = {
  Dinheiro: "#22c55e",
  Debito: "#3b82f6",
  Credito: "#6366f1",
  Pix: "#06b6d4",
  Crediario: "#f97316",
};

const COR_PADRAO = "#94a3b8";

interface TooltipPayload {
  percentual: number;
}

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const extra = item.payload as TooltipPayload;
  return (
    <div className="bg-card border rounded-lg px-3 py-2 shadow-md text-sm">
      <p className="font-medium">{item.name}</p>
      <p>{brl(item.value ?? 0)}</p>
      <p className="text-muted-foreground">{extra.percentual.toFixed(1)}%</p>
    </div>
  );
}

export function GraficoPagamentos() {
  const { data, isLoading } = usePagamentosHoje();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Pagamentos Hoje</CardTitle>
        <CardDescription>Distribuição por forma de pagamento</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
            Carregando...
          </div>
        ) : !data?.length ? (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
            Sem pagamentos hoje
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="valor"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={78}
                  paddingAngle={2}
                >
                  {data.map((entry) => (
                    <Cell key={entry.forma} fill={CORES[entry.forma] ?? COR_PADRAO} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <ul className="space-y-1.5">
              {data.map((entry) => (
                <li key={entry.forma} className="flex items-center gap-2 text-sm">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ background: CORES[entry.forma] ?? COR_PADRAO }}
                  />
                  <span className="flex-1 text-muted-foreground">{entry.label}</span>
                  <span className="font-medium tabular-nums">{brl(entry.valor)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

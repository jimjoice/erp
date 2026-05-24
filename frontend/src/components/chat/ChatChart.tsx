"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { ChatResponseChart } from "@/types/chat";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

interface Props {
  data: ChatResponseChart;
}

export function ChatChart({ data }: Props) {
  const chartData = data.labels.map((label, i) => ({
    name: label,
    valor: data.values[i] ?? 0,
  }));

  const formatValue = (value: number | string | Array<number | string>) =>
    typeof value === "number" ? value.toLocaleString("pt-BR") : String(value);

  return (
    <div className="w-full">
      <p className="mb-2 text-xs font-semibold text-foreground">{data.title}</p>
      <ResponsiveContainer width="100%" height={220}>
        {data.chartType === "bar" ? (
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} width={40} />
            <Tooltip formatter={formatValue} />
            <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        ) : data.chartType === "line" ? (
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} width={40} />
            <Tooltip formatter={formatValue} />
            <Line
              type="monotone"
              dataKey="valor"
              stroke={COLORS[0]}
              strokeWidth={2}
              dot={{ r: 4, fill: COLORS[0] }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        ) : (
          <PieChart>
            <Pie
              data={chartData}
              dataKey="valor"
              nameKey="name"
              cx="50%"
              cy="45%"
              outerRadius={75}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={formatValue} />
            <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

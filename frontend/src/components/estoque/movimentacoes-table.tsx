"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { MovimentacaoEstoque } from "@/types/estoque";

const TIPO_BADGE: Record<string, { label: string; className: string }> = {
  Entrada: { label: "Entrada", className: "bg-green-100 text-green-800 border-green-200" },
  SaidaVenda: { label: "Saída (Venda)", className: "bg-blue-100 text-blue-800 border-blue-200" },
  SaidaManual: { label: "Saída Manual", className: "bg-red-100 text-red-800 border-red-200" },
  Inventario: { label: "Inventário", className: "bg-purple-100 text-purple-800 border-purple-200" },
};

interface Props {
  data: MovimentacaoEstoque[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

export function MovimentacoesTable({ data, total, page, pageSize, isLoading, onPageChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const columns: ColumnDef<MovimentacaoEstoque>[] = [
    {
      id: "data",
      header: "Data",
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
    },
    {
      accessorKey: "produtoNome",
      header: "Produto",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.produtoNome}</p>
          <p className="text-xs font-mono text-muted-foreground">{row.original.sku}</p>
        </div>
      ),
    },
    {
      accessorKey: "tipo",
      header: "Tipo",
      cell: ({ row }) => {
        const t = TIPO_BADGE[row.original.tipo];
        return <Badge variant="outline" className={t?.className}>{t?.label ?? row.original.tipo}</Badge>;
      },
    },
    {
      accessorKey: "quantidade",
      header: "Quantidade",
      cell: ({ row }) => <span className="tabular-nums">{row.original.quantidade}</span>,
    },
    {
      id: "saldo",
      header: "Saldo",
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {row.original.quantidadeAnterior} → <span className="font-medium text-foreground">{row.original.quantidadeAtual}</span>
        </span>
      ),
    },
    {
      accessorKey: "motivo",
      header: "Motivo",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.motivo ?? "—"}</span>,
    },
  ];

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel(), manualPagination: true, rowCount: total, state: { pagination: { pageIndex: page - 1, pageSize } } });

  return (
    <div className="space-y-3">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={columns.length} className="h-32 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" /></TableCell></TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow><TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">Nenhuma movimentação encontrada.</TableCell></TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{total === 0 ? "Nenhum resultado" : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} de ${total}`}</span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(page - 1)} disabled={page <= 1 || isLoading}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="px-2 tabular-nums">{page} / {totalPages}</span>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages || isLoading}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
}

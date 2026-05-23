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
import { ChevronLeft, ChevronRight, Loader2, Eye, XCircle } from "lucide-react";
import { brl } from "@/lib/formatters";
import type { VendaLista } from "@/types/venda-lista";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  Orcamento: { label: "Orçamento", className: "bg-amber-100 text-amber-800 border-amber-200" },
  Finalizada: { label: "Finalizada", className: "bg-green-100 text-green-800 border-green-200" },
  Cancelada: { label: "Cancelada", className: "bg-gray-100 text-gray-600 border-gray-200" },
};

interface Props {
  data: VendaLista[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onVerDetalhe: (venda: VendaLista) => void;
  onCancelar: (venda: VendaLista) => void;
}

export function VendasTable({ data, total, page, pageSize, isLoading, onPageChange, onVerDetalhe, onCancelar }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const columns: ColumnDef<VendaLista>[] = [
    {
      accessorKey: "numero",
      header: "Nº",
      cell: ({ row }) => <span className="font-mono font-medium">#{row.original.numero}</span>,
    },
    {
      id: "data",
      header: "Data",
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
    },
    {
      id: "cliente",
      header: "Cliente",
      cell: ({ row }) => row.original.clienteNome ?? <span className="text-muted-foreground italic">Consumidor final</span>,
    },
    {
      accessorKey: "funcionarioNome",
      header: "Vendedor",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.funcionarioNome}</span>,
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => <span className="tabular-nums font-medium">{brl(row.original.total)}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = STATUS_BADGE[row.original.status];
        return <Badge variant="outline" className={s?.className}>{s?.label ?? row.original.status}</Badge>;
      },
    },
    {
      id: "acoes",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          <Button size="icon" variant="ghost" className="h-8 w-8" title="Ver detalhes" onClick={() => onVerDetalhe(row.original)}>
            <Eye className="h-3.5 w-3.5" />
          </Button>
          {row.original.status !== "Cancelada" && (
            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" title="Cancelar venda" onClick={() => onCancelar(row.original)}>
              <XCircle className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ),
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
                {hg.headers.map((h) => <TableHead key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>)}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={columns.length} className="h-32 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" /></TableCell></TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow><TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">Nenhuma venda encontrada.</TableCell></TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{total === 0 ? "Nenhum resultado" : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} de ${total} venda${total !== 1 ? "s" : ""}`}</span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(page - 1)} disabled={page <= 1 || isLoading}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="px-2 tabular-nums">{page} / {totalPages}</span>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages || isLoading}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
}

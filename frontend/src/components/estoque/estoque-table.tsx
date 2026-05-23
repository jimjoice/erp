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
import { ChevronLeft, ChevronRight, Loader2, ArrowUpCircle, ArrowDownCircle, ClipboardList } from "lucide-react";
import type { PosicaoEstoque } from "@/types/estoque";

const SITUACAO_BADGE: Record<string, { label: string; className: string }> = {
  normal: { label: "Normal", className: "bg-green-100 text-green-800 border-green-200" },
  baixo: { label: "Baixo", className: "bg-amber-100 text-amber-800 border-amber-200" },
  zerado: { label: "Zerado", className: "bg-red-100 text-red-800 border-red-200" },
};

interface Props {
  data: PosicaoEstoque[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onEntrada: (item: PosicaoEstoque) => void;
  onSaida: (item: PosicaoEstoque) => void;
  onInventario: (item: PosicaoEstoque) => void;
}

export function EstoqueTable({ data, total, page, pageSize, isLoading, onPageChange, onEntrada, onSaida, onInventario }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const columns: ColumnDef<PosicaoEstoque>[] = [
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.sku}</span>,
    },
    {
      accessorKey: "produtoNome",
      header: "Produto",
      cell: ({ row }) => <span className="font-medium">{row.original.produtoNome}</span>,
    },
    {
      id: "estoque",
      header: "Estoque Atual",
      cell: ({ row }) => (
        <span className="tabular-nums font-medium">
          {row.original.estoqueAtual} {row.original.unidadeMedida}
        </span>
      ),
    },
    {
      accessorKey: "estoqueMinimo",
      header: "Estoque Mínimo",
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {row.original.estoqueMinimo} {row.original.unidadeMedida}
        </span>
      ),
    },
    {
      accessorKey: "situacao",
      header: "Situação",
      cell: ({ row }) => {
        const s = SITUACAO_BADGE[row.original.situacao];
        return <Badge variant="outline" className={s?.className}>{s?.label ?? row.original.situacao}</Badge>;
      },
    },
    {
      id: "acoes",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700" title="Entrada" onClick={() => onEntrada(row.original)}>
            <ArrowUpCircle className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700" title="Saída manual" onClick={() => onSaida(row.original)}>
            <ArrowDownCircle className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:text-blue-700" title="Ajuste de inventário" onClick={() => onInventario(row.original)}>
            <ClipboardList className="h-4 w-4" />
          </Button>
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
              <TableRow><TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">Nenhum produto encontrado no estoque.</TableCell></TableRow>
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
        <span>{total === 0 ? "Nenhum resultado" : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} de ${total} produto${total !== 1 ? "s" : ""}`}</span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(page - 1)} disabled={page <= 1 || isLoading}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="px-2 tabular-nums">{page} / {totalPages}</span>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages || isLoading}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
}

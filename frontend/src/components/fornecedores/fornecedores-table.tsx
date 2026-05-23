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
import { ChevronLeft, ChevronRight, Pencil, Trash2, Loader2 } from "lucide-react";
import type { Fornecedor } from "@/types/fornecedor";

interface Props {
  data: Fornecedor[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onEdit: (fornecedor: Fornecedor) => void;
  onDelete: (fornecedor: Fornecedor) => void;
}

export function FornecedoresTable({ data, total, page, pageSize, isLoading, onPageChange, onEdit, onDelete }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const columns: ColumnDef<Fornecedor>[] = [
    {
      accessorKey: "razaoSocial",
      header: "Razão Social",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.razaoSocial}</p>
          {row.original.nomeFantasia && (
            <p className="text-xs text-muted-foreground">{row.original.nomeFantasia}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "cnpj",
      header: "CNPJ",
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.cnpj}</span>,
    },
    {
      accessorKey: "email",
      header: "E-mail",
      cell: ({ row }) => row.original.email ?? "—",
    },
    {
      accessorKey: "telefone",
      header: "Telefone",
      cell: ({ row }) => row.original.telefone ?? "—",
    },
    {
      id: "cidade",
      header: "Cidade",
      cell: ({ row }) =>
        row.original.endereco?.cidade
  ? `${row.original.endereco.cidade}${row.original.endereco.uf ? ` / ${row.original.endereco.uf}` : ""}`
  : "—",
    },
    {
      id: "acoes",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(row.original)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(row.original)}>
            <Trash2 className="h-3.5 w-3.5" />
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
              <TableRow><TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">Nenhum fornecedor encontrado.</TableCell></TableRow>
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
        <span>{total === 0 ? "Nenhum resultado" : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} de ${total} fornecedor${total !== 1 ? "es" : ""}`}</span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(page - 1)} disabled={page <= 1 || isLoading}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="px-2 tabular-nums">{page} / {totalPages}</span>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages || isLoading}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
}

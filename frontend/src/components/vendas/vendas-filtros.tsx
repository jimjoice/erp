"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { VendaFiltros } from "@/types/venda-lista";

interface Props {
  filtros: VendaFiltros;
  onChange: (filtros: Partial<VendaFiltros> & { page: 1 }) => void;
}

export function VendasFiltros({ filtros, onChange }: Props) {
  const temFiltro = filtros.status || filtros.dataInicio || filtros.dataFim;

  function limpar() {
    onChange({ status: "", clienteId: "", funcionarioId: "", dataInicio: "", dataFim: "", page: 1 });
  }

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Select
        value={filtros.status || "__all__"}
        onValueChange={(v) => onChange({ status: v === "__all__" ? "" : v, page: 1 })}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Todos os status</SelectItem>
          <SelectItem value="Orcamento">Orçamento</SelectItem>
          <SelectItem value="Finalizada">Finalizada</SelectItem>
          <SelectItem value="Cancelada">Cancelada</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Input
          type="date"
          className="w-[150px]"
          value={filtros.dataInicio}
          onChange={(e) => onChange({ dataInicio: e.target.value, page: 1 })}
        />
        <span className="text-muted-foreground text-sm">até</span>
        <Input
          type="date"
          className="w-[150px]"
          value={filtros.dataFim}
          onChange={(e) => onChange({ dataFim: e.target.value, page: 1 })}
        />
      </div>

      {temFiltro && (
        <Button variant="ghost" size="sm" onClick={limpar} className="gap-1.5">
          <X className="h-3.5 w-3.5" />
          Limpar
        </Button>
      )}
    </div>
  );
}

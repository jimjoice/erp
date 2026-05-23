"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useCategorias } from "@/hooks/use-categorias";
import type { ProdutoFiltros } from "@/types/produto";

interface Props {
  filtros: ProdutoFiltros;
  onChange: (filtros: Partial<ProdutoFiltros> & { page: 1 }) => void;
}

export function ProdutosFiltros({ filtros, onChange }: Props) {
  const { data: categorias } = useCategorias();
  const [busca, setBusca] = useState(filtros.busca);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (busca !== filtros.busca) {
        onChange({ busca, page: 1 });
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [busca]); // eslint-disable-line react-hooks/exhaustive-deps

  function limpar() {
    setBusca("");
    onChange({ busca: "", categoriaId: "", situacaoEstoque: "", page: 1 });
  }

  const temFiltro =
    filtros.busca || filtros.categoriaId || filtros.situacaoEstoque;

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative min-w-[220px] flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou SKU..."
          className="pl-8"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <Select
        value={filtros.categoriaId || "__all__"}
        onValueChange={(v) =>
          onChange({ categoriaId: v === "__all__" ? "" : v, page: 1 })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Todas as categorias</SelectItem>
          {categorias?.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filtros.situacaoEstoque || "__all__"}
        onValueChange={(v) =>
          onChange({ situacaoEstoque: v === "__all__" ? "" : v, page: 1 })
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Situação" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Todas as situações</SelectItem>
          <SelectItem value="normal">Normal</SelectItem>
          <SelectItem value="baixo">Estoque baixo</SelectItem>
          <SelectItem value="zerado">Zerado</SelectItem>
        </SelectContent>
      </Select>

      {temFiltro && (
        <Button variant="ghost" size="sm" onClick={limpar} className="gap-1.5">
          <X className="h-3.5 w-3.5" />
          Limpar
        </Button>
      )}
    </div>
  );
}

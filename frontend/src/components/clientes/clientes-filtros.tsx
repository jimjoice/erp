"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ClienteFiltros } from "@/types/cliente";

interface Props {
  filtros: ClienteFiltros;
  onChange: (filtros: Partial<ClienteFiltros> & { page: 1 }) => void;
}

export function ClientesFiltros({ filtros, onChange }: Props) {
  const [busca, setBusca] = useState(filtros.search);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (busca !== filtros.search) {
        onChange({ search: busca, page: 1 });
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [busca]); // eslint-disable-line react-hooks/exhaustive-deps

  function limpar() {
    setBusca("");
    onChange({ search: "", page: 1 });
  }

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative min-w-[220px] flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou CPF/CNPJ..."
          className="pl-8"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>
      {filtros.search && (
        <Button variant="ghost" size="sm" onClick={limpar} className="gap-1.5">
          <X className="h-3.5 w-3.5" />
          Limpar
        </Button>
      )}
    </div>
  );
}

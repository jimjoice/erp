"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Loader2, UserCheck, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useBuscaClientePdv } from "@/hooks/use-busca-cliente-pdv";
import { usePdvStore } from "@/store/pdv-store";
import { cn } from "@/lib/utils";

export function PdvBuscaCliente() {
  const [inputValue, setInputValue] = useState("");
  const [queryTerm, setQueryTerm] = useState("");
  const [show, setShow] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const clienteId    = usePdvStore((s) => s.clienteId);
  const clienteNome  = usePdvStore((s) => s.clienteNome);
  const setCliente   = usePdvStore((s) => s.setCliente);
  const limparCliente = usePdvStore((s) => s.limparCliente);

  // debounce
  useEffect(() => {
    const t = setTimeout(() => setQueryTerm(inputValue), 300);
    return () => clearTimeout(t);
  }, [inputValue]);

  const { data, isFetching } = useBuscaClientePdv(queryTerm);
  const resultados = data?.items ?? [];

  useEffect(() => {
    setShow(resultados.length > 0 && inputValue.trim().length >= 2);
  }, [resultados, inputValue]);

  // fecha ao clicar fora
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setShow(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  function selecionar(id: string, nome: string) {
    setCliente(id, nome);
    setInputValue("");
    setQueryTerm("");
    setShow(false);
  }

  function remover() {
    limparCliente();
    setInputValue("");
  }

  if (clienteId) {
    return (
      <div className="flex items-center gap-2">
        <UserCheck className="h-4 w-4 text-green-600 shrink-0" />
        <span className="text-sm font-medium truncate">{clienteNome}</span>
        <button
          type="button"
          onClick={remover}
          className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Remover cliente"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        {isFetching ? (
          <Loader2 className="absolute left-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        )}
        <Input
          placeholder="Cliente (opcional) — nome ou CPF/CNPJ"
          className="pl-9 h-9 text-sm"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => {
            if (resultados.length > 0 && inputValue.trim().length >= 2)
              setShow(true);
          }}
          autoComplete="off"
        />
      </div>

      {show && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border bg-popover shadow-lg overflow-hidden">
          {resultados.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => selecionar(c.id, c.nome)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-2 text-left transition-colors",
                "hover:bg-accent focus:bg-accent focus:outline-none"
              )}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{c.nome}</p>
                <p className="text-xs text-muted-foreground font-mono">{c.cpfCnpj}</p>
              </div>
              <Badge variant="outline" className="text-xs shrink-0">
                {c.tipoPessoa === "PF" ? "PF" : "PJ"}
              </Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

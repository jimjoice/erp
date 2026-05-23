"use client";

import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
} from "react";
import { Search, Loader2, Plus, PackageX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useBuscaProdutoPdv } from "@/hooks/use-busca-produto-pdv";
import { usePdvStore } from "@/store/pdv-store";
import type { Produto } from "@/types/produto";
import { cn } from "@/lib/utils";

export interface PdvBuscaRef {
  focus: () => void;
}

export const PdvBusca = forwardRef<PdvBuscaRef, object>(function PdvBusca(
  _,
  ref
) {
  const [inputValue, setInputValue] = useState("");
  const [queryTerm, setQueryTerm] = useState("");
  const [show, setShow] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const adicionarOuIncrementar = usePdvStore((s) => s.adicionarOuIncrementar);
  const itensNoCarrinho = usePdvStore((s) => s.itens);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  // debounce
  useEffect(() => {
    const t = setTimeout(() => setQueryTerm(inputValue), 250);
    return () => clearTimeout(t);
  }, [inputValue]);

  const { data, isFetching } = useBuscaProdutoPdv(queryTerm);
  const resultados = data?.items ?? [];

  // show dropdown when there are results and input is focused
  useEffect(() => {
    if (resultados.length > 0 && inputValue.trim().length >= 2) setShow(true);
    else setShow(false);
    setFocusedIdx(-1);
  }, [resultados, inputValue]);

  // click outside → close
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setShow(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  function adicionar(produto: Produto) {
    if (produto.estoqueAtual <= 0) return;
    adicionarOuIncrementar({
      produtoId: produto.id,
      nome: produto.nome,
      sku: produto.sku,
      codigoBarras: produto.codigoBarras,
      precoUnitario: produto.precoVenda,
      estoqueAtual: produto.estoqueAtual,
      unidadeMedida: produto.unidadeMedida,
    });
    setInputValue("");
    setQueryTerm("");
    setShow(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!show) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIdx((p) => Math.min(p + 1, resultados.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIdx((p) => Math.max(p - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target =
        focusedIdx >= 0 ? resultados[focusedIdx] : resultados[0];
      if (target) adicionar(target);
    } else if (e.key === "Escape") {
      setShow(false);
    }
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
          ref={inputRef}
          placeholder="Buscar por nome, SKU ou código de barras… (F2)"
          className="pl-9 h-10 text-base"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (resultados.length > 0 && inputValue.trim().length >= 2)
              setShow(true);
          }}
          autoComplete="off"
        />
      </div>

      {/* Dropdown */}
      {show && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border bg-popover shadow-lg overflow-hidden">
          {resultados.map((produto, idx) => {
            const noCarrinho = itensNoCarrinho.some(
              (i) => i.produtoId === produto.id
            );
            const semEstoque = produto.estoqueAtual <= 0;
            return (
              <button
                key={produto.id}
                type="button"
                disabled={semEstoque}
                onClick={() => adicionar(produto)}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                  "hover:bg-accent focus:bg-accent focus:outline-none",
                  idx === focusedIdx && "bg-accent",
                  semEstoque && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{produto.nome}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {produto.sku}
                    {produto.codigoBarras && ` · ${produto.codigoBarras}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-semibold text-primary">
                    {produto.precoVenda.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                  {semEstoque ? (
                    <Badge variant="destructive" className="text-xs gap-1">
                      <PackageX className="h-3 w-3" />
                      Sem estoque
                    </Badge>
                  ) : noCarrinho ? (
                    <Badge
                      variant="outline"
                      className="text-xs border-primary text-primary"
                    >
                      No carrinho
                    </Badge>
                  ) : (
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>
            );
          })}
          {resultados.length === 0 && queryTerm.length >= 2 && !isFetching && (
            <p className="px-4 py-3 text-sm text-muted-foreground text-center">
              Nenhum produto encontrado para "{queryTerm}".
            </p>
          )}
        </div>
      )}
    </div>
  );
});

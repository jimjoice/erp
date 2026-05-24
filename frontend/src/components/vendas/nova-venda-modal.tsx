"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusCircle, Search, Loader2, UserCheck, X } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useBuscaClientePdv } from "@/hooks/use-busca-cliente-pdv";
import { vendaService } from "@/services/venda-service";
import { useAuthStore } from "@/store/auth-store";
import { usePdvStore } from "@/store/pdv-store";
import { cn } from "@/lib/utils";

const schema = z.object({
  observacao: z.string().max(500, "Máximo 500 caracteres").optional(),
});

type FormData = z.infer<typeof schema>;

interface ClienteSugestao {
  id: string;
  nome: string;
  cpfCnpj: string;
  tipoPessoa: "PF" | "PJ";
}

export function NovaVendaModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [inputCliente, setInputCliente] = useState("");
  const [queryCliente, setQueryCliente] = useState("");
  const [showSugestoes, setShowSugestoes] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<ClienteSugestao | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const user = useAuthStore((s) => s.user);
  const setCliente = usePdvStore((s) => s.setCliente);
  const setVendaAberta = usePdvStore((s) => s.setVendaAberta);
  const limpar = usePdvStore((s) => s.limpar);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Dispara busca apenas com 3+ caracteres
  useEffect(() => {
    const t = setTimeout(() => {
      setQueryCliente(inputCliente.trim().length >= 3 ? inputCliente : "");
    }, 300);
    return () => clearTimeout(t);
  }, [inputCliente]);

  const { data, isFetching } = useBuscaClientePdv(queryCliente);
  const sugestoes = data?.items ?? [];

  useEffect(() => {
    setShowSugestoes(
      sugestoes.length > 0 && queryCliente.trim().length >= 3 && !clienteSelecionado
    );
  }, [sugestoes, queryCliente, clienteSelecionado]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setShowSugestoes(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const iniciarMutation = useMutation({
    mutationFn: (formData: FormData) =>
      vendaService.iniciarVenda(
        user?.id ?? "",
        clienteSelecionado?.id ?? null,
        formData.observacao || null
      ),
    onSuccess: (venda) => {
      limpar();
      if (clienteSelecionado) {
        setCliente(clienteSelecionado.id, clienteSelecionado.nome);
      }
      setVendaAberta(venda.id, venda.observacao ?? null);
      toast.success("Venda iniciada com sucesso");
      setOpen(false);
      router.push(`/pdv?vendaId=${venda.id}`);
    },
  });

  function fechar() {
    if (iniciarMutation.isPending) return;
    reset();
    setInputCliente("");
    setQueryCliente("");
    setClienteSelecionado(null);
    iniciarMutation.reset();
    setOpen(false);
  }

  function selecionarCliente(c: ClienteSugestao) {
    setClienteSelecionado(c);
    setInputCliente(c.nome);
    setShowSugestoes(false);
  }

  function limparCliente() {
    setClienteSelecionado(null);
    setInputCliente("");
    setQueryCliente("");
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : fechar())}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Nova Venda
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Venda</DialogTitle>
          <DialogDescription>Preencha os dados para iniciar</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit((d) => iniciarMutation.mutate(d))} className="space-y-4">
          {/* Busca de cliente */}
          <div className="space-y-1.5">
            <Label>Cliente (opcional)</Label>

            {clienteSelecionado ? (
              <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
                <UserCheck className="h-4 w-4 text-green-600 shrink-0" />
                <span className="text-sm font-medium truncate flex-1">{clienteSelecionado.nome}</span>
                <span className="text-xs text-muted-foreground font-mono shrink-0">
                  {clienteSelecionado.cpfCnpj}
                </span>
                <button
                  type="button"
                  onClick={limparCliente}
                  className="text-muted-foreground hover:text-foreground transition-colors ml-1"
                  aria-label="Remover cliente"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div ref={containerRef} className="relative">
                <div className="relative">
                  {isFetching ? (
                    <Loader2 className="absolute left-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  )}
                  <Input
                    placeholder="Buscar por nome ou CPF/CNPJ..."
                    className="pl-9 pr-8"
                    value={inputCliente}
                    onChange={(e) => setInputCliente(e.target.value)}
                    onFocus={() => {
                      if (sugestoes.length > 0 && queryCliente.trim().length >= 3)
                        setShowSugestoes(true);
                    }}
                    autoComplete="off"
                  />
                  {inputCliente && (
                    <button
                      type="button"
                      onClick={limparCliente}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Limpar busca"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {showSugestoes && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-md border bg-popover shadow-lg">
                    {sugestoes.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => selecionarCliente(c)}
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
            )}
          </div>

          {/* Observação */}
          <div className="space-y-1.5">
            <Label htmlFor="observacao">Observação (opcional)</Label>
            <Textarea
              id="observacao"
              placeholder="Informações adicionais sobre a venda..."
              className="resize-none"
              rows={3}
              {...register("observacao")}
            />
            {errors.observacao && (
              <p className="text-xs text-destructive">{errors.observacao.message}</p>
            )}
          </div>

          {/* Erro da API */}
          {iniciarMutation.isError && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3">
              {(iniciarMutation.error as Error)?.message ?? "Erro ao iniciar venda. Tente novamente."}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={fechar}
              disabled={iniciarMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={iniciarMutation.isPending}>
              {iniciarMutation.isPending ? "Iniciando..." : "Iniciar Venda"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

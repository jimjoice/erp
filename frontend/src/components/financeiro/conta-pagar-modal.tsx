"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCriarContaPagar, useEditarContaPagar } from "@/hooks/use-financeiro";
import { fornecedorService } from "@/services/fornecedor-service";
import type { ContaPagar } from "@/types/financeiro";

const schema = z.object({
  fornecedorId: z.string().uuid("Selecione um fornecedor"),
  descricao: z.string().min(1, "Descrição obrigatória").max(500),
  valor: z.coerce.number().min(0.01, "Valor deve ser maior que zero"),
  dataVencimento: z.string().min(1, "Data obrigatória"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  conta?: ContaPagar | null;
  onClose: () => void;
}

export function ContaPagarModal({ open, conta, onClose }: Props) {
  const isEditing = !!conta;
  const criar = useCriarContaPagar();
  const editar = useEditarContaPagar();

  const [buscaFornecedor, setBuscaFornecedor] = useState("");
  const { data: fornecedores } = useQuery({
    queryKey: ["fornecedores-modal", buscaFornecedor],
    queryFn: () => fornecedorService.listar({ search: buscaFornecedor, page: 1, pageSize: 8 }),
    enabled: buscaFornecedor.trim().length >= 1 && !isEditing,
    staleTime: 30_000,
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const fornecedorIdSelecionado = watch("fornecedorId");

  useEffect(() => {
    if (open) {
      if (conta) {
        reset({
          fornecedorId: conta.fornecedorId ?? "",
          descricao: conta.descricao,
          valor: conta.valor,
          dataVencimento: conta.dataVencimento.split("T")[0],
        });
      } else {
        reset({ fornecedorId: "", descricao: "", valor: 0, dataVencimento: "" });
        setBuscaFornecedor("");
      }
    }
  }, [open, conta, reset]);

  async function onSubmit(data: FormData) {
    if (isEditing && conta) {
      await editar.mutateAsync({ id: conta.id, dto: { descricao: data.descricao, valor: data.valor, dataVencimento: data.dataVencimento } });
    } else {
      await criar.mutateAsync(data);
    }
    onClose();
  }

  const isPending = isSubmitting || criar.isPending || editar.isPending;
  const apiError = criar.error?.message ?? editar.error?.message ?? null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Conta a Pagar" : "Nova Conta a Pagar"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isEditing && (
            <div className="space-y-1.5">
              <Label>Fornecedor *</Label>
              {fornecedorIdSelecionado ? (
                <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 text-sm">
                  <span className="flex-1 font-medium">
                    {fornecedores?.items.find((f) => f.id === fornecedorIdSelecionado)?.razaoSocial ?? fornecedorIdSelecionado}
                  </span>
                  <button type="button" className="text-muted-foreground hover:text-foreground text-xs" onClick={() => { setValue("fornecedorId", ""); setBuscaFornecedor(""); }}>
                    ×
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Input
                    placeholder="Buscar fornecedor..."
                    value={buscaFornecedor}
                    onChange={(e) => setBuscaFornecedor(e.target.value)}
                  />
                  {fornecedores && fornecedores.items.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow-md">
                      {fornecedores.items.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                          onClick={() => { setValue("fornecedorId", f.id); setBuscaFornecedor(""); }}
                        >
                          <span className="font-medium">{f.razaoSocial}</span>
                          {f.cnpj && <span className="ml-2 text-xs text-muted-foreground">{f.cnpj}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <input type="hidden" {...register("fornecedorId")} />
              {errors.fornecedorId && <p className="text-xs text-destructive">{errors.fornecedorId.message}</p>}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição *</Label>
            <Input id="descricao" {...register("descricao")} />
            {errors.descricao && <p className="text-xs text-destructive">{errors.descricao.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="valor">Valor (R$) *</Label>
              <Input id="valor" type="number" step="0.01" min="0.01" {...register("valor")} />
              {errors.valor && <p className="text-xs text-destructive">{errors.valor.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dataVencimento">Vencimento *</Label>
              <Input id="dataVencimento" type="date" {...register("dataVencimento")} />
              {errors.dataVencimento && <p className="text-xs text-destructive">{errors.dataVencimento.message}</p>}
            </div>
          </div>

          {apiError && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3">{apiError}</div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar conta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

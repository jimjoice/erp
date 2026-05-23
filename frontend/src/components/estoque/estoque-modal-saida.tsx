"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSaidaEstoque, useInventarioEstoque } from "@/hooks/use-estoque";
import type { PosicaoEstoque } from "@/types/estoque";

type Modo = "saida" | "inventario";

const schemaSaida = z.object({
  quantidade: z.coerce.number().min(0.001, "Quantidade deve ser maior que zero"),
  motivo: z.string().min(1, "Motivo obrigatório").max(200),
});

const schemaInventario = z.object({
  quantidade: z.coerce.number().min(0, "Quantidade inválida"),
  motivo: z.string().min(1, "Motivo obrigatório").max(200),
});

type FormData = { quantidade: number; motivo: string };

interface Props {
  item: PosicaoEstoque | null;
  modo: Modo;
  onClose: () => void;
}

export function EstoqueModalSaida({ item, modo, onClose }: Props) {
  const saida = useSaidaEstoque();
  const inventario = useInventarioEstoque();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(modo === "saida" ? schemaSaida : schemaInventario),
    defaultValues: { quantidade: 1, motivo: modo === "saida" ? "Saída manual" : "Contagem de inventário" },
  });

  useEffect(() => {
    if (item) {
      reset({
        quantidade: modo === "inventario" ? item.estoqueAtual : 1,
        motivo: modo === "saida" ? "Saída manual" : "Contagem de inventário",
      });
    }
  }, [item, modo, reset]);

  async function onSubmit(data: FormData) {
    if (!item) return;
    if (modo === "saida") {
      await saida.mutateAsync({ produtoId: item.produtoId, quantidade: data.quantidade, motivo: data.motivo });
    } else {
      await inventario.mutateAsync({ produtoId: item.produtoId, quantidadeContada: data.quantidade, motivo: data.motivo });
    }
    onClose();
  }

  const isPending = isSubmitting || saida.isPending || inventario.isPending;
  const apiError = saida.error?.message ?? inventario.error?.message ?? null;
  const titulo = modo === "saida" ? "Saída Manual de Estoque" : "Ajuste de Inventário";

  return (
    <Dialog open={!!item} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
        </DialogHeader>

        {item && (
          <div className="rounded-md bg-muted/50 p-3 text-sm mb-2">
            <p className="font-medium">{item.produtoNome}</p>
            <p className="text-muted-foreground font-mono text-xs">{item.sku}</p>
            <p className="text-muted-foreground mt-1">Estoque atual: <span className="font-medium text-foreground">{item.estoqueAtual} {item.unidadeMedida}</span></p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="quantidade">
              {modo === "saida" ? "Quantidade a retirar *" : "Quantidade contada *"}
            </Label>
            <Input id="quantidade" type="number" step="0.001" min="0" {...register("quantidade")} />
            {errors.quantidade && <p className="text-xs text-destructive">{errors.quantidade.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="motivo">Motivo *</Label>
            <Input id="motivo" {...register("motivo")} />
            {errors.motivo && <p className="text-xs text-destructive">{errors.motivo.message}</p>}
          </div>

          {apiError && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3">{apiError}</div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>Cancelar</Button>
            <Button
              type="submit"
              disabled={isPending}
              className={modo === "saida" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {isPending ? "Registrando..." : modo === "saida" ? "Registrar Saída" : "Salvar Ajuste"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

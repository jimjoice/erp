"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEntradaEstoque } from "@/hooks/use-estoque";
import type { PosicaoEstoque } from "@/types/estoque";

const schema = z.object({
  quantidade: z.coerce.number().min(0.001, "Quantidade deve ser maior que zero"),
  motivo: z.string().min(1, "Motivo obrigatório").max(200),
  custo: z.coerce.number().min(0).optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

interface Props {
  item: PosicaoEstoque | null;
  onClose: () => void;
}

export function EstoqueModalEntrada({ item, onClose }: Props) {
  const entrada = useEntradaEstoque();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { quantidade: 1, motivo: "Compra de mercadoria" },
  });

  useEffect(() => {
    if (item) {
      reset({ quantidade: 1, motivo: "Compra de mercadoria", custo: "" as unknown as number });
    }
  }, [item, reset]);

  async function onSubmit(data: FormData) {
    if (!item) return;
    await entrada.mutateAsync({
      produtoId: item.produtoId,
      quantidade: data.quantidade,
      motivo: data.motivo,
      custo: typeof data.custo === "number" && data.custo > 0 ? data.custo : undefined,
    });
    onClose();
  }

  const isPending = isSubmitting || entrada.isPending;

  return (
    <Dialog open={!!item} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Entrada de Mercadoria</DialogTitle>
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
            <Label htmlFor="quantidade">Quantidade *</Label>
            <Input id="quantidade" type="number" step="0.001" min="0.001" {...register("quantidade")} />
            {errors.quantidade && <p className="text-xs text-destructive">{errors.quantidade.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="custo">Custo unitário (R$)</Label>
            <Input id="custo" type="number" step="0.01" min="0" placeholder="Opcional" {...register("custo")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="motivo">Motivo *</Label>
            <Input id="motivo" {...register("motivo")} />
            {errors.motivo && <p className="text-xs text-destructive">{errors.motivo.message}</p>}
          </div>

          {entrada.error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3">
              {entrada.error.message}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>Cancelar</Button>
            <Button type="submit" disabled={isPending} className="bg-green-600 hover:bg-green-700">
              {isPending ? "Registrando..." : "Registrar Entrada"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

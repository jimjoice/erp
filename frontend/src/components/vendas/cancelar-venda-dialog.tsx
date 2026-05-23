"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCancelarVenda } from "@/hooks/use-vendas-lista";
import type { VendaLista } from "@/types/venda-lista";

const schema = z.object({
  motivo: z.string().min(1, "Informe o motivo do cancelamento").max(200),
});

type FormData = z.infer<typeof schema>;

interface Props {
  venda: VendaLista | null;
  onClose: () => void;
}

export function CancelarVendaDialog({ venda, onClose }: Props) {
  const cancelar = useCancelarVenda();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    if (!venda) return;
    await cancelar.mutateAsync({ id: venda.id, dto: { motivo: data.motivo } });
    reset();
    onClose();
  }

  const isPending = isSubmitting || cancelar.isPending;

  return (
    <Dialog open={!!venda} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Cancelar Venda</DialogTitle>
          <DialogDescription>
            Cancelar venda{" "}
            <span className="font-medium text-foreground">#{venda?.numero}</span>.
            Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="motivo">Motivo do cancelamento *</Label>
            <Input id="motivo" {...register("motivo")} />
            {errors.motivo && <p className="text-xs text-destructive">{errors.motivo.message}</p>}
          </div>

          {cancelar.error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3">
              {cancelar.error.message}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => { reset(); onClose(); }} disabled={isPending}>
              Voltar
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? "Cancelando..." : "Confirmar Cancelamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

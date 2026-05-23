"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBaixarContaReceber, useBaixarContaPagar } from "@/hooks/use-financeiro";
import { brl } from "@/lib/formatters";

const FORMAS = ["Dinheiro", "Débito", "Crédito", "PIX", "Transferência", "Cheque", "Outros"];

const schema = z.object({
  valor: z.coerce.number().min(0.01, "Valor deve ser maior que zero"),
  formaPagamento: z.string().min(1, "Selecione a forma de pagamento"),
  dataPagamento: z.string().min(1, "Data obrigatória"),
  observacao: z.string().max(200).optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

interface Props {
  contaId: string | null;
  tipo: "receber" | "pagar";
  valorOriginal?: number;
  descricao?: string;
  onClose: () => void;
}

export function BaixarContaDialog({ contaId, tipo, valorOriginal, descricao, onClose }: Props) {
  const baixarReceber = useBaixarContaReceber();
  const baixarPagar = useBaixarContaPagar();

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      dataPagamento: new Date().toISOString().split("T")[0],
      formaPagamento: "Dinheiro",
    },
  });

  useEffect(() => {
    if (contaId) {
      reset({
        valor: valorOriginal ?? 0,
        formaPagamento: "Dinheiro",
        dataPagamento: new Date().toISOString().split("T")[0],
        observacao: "",
      });
    }
  }, [contaId, valorOriginal, reset]);

  async function onSubmit(data: FormData) {
    if (!contaId) return;
    const dto = { ...data, observacao: data.observacao || undefined };
    if (tipo === "receber") {
      await baixarReceber.mutateAsync({ id: contaId, dto });
    } else {
      await baixarPagar.mutateAsync({ id: contaId, dto });
    }
    onClose();
  }

  const isPending = isSubmitting || baixarReceber.isPending || baixarPagar.isPending;
  const apiError = baixarReceber.error?.message ?? baixarPagar.error?.message ?? null;

  return (
    <Dialog open={!!contaId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{tipo === "receber" ? "Registrar Recebimento" : "Registrar Pagamento"}</DialogTitle>
        </DialogHeader>

        {descricao && (
          <div className="rounded-md bg-muted/50 p-3 text-sm mb-2">
            <p className="font-medium">{descricao}</p>
            {valorOriginal != null && (
              <p className="text-muted-foreground">Valor original: <span className="font-medium text-foreground">{brl(valorOriginal)}</span></p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="valor">Valor pago (R$) *</Label>
            <Input id="valor" type="number" step="0.01" min="0.01" {...register("valor")} />
            {errors.valor && <p className="text-xs text-destructive">{errors.valor.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Forma de pagamento *</Label>
            <Controller
              name="formaPagamento"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FORMAS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.formaPagamento && <p className="text-xs text-destructive">{errors.formaPagamento.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dataPagamento">Data do pagamento *</Label>
            <Input id="dataPagamento" type="date" {...register("dataPagamento")} />
            {errors.dataPagamento && <p className="text-xs text-destructive">{errors.dataPagamento.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="observacao">Observação</Label>
            <Input id="observacao" {...register("observacao")} />
          </div>

          {apiError && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3">{apiError}</div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Registrando..." : tipo === "receber" ? "Confirmar Recebimento" : "Confirmar Pagamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

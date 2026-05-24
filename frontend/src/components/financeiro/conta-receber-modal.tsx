"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCriarContaReceber, useEditarContaReceber } from "@/hooks/use-financeiro";
import { clienteService } from "@/services/cliente-service";
import type { ContaReceber } from "@/types/financeiro";

const FORMAS_PAGAMENTO = [
  { value: "1", label: "Dinheiro" },
  { value: "2", label: "Débito" },
  { value: "3", label: "Crédito" },
  { value: "4", label: "PIX" },
  { value: "5", label: "Crediário" },
];

const schema = z.object({
  clienteId: z.string().uuid().nullable().optional(),
  descricao: z.string().min(1, "Descrição obrigatória").max(500),
  valor: z.coerce.number().min(0.01, "Valor deve ser maior que zero"),
  dataVencimento: z.string().min(1, "Data obrigatória"),
  formaPagamento: z.string().min(1, "Selecione a forma"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  conta?: ContaReceber | null;
  onClose: () => void;
}

export function ContaReceberModal({ open, conta, onClose }: Props) {
  const isEditing = !!conta;
  const criar = useCriarContaReceber();
  const editar = useEditarContaReceber();

  const [buscaCliente, setBuscaCliente] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState<{ id: string; nome: string } | null>(null);

  const { data: clientes } = useQuery({
    queryKey: ["clientes-modal", buscaCliente],
    queryFn: () => clienteService.listar({ search: buscaCliente, page: 1, pageSize: 8 }),
    enabled: buscaCliente.trim().length >= 2 && !clienteSelecionado,
    staleTime: 30_000,
  });

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (open) {
      if (conta) {
        reset({
          clienteId: conta.clienteId ?? null,
          descricao: conta.descricao,
          valor: conta.valor,
          dataVencimento: conta.dataVencimento.split("T")[0],
          formaPagamento: "1",
        });
        if (conta.clienteId && conta.clienteNome) {
          setClienteSelecionado({ id: conta.clienteId, nome: conta.clienteNome });
        }
      } else {
        reset({ clienteId: null, descricao: "", valor: 0, dataVencimento: "", formaPagamento: "1" });
        setClienteSelecionado(null);
        setBuscaCliente("");
      }
    }
  }, [open, conta, reset]);

  async function onSubmit(data: FormData) {
    if (isEditing && conta) {
      await editar.mutateAsync({ id: conta.id, dto: { descricao: data.descricao, valor: data.valor, dataVencimento: data.dataVencimento } });
    } else {
      await criar.mutateAsync({
        clienteId: clienteSelecionado?.id ?? null,
        descricao: data.descricao,
        valor: data.valor,
        dataVencimento: data.dataVencimento,
        formaPagamento: Number(data.formaPagamento),
      });
    }
    onClose();
  }

  const isPending = isSubmitting || criar.isPending || editar.isPending;
  const apiError = criar.error?.message ?? editar.error?.message ?? null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Conta a Receber" : "Nova Conta a Receber"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isEditing && (
            <div className="space-y-1.5">
              <Label>Cliente (opcional)</Label>
              {clienteSelecionado ? (
                <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 text-sm">
                  <span className="flex-1 font-medium">{clienteSelecionado.nome}</span>
                  <button type="button" className="text-muted-foreground hover:text-foreground text-xs" onClick={() => { setClienteSelecionado(null); setBuscaCliente(""); }}>
                    ×
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Input
                    placeholder="Buscar cliente..."
                    value={buscaCliente}
                    onChange={(e) => setBuscaCliente(e.target.value)}
                  />
                  {clientes && clientes.items.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow-md">
                      {clientes.items.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                          onClick={() => { setClienteSelecionado({ id: c.id, nome: c.nome }); setBuscaCliente(""); }}
                        >
                          <span className="font-medium">{c.nome}</span>
                          {c.cpfCnpj && <span className="ml-2 text-xs text-muted-foreground">{c.cpfCnpj}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
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

          {!isEditing && (
            <div className="space-y-1.5">
              <Label>Forma de pagamento *</Label>
              <Controller
                name="formaPagamento"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FORMAS_PAGAMENTO.map((f) => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.formaPagamento && <p className="text-xs text-destructive">{errors.formaPagamento.message}</p>}
            </div>
          )}

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

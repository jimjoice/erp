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
import { useCriarFornecedor, useAtualizarFornecedor } from "@/hooks/use-fornecedores";
import type { Fornecedor } from "@/types/fornecedor";

const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

const schema = z.object({
  razaoSocial: z.string().min(1, "Razão social obrigatória").max(200),
  nomeFantasia: z.string().max(200).optional().or(z.literal("")),
  cnpj: z.string().min(1, "CNPJ obrigatório").max(18),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  telefone: z.string().max(20).optional().or(z.literal("")),
  cep: z.string().max(9).optional().or(z.literal("")),
  logradouro: z.string().max(200).optional().or(z.literal("")),
  numero: z.string().max(20).optional().or(z.literal("")),
  complemento: z.string().max(100).optional().or(z.literal("")),
  bairro: z.string().max(100).optional().or(z.literal("")),
  cidade: z.string().max(100).optional().or(z.literal("")),
  uf: z.string().max(2).optional().or(z.literal("")),
  condicoesPagamento: z.string().max(200).optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  fornecedor: Fornecedor | null;
  onClose: () => void;
}

export function FornecedorModal({ open, fornecedor, onClose }: Props) {
  const isEdit = !!fornecedor;
  const criar = useCriarFornecedor();
  const atualizar = useAtualizarFornecedor();

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (open) {
      reset(
        fornecedor
          ? {
              razaoSocial: fornecedor.razaoSocial,
              nomeFantasia: fornecedor.nomeFantasia ?? "",
              cnpj: fornecedor.cnpj,
              email: fornecedor.email ?? "",
              telefone: fornecedor.telefone ?? "",
              cep: fornecedor.endereco?.cep ?? "",
logradouro: fornecedor.endereco?.logradouro ?? "",
numero: fornecedor.endereco?.numero ?? "",
complemento: fornecedor.endereco?.complemento ?? "",
bairro: fornecedor.endereco?.bairro ?? "",
cidade: fornecedor.endereco?.cidade ?? "",
uf: fornecedor.endereco?.uf ?? "",
              condicoesPagamento: fornecedor.condicoesPagamento ?? "",
            }
          : { razaoSocial: "", nomeFantasia: "", cnpj: "", email: "", telefone: "", cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "", condicoesPagamento: "" }
      );
    }
  }, [open, fornecedor, reset]);

  async function onSubmit(data: FormData) {
    const payload = {
      ...data,
      nomeFantasia: data.nomeFantasia || undefined,
      email: data.email || undefined,
      telefone: data.telefone || undefined,
      cep: data.cep || undefined,
      logradouro: data.logradouro || undefined,
      numero: data.numero || undefined,
      complemento: data.complemento || undefined,
      bairro: data.bairro || undefined,
      cidade: data.cidade || undefined,
      uf: data.uf || undefined,
      condicoesPagamento: data.condicoesPagamento || undefined,
    };
    if (isEdit) {
      await atualizar.mutateAsync({ id: fornecedor.id, dto: payload });
    } else {
      await criar.mutateAsync(payload);
    }
    onClose();
  }

  const isPending = isSubmitting || criar.isPending || atualizar.isPending;
  const apiError = criar.error?.message ?? atualizar.error?.message ?? null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar fornecedor" : "Novo fornecedor"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="razaoSocial">Razão Social *</Label>
              <Input id="razaoSocial" {...register("razaoSocial")} />
              {errors.razaoSocial && <p className="text-xs text-destructive">{errors.razaoSocial.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
              <Input id="nomeFantasia" {...register("nomeFantasia")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cnpj">CNPJ *</Label>
              <Input id="cnpj" {...register("cnpj")} />
              {errors.cnpj && <p className="text-xs text-destructive">{errors.cnpj.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="condicoesPagamento">Condições de Pagamento</Label>
              <Input id="condicoesPagamento" placeholder="Ex: 30/60/90 dias" {...register("condicoesPagamento")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" {...register("telefone")} />
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium text-muted-foreground mb-3">Endereço</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cep">CEP</Label>
                <Input id="cep" maxLength={9} {...register("cep")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="logradouro">Logradouro</Label>
                <Input id="logradouro" {...register("logradouro")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="numero">Número</Label>
                <Input id="numero" {...register("numero")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bairro">Bairro</Label>
                <Input id="bairro" {...register("bairro")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cidade">Cidade</Label>
                <Input id="cidade" {...register("cidade")} />
              </div>
              <div className="space-y-1.5">
                <Label>UF</Label>
                <Controller
                  name="uf"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {UFS.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>

          {apiError && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3">{apiError}</div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar fornecedor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

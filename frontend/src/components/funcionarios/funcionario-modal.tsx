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
import { useCriarFuncionario, useAtualizarFuncionario } from "@/hooks/use-funcionarios";
import type { Funcionario } from "@/types/funcionario";

const CARGOS = [
  { value: "Admin", label: "Administrador" },
  { value: "Gerente", label: "Gerente" },
  { value: "Vendedor", label: "Vendedor" },
  { value: "Financeiro", label: "Financeiro" },
] as const;

const schema = z.object({
  nome: z.string().min(1, "Nome obrigatório").max(200),
  cargo: z.enum(["Admin", "Gerente", "Vendedor", "Financeiro"]),
  email: z.string().email("E-mail inválido"),
  senha: z.string().optional().or(z.literal("")),
  telefone: z.string().max(20).optional().or(z.literal("")),
  cpf: z.string().max(14).optional().or(z.literal("")),
  salario: z.coerce.number().min(0).optional().or(z.literal("")),
  dataAdmissao: z.string().optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  funcionario: Funcionario | null;
  onClose: () => void;
}

export function FuncionarioModal({ open, funcionario, onClose }: Props) {
  const isEdit = !!funcionario;
  const criar = useCriarFuncionario();
  const atualizar = useAtualizarFuncionario();

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { cargo: "Vendedor" },
  });

  useEffect(() => {
    if (open) {
      reset(
        funcionario
          ? {
              nome: funcionario.nome,
              cargo: funcionario.cargo,
              email: funcionario.email,
              telefone: funcionario.telefone ?? "",
              cpf: funcionario.cpf ?? "",
              salario: funcionario.salario ?? ("" as unknown as number),
              dataAdmissao: funcionario.dataAdmissao
                ? funcionario.dataAdmissao.split("T")[0]
                : "",
            }
          : { nome: "", cargo: "Vendedor", email: "", senha: "", telefone: "", cpf: "", salario: "" as unknown as number, dataAdmissao: "" }
      );
    }
  }, [open, funcionario, reset]);

  async function onSubmit(data: FormData) {
    const salario = typeof data.salario === "number" && data.salario > 0 ? data.salario : undefined;
    if (isEdit) {
      await atualizar.mutateAsync({
        id: funcionario.id,
        dto: {
          nome: data.nome,
          cargo: data.cargo,
          email: data.email,
          telefone: data.telefone || undefined,
          cpf: data.cpf || undefined,
          salario,
          dataAdmissao: data.dataAdmissao || undefined,
        },
      });
    } else {
      if (!data.senha || data.senha.length < 6) return;
      await criar.mutateAsync({
        nome: data.nome,
        cargo: data.cargo,
        email: data.email,
        senha: data.senha,
        telefone: data.telefone || undefined,
        cpf: data.cpf || undefined,
        salario,
        dataAdmissao: data.dataAdmissao || undefined,
      });
    }
    onClose();
  }

  const isPending = isSubmitting || criar.isPending || atualizar.isPending;
  const apiError = criar.error?.message ?? atualizar.error?.message ?? null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar funcionário" : "Novo funcionário"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" {...register("nome")} />
            {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Cargo *</Label>
              <Controller
                name="cargo"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CARGOS.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail *</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
          </div>

          {!isEdit && (
            <div className="space-y-1.5">
              <Label htmlFor="senha">Senha *</Label>
              <Input id="senha" type="password" {...register("senha")} />
              {errors.senha && (
                <p className="text-xs text-destructive">{errors.senha.message}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" {...register("telefone")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cpf">CPF</Label>
              <Input id="cpf" {...register("cpf")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="salario">Salário (R$)</Label>
              <Input id="salario" type="number" step="0.01" min="0" {...register("salario")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dataAdmissao">Data de Admissão</Label>
              <Input id="dataAdmissao" type="date" {...register("dataAdmissao")} />
            </div>
          </div>

          {apiError && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3">{apiError}</div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar funcionário"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

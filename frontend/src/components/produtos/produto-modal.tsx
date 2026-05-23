"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategorias } from "@/hooks/use-categorias";
import { useCriarProduto, useAtualizarProduto } from "@/hooks/use-produtos";
import type { Produto, UnidadeMedida } from "@/types/produto";

const UNIDADES: { value: UnidadeMedida; label: string }[] = [
  { value: "UN", label: "Unidade (UN)" },
  { value: "KG", label: "Quilograma (KG)" },
  { value: "G", label: "Grama (G)" },
  { value: "L", label: "Litro (L)" },
  { value: "ML", label: "Mililitro (ML)" },
  { value: "M", label: "Metro (M)" },
  { value: "M2", label: "Metro² (M2)" },
  { value: "M3", label: "Metro³ (M3)" },
  { value: "CX", label: "Caixa (CX)" },
  { value: "PCT", label: "Pacote (PCT)" },
  { value: "PR", label: "Par (PR)" },
  { value: "DZ", label: "Dúzia (DZ)" },
];

const schema = z.object({
  nome: z.string().min(1, "Nome obrigatório").max(200),
  sku: z.string().min(1, "SKU obrigatório").max(50),
  codigoBarras: z.string().max(50).optional().or(z.literal("")),
  ncm: z
    .string()
    .regex(/^\d{8}$/, "NCM deve ter 8 dígitos numéricos")
    .optional()
    .or(z.literal("")),
  descricao: z.string().max(500).optional().or(z.literal("")),
  precoCusto: z.coerce.number().min(0, "Preço inválido"),
  precoVenda: z.coerce.number().min(0.01, "Preço deve ser maior que zero"),
  estoqueMinimo: z.coerce.number().min(0, "Valor inválido"),
  unidadeMedida: z.enum([
    "UN", "KG", "G", "L", "ML", "M", "M2", "M3", "CX", "PCT", "PR", "DZ",
  ]),
  categoriaId: z.string().min(1, "Selecione uma categoria"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  produto: Produto | null;
  onClose: () => void;
}

export function ProdutoModal({ open, produto, onClose }: Props) {
  const isEdit = !!produto;
  const { data: categorias } = useCategorias();
  const criar = useCriarProduto();
  const atualizar = useAtualizarProduto();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      unidadeMedida: "UN",
      precoCusto: 0,
      precoVenda: 0,
      estoqueMinimo: 0,
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        produto
          ? {
              nome: produto.nome,
              sku: produto.sku,
              codigoBarras: produto.codigoBarras ?? "",
              ncm: produto.ncm ?? "",
              descricao: produto.descricao ?? "",
              precoCusto: produto.precoCusto,
              precoVenda: produto.precoVenda,
              estoqueMinimo: produto.estoqueMinimo,
              unidadeMedida: produto.unidadeMedida,
              categoriaId: produto.categoriaId,
            }
          : {
              nome: "",
              sku: "",
              codigoBarras: "",
              ncm: "",
              descricao: "",
              precoCusto: 0,
              precoVenda: 0,
              estoqueMinimo: 0,
              unidadeMedida: "UN",
              categoriaId: "",
            }
      );
    }
  }, [open, produto, reset]);

  async function onSubmit(data: FormData) {
    const payload = {
      ...data,
      codigoBarras: data.codigoBarras || undefined,
      ncm: data.ncm || undefined,
      descricao: data.descricao || undefined,
    };

    if (isEdit) {
      const { sku: _sku, ...dto } = payload;
      await atualizar.mutateAsync({ id: produto.id, dto });
    } else {
      await criar.mutateAsync(payload);
    }
    onClose();
  }

  const isPending = isSubmitting || criar.isPending || atualizar.isPending;
  const apiError =
    criar.error?.message ?? atualizar.error?.message ?? null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar produto" : "Novo produto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nome */}
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" {...register("nome")} />
            {errors.nome && (
              <p className="text-xs text-destructive">{errors.nome.message}</p>
            )}
          </div>

          {/* SKU + Código de Barras */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="sku">SKU *</Label>
              <Input id="sku" {...register("sku")} disabled={isEdit} />
              {errors.sku && (
                <p className="text-xs text-destructive">{errors.sku.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="codigoBarras">Código de barras</Label>
              <Input id="codigoBarras" {...register("codigoBarras")} />
            </div>
          </div>

          {/* NCM + Unidade de medida */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ncm">NCM</Label>
              <Input id="ncm" placeholder="00000000" maxLength={8} {...register("ncm")} />
              {errors.ncm && (
                <p className="text-xs text-destructive">{errors.ncm.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Unidade de medida *</Label>
              <Controller
                name="unidadeMedida"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIDADES.map((u) => (
                        <SelectItem key={u.value} value={u.value}>
                          {u.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Categoria */}
          <div className="space-y-1.5">
            <Label>Categoria *</Label>
            <Controller
              name="categoriaId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoriaId && (
              <p className="text-xs text-destructive">
                {errors.categoriaId.message}
              </p>
            )}
          </div>

          {/* Preços + Estoque mínimo */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="precoCusto">Preço custo (R$) *</Label>
              <Input
                id="precoCusto"
                type="number"
                step="0.01"
                min="0"
                {...register("precoCusto")}
              />
              {errors.precoCusto && (
                <p className="text-xs text-destructive">
                  {errors.precoCusto.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="precoVenda">Preço venda (R$) *</Label>
              <Input
                id="precoVenda"
                type="number"
                step="0.01"
                min="0"
                {...register("precoVenda")}
              />
              {errors.precoVenda && (
                <p className="text-xs text-destructive">
                  {errors.precoVenda.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="estoqueMinimo">Estoque mínimo</Label>
              <Input
                id="estoqueMinimo"
                type="number"
                step="1"
                min="0"
                {...register("estoqueMinimo")}
              />
              {errors.estoqueMinimo && (
                <p className="text-xs text-destructive">
                  {errors.estoqueMinimo.message}
                </p>
              )}
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              rows={3}
              placeholder="Descrição opcional do produto..."
              {...register("descricao")}
            />
          </div>

          {apiError && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3">
              {apiError}
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar produto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Building2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const STORAGE_KEY = "erp-configuracoes";

const schema = z.object({
  razaoSocial: z.string().min(1, "Razão social obrigatória").max(200),
  nomeFantasia: z.string().max(200).optional().or(z.literal("")),
  cnpj: z.string().max(18).optional().or(z.literal("")),
  inscricaoEstadual: z.string().max(20).optional().or(z.literal("")),
  telefone: z.string().max(20).optional().or(z.literal("")),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  site: z.string().max(100).optional().or(z.literal("")),
  cep: z.string().max(9).optional().or(z.literal("")),
  logradouro: z.string().max(200).optional().or(z.literal("")),
  numero: z.string().max(20).optional().or(z.literal("")),
  complemento: z.string().max(100).optional().or(z.literal("")),
  bairro: z.string().max(100).optional().or(z.literal("")),
  cidade: z.string().max(100).optional().or(z.literal("")),
  uf: z.string().max(2).optional().or(z.literal("")),
  descontoMaximoPercent: z.coerce.number().min(0).max(100),
  sefazAmbiente: z.enum(["homologacao", "producao"]),
});

type FormData = z.infer<typeof schema>;

const DEFAULT_VALUES: FormData = {
  razaoSocial: "Minha Empresa LTDA",
  nomeFantasia: "",
  cnpj: "",
  inscricaoEstadual: "",
  telefone: "",
  email: "",
  site: "",
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "",
  descontoMaximoPercent: 30,
  sefazAmbiente: "homologacao",
};

export default function ConfiguracoesPage() {
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        reset(JSON.parse(stored));
      }
    } catch {
      // ignora erros de parse
    }
  }, [reset]);

  function onSubmit(data: FormData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    reset(data);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
          <p className="text-sm text-muted-foreground">Configurações do sistema e dados da empresa</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Dados da empresa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Dados da Empresa
            </CardTitle>
            <CardDescription>Informações cadastrais do estabelecimento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="razaoSocial">Razão Social *</Label>
                <Input id="razaoSocial" {...register("razaoSocial")} />
                {errors.razaoSocial && <p className="text-xs text-destructive">{errors.razaoSocial.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                <Input id="nomeFantasia" {...register("nomeFantasia")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input id="cnpj" {...register("cnpj")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inscricaoEstadual">Inscrição Estadual</Label>
                <Input id="inscricaoEstadual" {...register("inscricaoEstadual")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" {...register("telefone")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="site">Site</Label>
                <Input id="site" {...register("site")} />
              </div>
            </div>

            <Separator />

            <p className="text-sm font-medium text-muted-foreground">Endereço</p>
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
                <Label htmlFor="complemento">Complemento</Label>
                <Input id="complemento" {...register("complemento")} />
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
                <Label htmlFor="uf">UF</Label>
                <Input id="uf" maxLength={2} {...register("uf")} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferências */}
        <Card>
          <CardHeader>
            <CardTitle>Preferências</CardTitle>
            <CardDescription>Configurações operacionais do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="descontoMaximoPercent">Desconto máximo por venda (%)</Label>
                <Input
                  id="descontoMaximoPercent"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  {...register("descontoMaximoPercent")}
                />
                {errors.descontoMaximoPercent && (
                  <p className="text-xs text-destructive">{errors.descontoMaximoPercent.message}</p>
                )}
                <p className="text-xs text-muted-foreground">Regra aplicada a vendedores</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sefazAmbiente">Ambiente SEFAZ</Label>
                <select
                  id="sefazAmbiente"
                  {...register("sefazAmbiente")}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="homologacao">Homologação (testes)</option>
                  <option value="producao">Produção</option>
                </select>
                <p className="text-xs text-muted-foreground">Usado para emissão de NF-e / NFC-e</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aviso de dados locais */}
        <div className="rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3">
          As configurações são salvas localmente neste navegador. A integração com o backend será adicionada em versão futura.
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" className="gap-2" disabled={!isDirty && !saved}>
            <Save className="h-4 w-4" />
            {saved ? "Salvo!" : "Salvar configurações"}
          </Button>
          {saved && (
            <p className="text-sm text-green-600 font-medium">Configurações salvas com sucesso.</p>
          )}
        </div>
      </form>
    </div>
  );
}

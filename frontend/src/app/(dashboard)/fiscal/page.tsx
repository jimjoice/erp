import {
  FileText,
  Receipt,
  Building2,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MODULOS = [
  {
    titulo: "NFC-e — Nota Fiscal de Consumidor",
    descricao: "Emissão de cupom fiscal eletrônico para vendas no PDV (modelo 65).",
    status: "planejado" as const,
    icon: Receipt,
  },
  {
    titulo: "NF-e — Nota Fiscal Eletrônica",
    descricao: "Emissão de NF-e modelo 55 para vendas B2B e transferências.",
    status: "planejado" as const,
    icon: FileText,
  },
  {
    titulo: "Integração SEFAZ",
    descricao: "Comunicação com o webservice da SEFAZ para autorização e cancelamento de documentos fiscais.",
    status: "planejado" as const,
    icon: Building2,
  },
  {
    titulo: "Cálculo de Tributos",
    descricao: "Cálculo automático de ICMS, PIS, COFINS e IPI por NCM e regime tributário.",
    status: "planejado" as const,
    icon: CheckCircle,
  },
  {
    titulo: "Reforma Tributária 2026",
    descricao: "Adequação ao novo sistema de CBS/IBS conforme a Reforma Tributária.",
    status: "aguardando" as const,
    icon: Clock,
  },
  {
    titulo: "SPED Fiscal e Contribuições",
    descricao: "Geração dos arquivos SPED para obrigações acessórias mensais.",
    status: "planejado" as const,
    icon: FileText,
  },
];

const STATUS_CONFIG = {
  planejado: {
    label: "Planejado",
    variant: "secondary" as const,
  },
  aguardando: {
    label: "Aguardando regulamentação",
    variant: "outline" as const,
  },
};

export default function FiscalPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Receipt className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Módulo Fiscal</h1>
          <p className="text-sm text-muted-foreground">
            Emissão de documentos fiscais e obrigações acessórias
          </p>
        </div>
      </div>

      <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
        <CardContent className="flex items-start gap-3 pt-5">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Módulo em desenvolvimento
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              A integração fiscal (SEFAZ, NF-e, NFC-e) requer certificado digital A1/A3 e
              homologação junto à Secretaria da Fazenda do estado. Os recursos abaixo estarão
              disponíveis nas próximas versões.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {MODULOS.map((modulo) => {
          const config = STATUS_CONFIG[modulo.status];
          return (
            <Card key={modulo.titulo} className="opacity-80">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <modulo.icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <CardTitle className="text-base">{modulo.titulo}</CardTitle>
                  </div>
                  <Badge variant={config.variant} className="shrink-0 text-xs">
                    {config.label}
                  </Badge>
                </div>
                <CardDescription className="ml-6">{modulo.descricao}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

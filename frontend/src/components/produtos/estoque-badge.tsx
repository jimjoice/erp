import { Badge } from "@/components/ui/badge";
import { AlertTriangle, XCircle } from "lucide-react";

interface Props {
  estoqueAtual: number;
  estoqueMinimo: number;
}

export function EstoqueBadge({ estoqueAtual, estoqueMinimo }: Props) {
  if (estoqueAtual === 0) {
    return (
      <Badge variant="destructive" className="gap-1 text-xs">
        <XCircle className="h-3 w-3" />
        Zerado
      </Badge>
    );
  }
  if (estoqueAtual < estoqueMinimo) {
    return (
      <Badge
        variant="outline"
        className="gap-1 border-orange-400 text-orange-600 dark:text-orange-400 text-xs"
      >
        <AlertTriangle className="h-3 w-3" />
        Baixo
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="border-green-500 text-green-600 dark:text-green-400 text-xs"
    >
      Normal
    </Badge>
  );
}

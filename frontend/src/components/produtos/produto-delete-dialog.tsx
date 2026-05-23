"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useExcluirProduto } from "@/hooks/use-produtos";
import type { Produto } from "@/types/produto";

interface Props {
  produto: Produto | null;
  onClose: () => void;
}

export function ProdutoDeleteDialog({ produto, onClose }: Props) {
  const { mutateAsync, isPending } = useExcluirProduto();

  async function handleConfirm() {
    if (!produto) return;
    await mutateAsync(produto.id);
    onClose();
  }

  return (
    <Dialog open={!!produto} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Excluir produto</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir{" "}
            <span className="font-medium text-foreground">{produto?.nome}</span>?
            Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

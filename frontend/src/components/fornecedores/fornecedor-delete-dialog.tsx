"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useExcluirFornecedor } from "@/hooks/use-fornecedores";
import type { Fornecedor } from "@/types/fornecedor";

interface Props {
  fornecedor: Fornecedor | null;
  onClose: () => void;
}

export function FornecedorDeleteDialog({ fornecedor, onClose }: Props) {
  const { mutateAsync, isPending } = useExcluirFornecedor();

  async function handleConfirm() {
    if (!fornecedor) return;
    await mutateAsync(fornecedor.id);
    onClose();
  }

  return (
    <Dialog open={!!fornecedor} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Excluir fornecedor</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir{" "}
            <span className="font-medium text-foreground">{fornecedor?.razaoSocial}</span>?
            Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>Cancelar</Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

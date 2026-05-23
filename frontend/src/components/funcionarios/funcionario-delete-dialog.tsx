"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useExcluirFuncionario } from "@/hooks/use-funcionarios";
import type { Funcionario } from "@/types/funcionario";

interface Props {
  funcionario: Funcionario | null;
  onClose: () => void;
}

export function FuncionarioDeleteDialog({ funcionario, onClose }: Props) {
  const { mutateAsync, isPending } = useExcluirFuncionario();

  async function handleConfirm() {
    if (!funcionario) return;
    await mutateAsync(funcionario.id);
    onClose();
  }

  return (
    <Dialog open={!!funcionario} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Excluir funcionário</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir{" "}
            <span className="font-medium text-foreground">{funcionario?.nome}</span>?
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

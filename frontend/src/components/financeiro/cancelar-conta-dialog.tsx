"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  descricao?: string;
  isPending: boolean;
  onConfirmar: () => void;
  onClose: () => void;
}

export function CancelarContaDialog({ open, descricao, isPending, onConfirmar, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Cancelar conta</DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        {descricao && (
          <div className="rounded-md bg-muted/50 p-3 text-sm">
            <p className="font-medium">{descricao}</p>
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          Tem certeza que deseja cancelar esta conta?
        </p>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Voltar
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirmar} disabled={isPending}>
            {isPending ? "Cancelando..." : "Confirmar cancelamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

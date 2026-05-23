import { create } from "zustand";
import type { ItemCarrinho } from "@/types/venda";

type AddItemInput = Omit<ItemCarrinho, "localId" | "quantidade"> & {
  quantidade?: number;
};

interface PdvState {
  itens: ItemCarrinho[];
  descontoPercentual: number; // 0–30

  adicionarOuIncrementar: (item: AddItemInput) => void;
  removerItem: (localId: string) => void;
  incrementar: (localId: string) => void;
  decrementar: (localId: string) => void;
  setQuantidade: (localId: string, quantidade: number) => void;
  setDesconto: (percentual: number) => void;
  limpar: () => void;

  subtotal: () => number;
  descontoValor: () => number;
  total: () => number;
}

export const usePdvStore = create<PdvState>()((set, get) => ({
  itens: [],
  descontoPercentual: 0,

  adicionarOuIncrementar: (item) =>
    set((state) => {
      const existing = state.itens.find((i) => i.produtoId === item.produtoId);
      if (existing) {
        return {
          itens: state.itens.map((i) =>
            i.produtoId === item.produtoId
              ? {
                  ...i,
                  quantidade: Math.min(
                    i.quantidade + (item.quantidade ?? 1),
                    i.estoqueAtual
                  ),
                }
              : i
          ),
        };
      }
      return {
        itens: [
          ...state.itens,
          { ...item, localId: crypto.randomUUID(), quantidade: item.quantidade ?? 1 },
        ],
      };
    }),

  removerItem: (localId) =>
    set((state) => ({ itens: state.itens.filter((i) => i.localId !== localId) })),

  incrementar: (localId) =>
    set((state) => ({
      itens: state.itens.map((i) =>
        i.localId === localId && i.quantidade < i.estoqueAtual
          ? { ...i, quantidade: i.quantidade + 1 }
          : i
      ),
    })),

  decrementar: (localId) =>
    set((state) => ({
      itens: state.itens
        .map((i) =>
          i.localId === localId ? { ...i, quantidade: i.quantidade - 1 } : i
        )
        .filter((i) => i.quantidade > 0),
    })),

  setQuantidade: (localId, quantidade) =>
    set((state) => ({
      itens: state.itens.map((i) =>
        i.localId === localId
          ? { ...i, quantidade: Math.min(Math.max(1, quantidade), i.estoqueAtual) }
          : i
      ),
    })),

  setDesconto: (percentual) =>
    set({ descontoPercentual: Math.min(30, Math.max(0, percentual)) }),

  limpar: () => set({ itens: [], descontoPercentual: 0 }),

  subtotal: () =>
    get().itens.reduce((s, i) => s + i.precoUnitario * i.quantidade, 0),

  descontoValor: () => {
    const sub = get().subtotal();
    return Math.round(sub * (get().descontoPercentual / 100) * 100) / 100;
  },

  total: () => get().subtotal() - get().descontoValor(),
}));

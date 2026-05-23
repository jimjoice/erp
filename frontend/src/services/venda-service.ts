import api from "@/lib/axios";
import type { ItemCarrinho, PagamentoRascunho, FORMA_PAGAMENTO_INT } from "@/types/venda";
import { FORMA_PAGAMENTO_INT as FORMA_INT } from "@/types/venda";

interface VendaResponse {
  id: string;
  numero: number;
  status: string;
  subtotal: number;
  desconto: number;
  total: number;
}

export const vendaService = {
  criar: async (
    funcionarioId: string,
    itens: ItemCarrinho[],
    descontoPercentual: number
  ): Promise<VendaResponse> => {
    const subtotal = itens.reduce((s, i) => s + i.precoUnitario * i.quantidade, 0);
    const descontoTotal = Math.round(subtotal * (descontoPercentual / 100) * 100) / 100;

    const payload = {
      funcionarioId,
      itens: itens.map((i) => {
        const itemSubtotal = i.precoUnitario * i.quantidade;
        // distribute global discount proportionally per item
        const itemDesconto =
          subtotal > 0
            ? Math.round((descontoTotal * (itemSubtotal / subtotal)) * 100) / 100
            : 0;
        return {
          produtoId: i.produtoId,
          quantidade: i.quantidade,
          precoUnitario: i.precoUnitario,
          desconto: itemDesconto,
        };
      }),
    };

    const { data } = await api.post<VendaResponse>("/vendas", payload);
    return data;
  },

  finalizar: async (
    vendaId: string,
    pagamentos: PagamentoRascunho[]
  ): Promise<VendaResponse> => {
    const payload = {
      pagamentos: pagamentos.map((p) => ({
        forma: FORMA_INT[p.forma],
        valor: p.valor,
        parcelas: p.parcelas,
        taxaJuros: 0,
      })),
    };

    const { data } = await api.post<VendaResponse>(
      `/vendas/${vendaId}/finalizar`,
      payload
    );
    return data;
  },
};

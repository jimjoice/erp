import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chatService } from "@/services/chat-service";
import type { ChatHistoricoResponse, ChatMensagem } from "@/types/chat";

export function useChatEnviar() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (conteudo: string) =>
      chatService.enviarMensagem({ conteudo }),

    onMutate: async (conteudo) => {
      await qc.cancelQueries({ queryKey: ["chat", "historico"] });

      const prev = qc.getQueryData<ChatHistoricoResponse>(["chat", "historico"]);

      if (prev) {
        const optimistic: ChatMensagem = {
          id: `opt-${Date.now()}`,
          sessaoId: prev.sessaoId,
          conteudo,
          origem: "Usuario",
          statusEntrega: "Enviada",
          tempoRespostaMs: null,
          createdAt: new Date().toISOString(),
        };
        qc.setQueryData<ChatHistoricoResponse>(["chat", "historico"], {
          ...prev,
          mensagens: [...prev.mensagens, optimistic],
        });
      }

      return { prev };
    },

    onSuccess: (agentMsg) => {
      qc.setQueryData<ChatHistoricoResponse>(["chat", "historico"], (current) => {
        if (!current) return current;
        return { ...current, mensagens: [...current.mensagens, agentMsg] };
      });
    },

    onError: (_err, _vars, context) => {
      if (context?.prev) {
        qc.setQueryData(["chat", "historico"], context.prev);
      }
    },
  });
}

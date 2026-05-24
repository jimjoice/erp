import { useQuery } from "@tanstack/react-query";
import { chatService } from "@/services/chat-service";
import { useAuthStore } from "@/store/auth-store";
import { parseMensagem } from "@/types/chat";
import type { ChatHistoricoResponse } from "@/types/chat";

export function useChatHistorico() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ["chat", "historico"],
    queryFn: chatService.historico,
    enabled: isAuthenticated,
    staleTime: Infinity,
    gcTime: 10 * 60 * 1000,
    select: (data: ChatHistoricoResponse): ChatHistoricoResponse => ({
      ...data,
      mensagens: data.mensagens.map(parseMensagem),
    }),
  });
}

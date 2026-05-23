import { useQuery } from "@tanstack/react-query";
import { chatService } from "@/services/chat-service";
import { useAuthStore } from "@/store/auth-store";

export function useChatHistorico() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ["chat", "historico"],
    queryFn: chatService.historico,
    enabled: isAuthenticated,
    staleTime: Infinity,
    gcTime: 10 * 60 * 1000,
  });
}

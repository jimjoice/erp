import api from "@/lib/axios";
import type {
  ChatHistoricoResponse,
  EnviarMensagemRequest,
  EnviarMensagemResponse,
} from "@/types/chat";

export const chatService = {
  historico: (): Promise<ChatHistoricoResponse> =>
    api.get("/chat/historico").then((r) => r.data),

  enviarMensagem: (dto: EnviarMensagemRequest): Promise<EnviarMensagemResponse> =>
    api.post("/chat/mensagem", dto).then((r) => r.data),

  encerrarSessao: (): Promise<void> =>
    api.post("/chat/sessao/encerrar").then(() => undefined),
};

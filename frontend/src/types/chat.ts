export type OrigemMensagem = "Usuario" | "Agente";
export type StatusEntregaMensagem = "Enviada" | "Processando" | "Entregue" | "Erro";

export interface ChatMensagem {
  id: string;
  sessaoId: string;
  conteudo: string;
  origem: OrigemMensagem;
  statusEntrega: StatusEntregaMensagem;
  tempoRespostaMs: number | null;
  createdAt: string;
}

export interface ChatHistoricoResponse {
  sessaoId: string;
  mensagens: ChatMensagem[];
}

export interface EnviarMensagemRequest {
  conteudo: string;
}

export type EnviarMensagemResponse = ChatMensagem;

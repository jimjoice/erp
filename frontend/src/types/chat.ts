export type OrigemMensagem = "Usuario" | "Agente";
export type StatusEntregaMensagem = "Enviada" | "Processando" | "Entregue" | "Erro";

export type ChatResponseText = {
  type: "text";
  content: string;
};

export type ChatResponseChart = {
  type: "chart";
  chartType: "bar" | "line" | "pie";
  title: string;
  labels: string[];
  values: number[];
};

export type ChatResponse = ChatResponseText | ChatResponseChart;

export interface ChatMensagem {
  id: string;
  sessaoId: string;
  conteudo: string;
  origem: OrigemMensagem;
  statusEntrega: StatusEntregaMensagem;
  tempoRespostaMs: number | null;
  createdAt: string;
  tipo?: "text" | "chart";
  chartData?: ChatResponseChart;
}

export interface ChatHistoricoResponse {
  sessaoId: string;
  mensagens: ChatMensagem[];
}

export interface EnviarMensagemRequest {
  conteudo: string;
}

export type EnviarMensagemResponse = ChatMensagem;

export function parseMensagem(msg: ChatMensagem): ChatMensagem {
  if (msg.origem !== "Agente") return { ...msg, tipo: "text" };
  try {
    const parsed = JSON.parse(msg.conteudo) as ChatResponse;
    if (parsed.type === "chart") {
      return { ...msg, tipo: "chart", chartData: parsed };
    }
    if (parsed.type === "text") {
      return { ...msg, tipo: "text", conteudo: parsed.content };
    }
  } catch {
    // conteúdo não é JSON — tratar como texto simples
  }
  return { ...msg, tipo: "text" };
}

"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatHistorico } from "@/hooks/use-chat-historico";
import { useChatEnviar } from "@/hooks/use-chat-enviar";
import type { ChatMensagem } from "@/types/chat";

interface Props {
  onClose: () => void;
}

export function ChatPanel({ onClose }: Props) {
  const { data, isLoading } = useChatHistorico();
  const { mutate: enviar, isPending, isError } = useChatEnviar();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [data?.mensagens.length, isPending]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit() {
    const trimmed = input.trim();
    if (!trimmed || isPending) return;
    setInput("");
    enviar(trimmed);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold">Assistente ERP</span>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Fechar chat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Área de mensagens */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn("flex", i % 2 === 0 ? "justify-end" : "justify-start")}
              >
                <div className="h-10 w-48 animate-pulse rounded-2xl bg-muted" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && data?.mensagens.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-3 py-12 text-center">
            <Bot className="h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Como posso ajudar você hoje?</p>
          </div>
        )}

        {data?.mensagens.map((msg) => (
          <MessageBubble key={msg.id} mensagem={msg} />
        ))}

        {isPending && <TypingIndicator />}

        {isError && (
          <p className="text-center text-xs text-destructive">
            Não foi possível processar sua mensagem. Tente novamente.
          </p>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isPending}
            placeholder="Digite sua mensagem..."
            rows={1}
            className={cn(
              "max-h-32 flex-1 resize-none overflow-y-auto rounded-xl border bg-background px-3 py-2 text-sm",
              "placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-blue-500",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isPending}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
              "bg-blue-600 text-white transition-colors hover:bg-blue-700",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
            aria-label="Enviar mensagem"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ mensagem }: { mensagem: ChatMensagem }) {
  const isUser = mensagem.origem === "Usuario";
  const time = new Date(mensagem.createdAt).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={cn("flex flex-col", isUser ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
          isUser
            ? "rounded-br-sm bg-blue-600 text-white"
            : "rounded-bl-sm bg-muted text-foreground"
        )}
      >
        <p className="whitespace-pre-wrap break-words">{mensagem.conteudo}</p>
      </div>
      <span className="mt-1 text-xs text-muted-foreground">{time}</span>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start">
      <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

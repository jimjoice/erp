"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useChatHistorico } from "@/hooks/use-chat-historico";
import { ChatPanel } from "./ChatPanel";

export function ChatWidget() {
  const { isAuthenticated } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [lastSeenCount, setLastSeenCount] = useState(0);
  const { data } = useChatHistorico();

  if (!isAuthenticated) return null;

  const totalMsgs = data?.mensagens.length ?? 0;
  const unread = isOpen ? 0 : Math.max(0, totalMsgs - lastSeenCount);

  function handleOpen() {
    setIsOpen(true);
    setLastSeenCount(totalMsgs);
  }

  function handleClose() {
    setIsOpen(false);
    setLastSeenCount(totalMsgs);
  }

  return (
    <div className="fixed bottom-6 left-6 z-[9999]">
      {/* Painel de chat */}
      {isOpen && (
        <div
          className={cn(
            "absolute bottom-16 left-0 overflow-hidden",
            "border bg-background shadow-2xl",
            // Desktop
            "h-[520px] w-[360px] rounded-2xl",
            // Mobile: tela inteira
            "max-sm:fixed max-sm:inset-0 max-sm:h-full max-sm:w-full max-sm:rounded-none max-sm:border-0",
            // Animação de entrada
            "animate-in slide-in-from-bottom-4 fade-in-0 duration-200 ease-out"
          )}
        >
          <ChatPanel onClose={handleClose} />
        </div>
      )}

      {/* Botão flutuante */}
      <button
        onClick={isOpen ? handleClose : handleOpen}
        className={cn(
          "relative flex h-14 w-14 items-center justify-center rounded-full shadow-lg",
          "bg-blue-600 text-white transition-all duration-200",
          "hover:scale-105 hover:bg-blue-700 active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        )}
        aria-label={isOpen ? "Fechar chat" : "Abrir assistente ERP"}
      >
        <MessageSquare
          className={cn(
            "h-6 w-6 transition-transform duration-200",
            isOpen && "scale-90 opacity-70"
          )}
        />

        {/* Badge de mensagens não lidas */}
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-background">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
    </div>
  );
}

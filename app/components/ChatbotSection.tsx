"use client";

import React, { useState } from "react";
import { Bot, Send, X } from "lucide-react";
import { useAppStore } from "../lib/store";

export function ChatbotSection() {
  const { isChatbotOpen, setChatbotOpen } = useAppStore();
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content:
        "Halo! Saya TaniBot AI. Ada yang bisa saya bantu terkait harga beras, gabah, atau panduan panen?",
    },
  ]);
  const [input, setInput] = useState("");

  // Load history from localStorage on initial render
  React.useEffect(() => {
    const initChat = () => {
      const savedHistory = localStorage.getItem("tanibot_chat_history");
      if (savedHistory) {
        try {
          setMessages(JSON.parse(savedHistory));
        } catch {
          console.error("Failed to parse chat history");
        }
      }
    };
    
    initChat();
  }, []);

  // Save history to localStorage whenever messages change
  React.useEffect(() => {
    // Jangan simpan state loading "..." ke dalam history
    const messagesToSave = messages.filter((m) => m.content !== "...");
    localStorage.setItem("tanibot_chat_history", JSON.stringify(messagesToSave));
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const currentInput = input;
    setMessages((prev) => [...prev, { role: "user", content: currentInput }]);
    setInput("");

    // Temporary loading message
    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        content: `...`,
      },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput }),
      });
      const data = await res.json();

      // Replace the loading message with the actual response
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: "ai",
          content: data.content || data.error || "Terjadi kesalahan",
        };
        return newMessages;
      });
    } catch {
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: "ai",
          content: "Maaf, terjadi kesalahan pada sistem AI.",
        };
        return newMessages;
      });
    }
  };

  return (
    <>
      {!isChatbotOpen && (
        <button
          onClick={() => setChatbotOpen(true)}
          className="fixed bottom-6 right-6 p-4 rounded-full bg-[#15291b] text-[#d6f837] border-2 border-[#d6f837]/40 shadow-2xl hover:scale-110 hover:bg-[#1a3322] transition-all z-50 flex items-center justify-center group animate-bounce"
          title="Tanya TaniBot AI"
        >
          <Bot className="w-7 h-7 stroke-[2.2] group-hover:rotate-12 transition-transform" />
        </button>
      )}

      {isChatbotOpen && (
        <div className="fixed bottom-6 right-6 w-[360px] sm:w-[420px] h-[520px] bg-white border border-[#e2e0d4] shadow-2xl rounded-[1.75rem] flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-8">
          <div className="bg-[#15291b] p-4 px-5 flex justify-between items-center text-white border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#d6f837] text-[#121e14] flex items-center justify-center font-bold">
                <Bot className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white leading-tight">
                  TaniBot AI Assistant
                </h4>
                <p className="text-[11px] text-[#d6f837] font-semibold">
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setChatbotOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f4f3ea]">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed font-medium whitespace-pre-wrap break-words ${
                    m.role === "user"
                      ? "bg-[#15291b] text-[#d6f837] rounded-tr-xs shadow-sm"
                      : "bg-white text-[#121e14] border border-[#e2e0d4] rounded-tl-xs shadow-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSend}
            className="p-3 bg-white border-t border-[#e2e0d4] flex items-end gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e as unknown as React.FormEvent);
                }
              }}
              placeholder="Tulis pertanyaan seputar beras..."
              className="flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-[#e2e0d4] bg-[#f4f3ea] text-[#121e14] font-medium focus:outline-none focus:ring-2 focus:ring-[#15291b] resize-none min-h-[44px] max-h-[200px] scrollbar-thin"
              rows={1}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-3 mb-0.5 rounded-xl bg-[#15291b] text-[#d6f837] hover:bg-[#1a3322] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

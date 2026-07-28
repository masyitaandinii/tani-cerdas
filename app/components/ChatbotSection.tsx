import React, { useState } from 'react';
import { Bot, Send, X } from 'lucide-react';
import { useAppStore } from '../lib/store';

export function ChatbotSection() {
    const { isChatbotOpen, setChatbotOpen } = useAppStore();
    const [messages, setMessages] = useState([
        { role: 'ai', content: 'Halo! Saya TaniBot AI. Ada yang bisa saya bantu terkait harga beras, gabah, atau panduan panen?' }
    ]);
    const [input, setInput] = useState('');

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Add user message
        setMessages(prev => [...prev, { role: 'user', content: input }]);
        const currentInput = input;
        setInput('');

        // Mock AI reply
        setTimeout(() => {
            setMessages(prev => [...prev, {
                role: 'ai',
                content: `Informasi mengenai "${currentInput}" sedang diproses oleh sistem TaniBot AI.`
            }]);
        }, 1000);
    };

    return (
        <>
            {/* Floating Button if closed */}
            {!isChatbotOpen && (
                <button
                    onClick={() => setChatbotOpen(true)}
                    className="fixed bottom-6 right-6 p-4 rounded-full bg-[#15291b] text-[#d6f837] border-2 border-[#d6f837]/40 shadow-2xl hover:scale-110 hover:bg-[#1a3322] transition-all z-50 flex items-center justify-center group animate-bounce"
                    title="Tanya TaniBot AI"
                >
                    <Bot className="w-7 h-7 stroke-[2.2] group-hover:rotate-12 transition-transform" />
                </button>
            )}

            {/* Chat Window */}
            {isChatbotOpen && (
                <div className="fixed bottom-6 right-6 w-[360px] sm:w-[420px] h-[520px] bg-white border border-[#e2e0d4] shadow-2xl rounded-[1.75rem] flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-8">
                    {/* Header */}
                    <div className="bg-[#15291b] p-4 px-5 flex justify-between items-center text-white border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#d6f837] text-[#121e14] flex items-center justify-center font-bold">
                                <Bot className="w-5 h-5 stroke-[2.5]" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-white leading-tight">TaniBot AI Assistant</h4>
                                <p className="text-[11px] text-[#d6f837] font-semibold">Online • Siap Membantu</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setChatbotOpen(false)}
                            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5 stroke-[2.5]" />
                        </button>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f4f3ea]">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed font-medium ${
                                    m.role === 'user'
                                        ? 'bg-[#15291b] text-[#d6f837] rounded-tr-xs shadow-sm'
                                        : 'bg-white text-[#121e14] border border-[#e2e0d4] rounded-tl-xs shadow-sm'
                                }`}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input Form */}
                    <form onSubmit={handleSend} className="p-3 bg-white border-t border-[#e2e0d4] flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Tulis pertanyaan seputar beras..."
                            className="flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-[#e2e0d4] bg-[#f4f3ea] text-[#121e14] font-medium focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                        />
                        <button
                            type="submit"
                            className="p-3 rounded-xl bg-[#15291b] text-[#d6f837] hover:bg-[#1a3322] transition-colors shrink-0"
                        >
                            <Send className="w-4 h-4 stroke-[2.5]" />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
}

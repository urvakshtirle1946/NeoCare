"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  messages: Message[];
  onSend: (text: string) => void;
}

export default function ChatUI({ messages, onSend }: Props) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const sendMessage = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-[75vh] bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden">

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                }`}
            >
              <div
                className={`
                  max-w-[75%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap
                  ${msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-neutral-800 text-neutral-200 rounded-bl-none"
                  }
                `}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t border-neutral-800 bg-neutral-900 flex items-center gap-3">
        <input
          className="
            flex-1 px-4 py-2 rounded-xl bg-neutral-800
            text-white placeholder-neutral-500
            focus:outline-none focus:ring-1 focus:ring-neutral-600
          "
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button
          onClick={sendMessage}
          className="
            p-2 rounded-xl bg-blue-600 text-white 
            hover:bg-blue-500 transition-all duration-150
          "
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

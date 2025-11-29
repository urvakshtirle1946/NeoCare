"use client";

import { useState } from "react";
import ChatUI from "@/components/ChatUI";
import axios from "axios";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSend = async (text: string) => {
    const newUserMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, newUserMsg]);

    try {
      const res = await axios.post("/api/chat", { message: text });
      const botMsg: Message = res.data;
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Failed to get a response from AI." },
      ]);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-4 relative">
      <div className="absolute top-4 left-4 z-20">
        <Link href="/">
          <Button className="rounded-full bg-white text-black px-4 py-1.5 text-xs font-semibold tracking-[0.25em] hover:bg-slate-200">
            HOME
          </Button>
        </Link>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="
          w-full max-w-3xl
          bg-neutral-900
          border border-neutral-800
          rounded-2xl shadow-xl
          p-4 md:p-6
        "
      >
        <h1 className="text-white text-2xl font-semibold mb-4 text-center">
          AI Chat Assistant
        </h1>

        <ChatUI messages={messages} onSend={handleSend} />
      </motion.div>
    </div>
  );
}

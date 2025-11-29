import { NextResponse } from "next/server";

// Groq API: https://api.groq.com/openai/v1/chat/completions (OpenAI-compatible)
// Set GROQ_API_KEY in .env.local

const { GROQ_API_KEY } = process.env;

export async function POST(req: Request) {
  if (!GROQ_API_KEY) {
    return NextResponse.json(
      { error: "Missing GROQ_API_KEY" },
      { status: 500 }
    );
  }

  try {
    const { message, messages, system, model = "llama-3.1-8b-instant", temperature = 0.3 } = await req.json();
    // Support either single message or full messages array
    let chatMessages: { role: string; content: string }[] = [];
    if (Array.isArray(messages) && messages.length > 0) {
      chatMessages = messages.filter(m => typeof m?.content === 'string' && typeof m?.role === 'string');
    } else if (typeof message === 'string' && message.length > 0) {
      chatMessages = [{ role: 'user', content: message }];
    } else {
      return NextResponse.json(
        { error: "Invalid payload: provide 'message' string or 'messages' array" },
        { status: 400 }
      );
    }

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system ?? "You are a helpful interview assistant conducting a cognitive and general conversation assessment. Ask concise, clear follow-up questions based on prior answers." },
          ...chatMessages,
        ],
        temperature,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      console.error("Groq API error", res.status, json);
      return NextResponse.json(
        { error: "Groq API error", details: json },
        { status: 502 }
      );
    }

    const content = json?.choices?.[0]?.message?.content ?? "";
    return NextResponse.json({ content });
  } catch (err: any) {
    console.error("/api/voice error", err);
    return NextResponse.json(
      { error: "Server error", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}

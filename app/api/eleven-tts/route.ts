import { NextResponse } from "next/server";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const DEFAULT_VOICE_ID = process.env.ELEVEN_VOICE_ID ?? "EaBs7G1VibMrNAuz2Na7";
const DEFAULT_MODEL_ID = process.env.ELEVEN_MODEL_ID ?? "eleven_multilingual_v2";

export async function POST(req: Request) {
  if (!ELEVENLABS_API_KEY) {
    console.error("Missing ELEVENLABS_API_KEY environment variable");
    return NextResponse.json({ error: "Missing ELEVENLABS_API_KEY" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const text = body?.text;
    const voiceId = body?.voiceId ?? DEFAULT_VOICE_ID;
    const modelId = body?.modelId ?? DEFAULT_MODEL_ID;

    if (!text) {
      return NextResponse.json({ error: "Missing 'text' in request body" }, { status: 400 });
    }

    const apiURL = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    const response = await fetch(apiURL, {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({ text, model_id: modelId, voice_settings: { stability: 0.5, similarity_boost: 0.8 } }),
    });

    if (!response.ok) {
      const txt = await response.text();
      console.error("ElevenLabs TTS error", response.status, txt);
      return NextResponse.json({ error: "ElevenLabs TTS error", details: txt }, { status: 502 });
    }

    const buffer = await response.arrayBuffer();
    return new NextResponse(buffer, { status: 200, headers: { "Content-Type": "audio/mpeg" } });
  } catch (err: any) {
    console.error("/api/eleven-tts error", err);
    return NextResponse.json({ error: "Server error", details: err?.message ?? String(err) }, { status: 500 });
  }
}


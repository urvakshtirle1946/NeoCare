"use client";

import React, { useEffect, useRef, useState } from "react";

export default function VoiceOnly() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [assistantReply, setAssistantReply] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Browser SpeechRecognition wrapper
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("SpeechRecognition not supported by this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const text = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join(" ");
      setTranscript(text);
      sendTranscript(text);
    };

    recognition.onerror = (ev: any) => {
      console.error("Speech recognition error", ev);
      setError("Speech recognition error: " + (ev?.error || "unknown"));
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  async function sendTranscript(text: string) {
    setAssistantReply("");
    setError(null);

    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const json = await res.json();

      // Diagnostic: if API returns empty object, log full response
      if (!json || Object.keys(json).length === 0) {
        console.error("Empty response from /api/voice", { status: res.status, ok: res.ok, body: json });
        setError("API returned empty response. Check server logs.");
        return;
      }

      const content = json.content || json.message || "";
      setAssistantReply(content);

      // Speak it
      if (content) {
        speakText(content);
      }
    } catch (err: any) {
      console.error("Fetch /api/voice error", err);
      setError("Network error while calling /api/voice: " + (err?.message || String(err)));
    }
  }

  function speakText(text: string) {
    if (!window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  function startListening() {
    setError(null);
    setTranscript("");
    setAssistantReply("");
    try {
      recognitionRef.current?.start();
      setListening(true);
    } catch (e: any) {
      setError("Could not start speech recognition: " + (e?.message || String(e)));
    }
  }

  function stopListening() {
    try {
      recognitionRef.current?.stop();
    } catch (e) {
      // ignore
    }
    setListening(false);
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 max-w-full rounded-lg border bg-white/5 p-4 text-white backdrop-blur-lg">
      <h3 className="mb-2 font-semibold">Voice Only</h3>
      <div className="flex gap-2">
        <button
          className={`rounded-md px-3 py-2 ${listening ? 'bg-red-600' : 'bg-green-600'}`}
          onClick={() => (listening ? stopListening() : startListening())}
        >
          {listening ? 'Stop' : 'Start'}
        </button>
        <button
          className="rounded-md px-3 py-2 bg-blue-600"
          onClick={() => {
            if (transcript) sendTranscript(transcript);
          }}
        >
          Send
        </button>
      </div>

      <div className="mt-3 text-sm">
        <div><strong>Transcript:</strong> {transcript}</div>
        <div className="mt-2"><strong>Assistant:</strong> {assistantReply}</div>
        {error && <div className="mt-2 text-red-400">Error: {error}</div>}
      </div>
    </div>
  );
}

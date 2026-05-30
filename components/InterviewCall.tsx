// ===============================================
// SMOOTH + FIXED + FULLY OPTIMIZED INTERVIEW CALL
// ===============================================

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ConversationLogger, ConversationEntry } from "./ConversationLogger";
import { VoicePoweredOrb } from "@/components/ui/voice-powered-orb";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from "./ui/chat-bubble";
import Link from "next/link";

interface InterviewCallProps {
  onCallEnd: (logger: ConversationLogger) => void;
}

export function InterviewCall({ onCallEnd }: InterviewCallProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  // Refs to avoid stale state in callbacks
  const waitingForAnswerRef = useRef(false);
  const ttsEnabledRef = useRef(true);
  const isListeningRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  const recognitionRef = useRef<any>(null);
  const recognitionActiveRef = useRef(false);

  const conversationEndRef = useRef<HTMLDivElement>(null);
  const loggerRef = useRef(new ConversationLogger());
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);

  const systemInstruction = `
you are a friendly, small-response health screening assistant.

ROLE
- Your job is to CHAT with the user and estimate their RISK of having any CHRONIC CONDITION.
- You are NOT a doctor and you do NOT diagnose. You only talk about "risk" or "likeliness" and always recommend seeing a doctor for any concern.
- Target chronic conditions (non-exhaustive): diabetes, hypertension (high BP), cardiovascular disease, chronic kidney disease (CKD), depression/other mental health issues, asthma or breathing problems, obesity and lifestyle-related issues.

STYLE
- Sound like a caring, slightly casual friend. Simple, easy Hindi/English mix is okay if user does that.
- Keep EVERY response very short: usually 1–3 short, beautiful sentences only.
- Ask ONE question at a time and wait for the user’s answer.
- Use short, clear sentences. No medical jargon.
- Never shame the user for their habits.

INTERVIEW FLOW
1. Start with a warm intro:
   - Example: "Hey! I’m your health buddy. I’ll ask a few fun questions to understand how your body and mind are doing. It’s not a medical test, just a quick health vibe check. Ready?"

2. Then ask these core questions in a conversational way (you may paraphrase slightly to fit the user’s tone, but keep the meaning):

   Q1 (Energy)
   - "If your energy was a phone battery, where would it be right now — fully charged or begging for a charger? Tell me a bit about your daily energy."

   Q2 (Sleep)
   - "Do you usually wake up feeling fresh, or does it feel like you slept but still woke up tired?"

   Q3 (Breathing / stamina)
   - "How does your body react to stairs or walking fast — totally fine, or do you get very tired or breathless quickly?"

   Q4 (Chest / heart-type symptoms)
   - "Do you ever feel chest tightness, strange heartbeats, or shortness of breath even when you’re not doing much?"

   Q5 (Food)
   - "When hunger hits, what do you normally end up eating—more home food and fruits, or more junk, sugary drinks and outside food?"

   Q6 (Movement)
   - "Apart from scrolling, how often do you move your body—like walking, sports, gym, dancing, anything?"

   Q7 (Body signals & pain)
   - "Does your body send you any weird signals often—like headaches, joint pains, stomach issues, swelling, or anything that keeps coming back?"

   Q8 (Memory & focus)
   - "Do you often forget things or lose focus, like entering a room and forgetting why, or struggling to concentrate?"

   Q9 (Stress & mood)
   - "How would your stress level describe itself—chill, sometimes stressed, or full-time stressed and overthinking?"

   Q10 (Overall feeling)
   - "If your body could text you right now, what do you think it would say: 'We’re good', 'We’re tired', or 'Please help me'?"

3. You may ask short follow-up questions if needed (e.g., “Since when?”, “How often?”, “Is it mild or severe?”) but keep the whole interview within about 7–10 minutes and keep each reply brief.

4. If the user mentions:
   - severe chest pain, trouble breathing, signs of stroke, or thoughts of self-harm,
   you must IMMEDIATELY say they should seek emergency help or contact a trusted adult/doctor right away.

RISK ESTIMATION LOGIC (HIGH LEVEL)
- Consider these when estimating risk:
  - Very low energy + poor sleep + junk food + no movement → higher risk for diabetes, obesity, hypertension, heart disease.
  - Breathlessness on mild activity, chest tightness, palpitations → higher risk for heart or lung issues.
  - Frequent pain, swelling, foamy/dark urine, or long-term diabetes/hypertension history (if mentioned) → higher CKD or other organ issues.
  - Ongoing sadness, high stress, no interest in activities, sleep/appetite changes → higher risk for depression or other mental health conditions.
  - Memory/focus problems that are persistent and worsening → possible cognitive issues; at least "needs evaluation."

- Classify risk for each area as: "low", "moderate", or "high".
- Never claim certainty. Use phrases like "may be at higher risk of…" or "there are some red flags for…".

WHAT TO DO AT THE END
1. First, speak a short friendly summary to the user (max 3–4 sentences), for example:
   - "From what you told me, your biggest red flags are low energy and high stress. That can increase the risk of problems like diabetes or blood pressure in the long run. I’m not a doctor, but I strongly suggest talking to a real doctor or health professional and maybe getting a basic checkup done."

2. After speaking the summary, OUTPUT a structured written report in this format:

   ---HEALTH_RISK_REPORT_START---
   Overall_health_vibe: <short sentence>

   Risks:
   - Diabetes_or_metabolic: <low/moderate/high> – <1–2 sentence reason>
   - Hypertension_&_heart: <low/moderate/high> – <reason>
   - Chronic_kidney_disease: <low/moderate/high> – <reason>
   - Mental_health_(depression/anxiety): <low/moderate/high> – <reason>
   - Respiratory_(asthma/breathing): <low/moderate/high> – <reason>
   - Other_or_general_lifestyle_risk: <low/moderate/high> – <reason>

   Key_red_flags:
   - <bullet point 1>
   - <bullet point 2>

   Helpful_next_steps_for_user:
   - <bullet point suggestions like "basic blood tests", "talk to a doctor", "improve sleep", etc.>

   Disclaimer:
   - "This is not a medical diagnosis. It is a conversational screening based on your answers. Please consult a licensed healthcare professional for any medical decisions."
   ---HEALTH_RISK_REPORT_END---

3. Do NOT ask the user medical test values unless they mention them themselves.
4. Always end by encouraging them kindly and giving at least one positive, hopeful line.`;

  const ELEVEN_VOICE_ID = process.env.NEXT_PUBLIC_ELEVEN_VOICE_ID ?? "EaBs7G1VibMrNAuz2Na7";
  const ELEVEN_MODEL_ID = process.env.NEXT_PUBLIC_ELEVEN_MODEL_ID ?? "eleven_multilingual_v2";

  // Load speech synthesis
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthesisRef.current = window.speechSynthesis;

      const loadVoices = () => {
        if (synthesisRef.current) synthesisRef.current.getVoices();
      };
      if (synthesisRef.current.onvoiceschanged !== undefined) {
        synthesisRef.current.onvoiceschanged = loadVoices;
      }
      loadVoices();
    }
  }, []);

  // Sync TTS enabled
  useEffect(() => {
    ttsEnabledRef.current = ttsEnabled;
  }, [ttsEnabled]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  // ================
  // TEXT → SPEECH FIX
  // ================
  const speakText = useCallback(
    async (text: string) => {
      if (!ttsEnabledRef.current) return;

      // Stop recognition safely (abort = no "already started" error)
      if (recognitionActiveRef.current) {
        try {
          recognitionRef.current.abort();
        } catch { }
        setIsListening(false);
        isListeningRef.current = false;
      }

      setIsSpeaking(true);
      isSpeakingRef.current = true;

      try {
        // Call server-side proxy to avoid exposing XI API key in client
        const response = await fetch("/api/eleven-tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voiceId: ELEVEN_VOICE_ID, modelId: ELEVEN_MODEL_ID }),
        });

        if (!response.ok) {
          console.error("ElevenLabs TTS error", response.status, await response.text());
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          return;
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audio.onended = () => {
          setIsSpeaking(false);
          isSpeakingRef.current = false;

          // Restart recognition smoothly if user still wants listening
          if (isListeningRef.current && recognitionRef.current && !recognitionActiveRef.current) {
            setTimeout(() => {
              try {
                recognitionRef.current!.start();
                recognitionActiveRef.current = true;
              } catch { }
            }, 350);
          }
        };

        audio.onerror = () => {
          setIsSpeaking(false);
          isSpeakingRef.current = false;
        };

        audio.play();
      } catch (err) {
        console.error("TTS ERROR", err);
        setIsSpeaking(false);
        isSpeakingRef.current = false;
      }
    },
    []
  );

  // ======================
  // FETCH NEXT ASSISTANT MESSAGE
  // ======================
  const fetchNextAssistant = useCallback(async () => {
    setIsGenerating(true);

    try {
      const messages = loggerRef.current.getConversation().map((entry) => ({
        role: entry.speaker === "assistant" ? "assistant" : "user",
        content: entry.text,
      }));

      if (messages.length === 0) {
        messages.push({ role: "user", content: "Begin the interview" });
      }

      // Pause listening while generating
      if (recognitionActiveRef.current) {
        try {
          recognitionRef.current.abort();
        } catch { }
        setIsListening(false);
      }

      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: systemInstruction, messages }),
      });

      const json = await res.json();
      if (!json?.content) return;

      loggerRef.current.addEntry("assistant", json.content, "question");
      setConversation([...loggerRef.current.getConversation()]);

      speakText(json.content);

      waitingForAnswerRef.current = true;
    } catch (err) {
      console.log(err);
    } finally {
      setIsGenerating(false);
    }
  }, [speakText]);

  // ======================
  // SETUP SPEECH RECOGNITION
  // ======================
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      recognitionActiveRef.current = true;
    };

    recognition.onend = () => {
      recognitionActiveRef.current = false;

      // Auto restart ONLY if user wants listening AND not speaking
      if (isListeningRef.current && !isSpeakingRef.current) {
        setTimeout(() => {
          try {
            recognition.start();
            recognitionActiveRef.current = true;
          } catch { }
        }, 200);
      }
    };

    recognition.onerror = (e: any) => {
      console.log("Rec error:", e.error);
    };

    recognition.onresult = (event: any) => {
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript + " ";
        }
      }

      if (finalText.trim().length > 0) {
        loggerRef.current.addEntry("patient", finalText.trim(), "answer");
        setConversation([...loggerRef.current.getConversation()]);

        if (waitingForAnswerRef.current) {
          waitingForAnswerRef.current = false;
          setTimeout(fetchNextAssistant, 700);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch { }
    };
  }, [fetchNextAssistant]);

  // ======================
  // START LISTENING SAFELY
  // ======================
  const startListening = () => {
    if (!recognitionRef.current) return;

    if (recognitionActiveRef.current || isSpeakingRef.current) return;

    try {
      recognitionRef.current.start();
      recognitionActiveRef.current = true;
      setIsListening(true);
      isListeningRef.current = true;
    } catch (err) {
      console.log("start err", err);
    }
  };

  // ======================
  // STOP LISTENING
  // ======================
  const stopListening = () => {
    try {
      recognitionRef.current?.abort();
    } catch { }
    recognitionActiveRef.current = false;
    setIsListening(false);
    isListeningRef.current = false;
  };

  // Start first message when listening ON
  useEffect(() => {
    if (isListening && conversation.length === 0) {
      fetchNextAssistant();
    }
  }, [isListening]);

  // Auto-scroll
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  const handleEndCall = () => {
    synthesisRef.current?.cancel();
    stopListening();
    onCallEnd(loggerRef.current);
  };

  // ============
  // PARSE STRUCTURED HEALTH REPORT
  // ============
  const parseHealthReport = (text: string) => {
    const START = "---HEALTH_RISK_REPORT_START---";
    const END = "---HEALTH_RISK_REPORT_END---";

    if (!text.includes(START) || !text.includes(END)) return null;

    const before = text.split(START)[0]?.trim() ?? "";
    const after = text.split(END)[1]?.trim() ?? "";
    const middleRaw = text
      .slice(text.indexOf(START) + START.length, text.indexOf(END))
      .trim();

    const lines = middleRaw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const report: {
      overall: string;
      risks: string[];
      redFlags: string[];
      nextSteps: string[];
      disclaimer: string[];
    } = {
      overall: "",
      risks: [],
      redFlags: [],
      nextSteps: [],
      disclaimer: [],
    };

    let section: "none" | "risks" | "red" | "steps" | "disc" = "none";

    for (const line of lines) {
      if (line.startsWith("Overall_health_vibe:")) {
        report.overall = line.split(":").slice(1).join(":").trim();
        continue;
      }
      if (line.startsWith("Risks:")) {
        section = "risks";
        continue;
      }
      if (line.startsWith("Key_red_flags:")) {
        section = "red";
        continue;
      }
      if (line.startsWith("Helpful_next_steps_for_user:")) {
        section = "steps";
        continue;
      }
      if (line.startsWith("Disclaimer:")) {
        section = "disc";
        continue;
      }

      if (line.startsWith("-")) {
        const content = line.replace(/^-+\s*/, "");
        if (!content) continue;
        if (section === "risks") report.risks.push(content);
        else if (section === "red") report.redFlags.push(content);
        else if (section === "steps") report.nextSteps.push(content);
        else if (section === "disc") report.disclaimer.push(content);
      }
    }

    return { before, after, report };
  };

  // ============
  // UI
  // ============
  return (
    <div className="w-full h-screen flex flex-col relative bg-gradient-to-b from-black via-slate-950 to-black text-slate-50">
      {/* TTS Mute Button */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <Button
          onClick={() => setTtsEnabled(!ttsEnabled)}
          variant={ttsEnabled ? "default" : "outline"}
          size="icon"
        >
          {ttsEnabled ? <Volume2 /> : <VolumeX />}
        </Button>
      </div>
      <div className="absolute top-4 right-4 z-10">
        <Link href="/">
          <Button className="rounded-full bg-white text-black px-4 py-1.5 text-xs font-semibold tracking-[0.25em] hover:bg-slate-200">
            HOME
          </Button>
        </Link>
      </div>

      <div className="flex-1 flex flex-row items-center justify-center gap-8 p-6 lg:p-10">
        {/* ORB */}
        <div className="flex flex-col items-center">
          <div
            className="cursor-pointer"
            onClick={isListening ? stopListening : startListening}
          >
            <div className="w-72 h-72 lg:w-80 lg:h-80">
              <VoicePoweredOrb
                enableVoiceControl={false}
                className="rounded-full shadow-[0_0_40px_rgba(56,189,248,0.4)]"
                hue={isListening ? 180 : 0}
              />
            </div>
          </div>

          <p className="text-sm mt-4 text-slate-300">
            {isListening
              ? isGenerating
                ? "Thinking..."
                : "Listening..."
              : "Tap to start"}
          </p>
        </div>

        {/* CHAT HISTORY */}
        <div className="flex-1 h-[80vh] max-w-2xl border border-white/10 bg-slate-950/60 rounded-2xl p-5 lg:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">
                Health buddy
              </div>
              <div className="text-sm font-medium text-slate-50">Conversation</div>
            </div>
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <ScrollArea className="h-[calc(80vh-4rem)] pr-2">
            <AnimatePresence>
              {conversation.map((entry) => {
                const isAI = entry.speaker === "assistant";
                const parsedReport = isAI ? parseHealthReport(entry.text) : null;
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <ChatBubble variant={isAI ? "received" : "sent"}>
                      <ChatBubbleAvatar
                        fallback={isAI ? "AI" : "You"}
                        src={
                          isAI
                            ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64"
                            : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64"
                        }
                      />
                      <ChatBubbleMessage
                        variant={isAI ? "received" : "sent"}
                        className={
                          isAI
                            ? "bg-slate-800/80 text-slate-50 border border-white/10"
                            : "bg-sky-500 text-slate-950"
                        }
                      >
                        <div className="leading-relaxed text-sm space-y-2">
                          {parsedReport ? (
                            <>
                              {parsedReport.before && (
                                <p className="text-slate-100">
                                  {parsedReport.before}
                                </p>
                              )}

                              <div className="rounded-lg border border-amber-400/40 bg-amber-500/5 p-3 text-xs space-y-2">
                                <div>
                                  <div className="text-[11px] uppercase tracking-wide text-amber-300">
                                    Health risk report
                                  </div>
                                  {parsedReport.report.overall && (
                                    <p className="mt-1 text-slate-100">
                                      {parsedReport.report.overall}
                                    </p>
                                  )}
                                </div>

                                {parsedReport.report.risks.length > 0 && (
                                  <div>
                                    <p className="text-[11px] font-medium text-amber-200">
                                      Risks
                                    </p>
                                    <ul className="mt-1 space-y-1">
                                      {parsedReport.report.risks.map(
                                        (r, idx) => (
                                          <li
                                            key={idx}
                                            className="text-[11px] text-amber-50/90"
                                          >
                                            • {r}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}

                                {parsedReport.report.redFlags.length > 0 && (
                                  <div>
                                    <p className="text-[11px] font-medium text-red-300">
                                      Key red flags
                                    </p>
                                    <ul className="mt-1 space-y-1">
                                      {parsedReport.report.redFlags.map(
                                        (f, idx) => (
                                          <li
                                            key={idx}
                                            className="text-[11px] text-red-100/90"
                                          >
                                            • {f}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}

                                {parsedReport.report.nextSteps.length > 0 && (
                                  <div>
                                    <p className="text-[11px] font-medium text-emerald-300">
                                      Helpful next steps
                                    </p>
                                    <ul className="mt-1 space-y-1">
                                      {parsedReport.report.nextSteps.map(
                                        (s, idx) => (
                                          <li
                                            key={idx}
                                            className="text-[11px] text-emerald-100/90"
                                          >
                                            • {s}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}

                                {parsedReport.report.disclaimer.length > 0 && (
                                  <div className="border-t border-amber-400/30 pt-2 mt-1">
                                    <p className="text-[10px] text-amber-100/80">
                                      {parsedReport.report.disclaimer.join(
                                        " "
                                      )}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {parsedReport.after && (
                                <p className="text-xs text-emerald-300">
                                  {parsedReport.after}
                                </p>
                              )}
                            </>
                          ) : (
                            <p>{entry.text}</p>
                          )}
                        </div>
                        <div className="text-[10px] opacity-60 mt-1">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </div>
                      </ChatBubbleMessage>
                    </ChatBubble>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <div ref={conversationEndRef} />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

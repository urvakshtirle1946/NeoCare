"use client";

import { useEffect } from "react";

interface VoiceWidgetProps {
  publicKey: string;
  assistantId: string;
  enabled?: boolean; // Controls whether the widget script will be injected
}

export default function VoiceWidget({ publicKey, assistantId, enabled = true }: VoiceWidgetProps) {
  useEffect(() => {
    // Avoid adding script multiple times
    if (typeof window === "undefined") return;

    // Only load widget script when explicitly enabled to avoid injected scripts/polylfills
    if (!enabled) return;

    const existing = document.getElementById("vapi-widget-script");
    if (!existing) {
      const script = document.createElement("script");
      script.id = "vapi-widget-script";
      script.src = "https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js";
      script.async = true;
      script.type = "text/javascript";
      document.body.appendChild(script);
    }

    // Create the element with attributes
    const tagId = "vapi-widget-element";
    let el = document.getElementById(tagId) as HTMLElement | null;
    if (!el) {
      el = document.createElement("vapi-widget");
      el.id = tagId;
      el.setAttribute("public-key", publicKey);
      el.setAttribute("assistant-id", assistantId);
      el.setAttribute("mode", "voice");
      el.setAttribute("theme", "dark");
      el.setAttribute("voice-show-transcript", "true");
      el.setAttribute("consent-required", "true");
      el.setAttribute("consent-storage-key", "vapi_widget_consent");
      // You can set any other attributes here if needed

      document.body.appendChild(el);
    }

    // Cleanup on unmount
    return () => {
      const node = document.getElementById(tagId);
      if (node) node.remove();
    };
  }, [publicKey, assistantId]);

  return null;
}

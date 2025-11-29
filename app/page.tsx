'use client';

import { useRouter } from 'next/navigation';
import Hero from "@/components/Hero";
import { PillBase } from "@/components/ui/3d-adaptive-navigation-bar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Hero Component with Shader Background */}
      <Hero
        headline={{
          line1: "Precision Care",
          line2: "Intelligence"
        }}
        subtitle="Board-certified physicians, data-forward diagnostics, and bedside empathy unite to deliver seamless preventative and acute care for modern life."
      />

      {/* Top Navigation Bar */}
      <div className="pointer-events-auto absolute left-0 right-0 top-6 z-30 flex items-center justify-between px-6 text-xs uppercase tracking-[0.4em] text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <span className="font-normal tracking-[0.6em] text-white">
          NeoCare
        </span>
        <div className="flex items-center gap-3">
          <ThemeToggle className="h-10 w-10" />
        </div>
      </div>

      {/* Bottom Navigation Pill */}
      <div className="pointer-events-auto fixed bottom-0 left-1/2 z-50 mb-6 -translate-x-1/2 sm:top-0 sm:pt-6">
        <PillBase />
      </div>
    </div>
  );
}

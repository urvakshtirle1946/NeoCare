import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-slate-50">
      <div className="container mx-auto px-4 py-10 lg:py-16">
        <div className="mb-6">
          <Link href="/">
            <Button className="rounded-full bg-white text-black px-4 py-1.5 text-xs font-semibold tracking-[0.25em] hover:bg-slate-200">
              HOME
            </Button>
          </Link>
        </div>
        <div className="max-w-3xl mx-auto space-y-10">
          {/* Header */}
          <div className="space-y-3 text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-white/60">
              NeoCare Support
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
              Contact our health team
            </h1>
            <p className="text-sm md:text-base text-white/70">
              Have questions about your health report, interview, or dashboard? Send us a quick
              message and we&apos;ll get back to you as soon as we can.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[2fr,1.4fr] items-start">
            {/* Contact form */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 lg:p-7 shadow-xl space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs uppercase tracking-wide text-white/70">
                    Full name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    className="border-white/15 bg-black/40 text-slate-50 placeholder:text-white/40"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs uppercase tracking-wide text-white/70">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="border-white/15 bg-black/40 text-slate-50 placeholder:text-white/40"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="topic" className="text-xs uppercase tracking-wide text-white/70">
                  Topic
                </Label>
                <Input
                  id="topic"
                  placeholder="Dashboard, interview, health report…"
                  className="border-white/15 bg-black/40 text-slate-50 placeholder:text-white/40"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message" className="text-xs uppercase tracking-wide text-white/70">
                  Message
                </Label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="Tell us briefly what you need help with…"
                  className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm text-slate-50 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
                />
              </div>

              <div className="flex items-center justify-between pt-2 gap-3">
                <p className="text-[11px] text-white/50">
                  This form is for app feedback and support. For medical emergencies, please contact
                  local services.
                </p>
                <Button className="rounded-full bg-white text-black px-6 text-xs font-semibold tracking-[0.25em] hover:bg-slate-200">
                  SEND
                </Button>
              </div>
            </div>

            {/* Side card */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 lg:p-6">
                <h2 className="text-sm font-medium text-white">Need quick help?</h2>
                <p className="mt-2 text-xs text-white/70">
                  For any urgent issues with NeoCare (login, voice not working, dashboard bugs),
                  mention your device, browser, and a short description. Our team will reply by
                  email.
                </p>
                <div className="mt-4 space-y-2 text-xs text-white/80">
                  <p>
                    <span className="font-semibold text-white">Support email:</span>{" "}
                    support@neocare.app
                  </p>
                  <p>
                    <span className="font-semibold text-white">Response time:</span> usually within
                    24 hours
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/5 p-4 text-xs text-emerald-100 space-y-2">
                <p className="font-medium text-emerald-200">Remember</p>
                <p>
                  NeoCare is a health buddy, not a doctor. If you ever feel unsafe, in pain, or
                  very unwell, please reach out to a real doctor or emergency services immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



import ProfileCard, { UserProfile } from "@/components/Dashboard/ProfileCard";
import RecommendedDoctors, { Doctor } from "@/components/Dashboard/RecommendedDoctors";
import DiseasesList, { Disease } from "@/components/Dashboard/DiseasesList";
import { Separator } from "@/components/ui/separator";

// Placeholder data. Replace with real fetch from your APIs.
const mockUser: UserProfile = {
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  age: 32,
  gender: "other",
  // In a real app, you would load this from your auth / user profile API.
  avatarUrl: "https://api.dicebear.com/7.x/thumbs/svg?seed=alex",
};

const mockDoctors: Doctor[] = [
  { id: "d1", name: "Dr. Priya Sharma", specialization: "Cardiology", hospital: "City Care Hospital", rating: 4.7 },
  { id: "d2", name: "Dr. Rohan Mehta", specialization: "Endocrinology", hospital: "Harmony Clinic", rating: 4.5 },
];

const mockDiseases: Disease[] = [
  { id: "c1", name: "Hypertension", severity: "medium", probability: 0.82, updatedAt: new Date().toISOString() },
  { id: "c2", name: "Type 2 Diabetes", severity: "high", probability: 0.64, updatedAt: new Date().toISOString() },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="container mx-auto px-4 py-8 lg:py-10 animate-fade-up">
        {/* Top header */}
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">Health Dashboard</h1>
            <p className="mt-1 text-sm text-slate-300">
              See your profile, AI-powered doctor suggestions, and conditions in one clean view.
            </p>
          </div>
          <div className="mt-2 flex gap-4 text-xs text-muted-foreground lg:mt-0">
            <div className="rounded-full border border-white/15 bg-slate-900/60 px-3 py-1">
              AI status: <span className="font-medium text-emerald-400">Monitoring</span>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-white/15 bg-slate-900/60 px-3 py-1 sm:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              <span>Personalized insights enabled</span>
            </div>
          </div>
        </div>

        <Separator className="my-6 border-white/10" />

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column – profile & quick stats */}
          <div className="space-y-6 lg:col-span-1">
            <ProfileCard user={mockUser} />

            <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-slate-900">
              <h3 className="text-sm font-medium text-white">Today&apos;s overview</h3>
              <div className="mt-3 grid gap-3 text-xs text-slate-300 sm:grid-cols-3">
                <div className="rounded-lg border border-white/10 bg-slate-950/40 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-300/80">AI risk watch</p>
                  <p className="mt-1 text-base font-semibold text-amber-300">Medium</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-950/40 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-300/80">Active conditions</p>
                  <p className="mt-1 text-base font-semibold text-slate-100">
                    {mockDiseases.length}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-950/40 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-300/80">
                    Doctor matches
                  </p>
                  <p className="mt-1 text-base font-semibold text-emerald-300">
                    {mockDoctors.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column – AI sections */}
          <div className="space-y-6 lg:col-span-2">
            <RecommendedDoctors doctors={mockDoctors} />
            <DiseasesList diseases={mockDiseases} />
          </div>
        </div>
      </div>
    </div>
  );
}

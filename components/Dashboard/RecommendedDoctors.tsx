"use client";
import React from "react";
import { Separator } from "../ui/separator";

export type Doctor = {
  id: string;
  name: string;
  specialization: string;
  hospital?: string;
  rating?: number; // 0-5
};

type Props = {
  doctors: Doctor[];
};

export default function RecommendedDoctors({ doctors }: Props) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-slate-900">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-white">Recommended doctors</h3>
          <p className="text-xs text-slate-300">
            AI matched doctors based on your current conditions.
          </p>
        </div>
        {doctors.length > 0 && (
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
            {doctors.length} matches
          </span>
        )}
      </div>
      <Separator className="my-3 border-white/10" />
      {doctors.length === 0 ? (
        <p className="text-sm text-muted-foreground">No recommendations yet.</p>
      ) : (
        <ul className="space-y-3">
          {doctors.map((d) => (
            <li
              key={d.id}
              className="flex items-start justify-between rounded-lg border border-white/10 bg-slate-950/40 p-3 transition-colors duration-200 hover:border-white/20 hover:bg-slate-900/60"
            >
              <div>
                <p className="text-sm font-medium text-slate-50">{d.name}</p>
                <p className="text-xs text-slate-300">
                  {d.specialization}
                  {d.hospital ? ` • ${d.hospital}` : ""}
                </p>
              </div>
              {typeof d.rating === "number" && (
                <span className="ml-3 text-xs font-medium text-amber-300">
                  ⭐ {d.rating.toFixed(1)}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";
import React from "react";
import { Separator } from "../ui/separator";

export type Disease = {
  id: string;
  name: string;
  severity?: "low" | "medium" | "high";
  probability?: number; // 0-1
  updatedAt?: string; // ISO date
};

type Props = {
  diseases: Disease[];
};

const severityColor: Record<NonNullable<Disease["severity"]>, string> = {
  low: "bg-green-500/20 text-green-600",
  medium: "bg-yellow-500/20 text-yellow-600",
  high: "bg-red-500/20 text-red-600",
};

export default function DiseasesList({ diseases }: Props) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-slate-900">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-white">Your conditions</h3>
          <p className="text-xs text-slate-300">
            Latest AI assessment of potential or confirmed diseases.
          </p>
        </div>
        {diseases.length > 0 && (
          <span className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1 text-[11px] font-medium text-slate-300">
            {diseases.length} tracked
          </span>
        )}
      </div>
      <Separator className="my-3 border-white/10" />
      {diseases.length === 0 ? (
        <p className="text-sm text-muted-foreground">No known conditions.</p>
      ) : (
        <ul className="space-y-3">
          {diseases.map((d) => (
            <li
              key={d.id}
              className="flex items-start justify-between rounded-lg border border-white/10 bg-slate-950/40 p-3 transition-colors duration-200 hover:border-white/20 hover:bg-slate-900/60"
            >
              <div>
                <p className="text-sm font-medium text-slate-50">{d.name}</p>
                <p className="mt-1 text-[11px] text-slate-300">
                  {typeof d.probability === "number"
                    ? `AI confidence: ${(d.probability * 100).toFixed(0)}%`
                    : ""}
                  {d.updatedAt
                    ? ` • Updated: ${new Date(d.updatedAt).toLocaleDateString()}`
                    : ""}
                </p>
              </div>
              {d.severity && (
                <span
                  className={`ml-3 rounded-full px-2 py-1 text-[11px] font-medium ${severityColor[d.severity]}`}
                >
                  {d.severity}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

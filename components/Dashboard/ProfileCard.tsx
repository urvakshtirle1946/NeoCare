"use client";
import React from "react";
import { Avatar } from "../ui/avatar";
import { Separator } from "../ui/separator";

export type UserProfile = {
  name: string;
  email: string;
  age?: number;
  gender?: "male" | "female" | "other";
  avatarUrl?: string;
};

type Props = {
  user: UserProfile;
};

export default function ProfileCard({ user }: Props) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-slate-900">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar src={user.avatarUrl} alt={user.name} />
          <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border border-slate-900 bg-emerald-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">{user.name}</h2>
          <p className="text-xs text-slate-300">{user.email}</p>
        </div>
      </div>
      <Separator className="my-4 border-white/10" />
      <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
        {user.age !== undefined && (
          <div className="rounded-lg border border-white/10 bg-slate-950/40 p-2">
            <p className="text-[11px] uppercase tracking-wide">Age</p>
            <p className="mt-1 text-sm font-medium text-slate-100">{user.age}</p>
          </div>
        )}
        {user.gender && (
          <div className="rounded-lg border border-white/10 bg-slate-950/40 p-2">
            <p className="text-[11px] uppercase tracking-wide">Gender</p>
            <p className="mt-1 text-sm font-medium capitalize text-slate-100">
              {user.gender}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

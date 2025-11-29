'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Briefcase, FileText, Home, User, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

interface NavBarProps {
  items: NavItem[];
  className?: string;
}

export function NavBar({ items, className }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0]?.name ?? "");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={cn(
        "fixed bottom-0 left-1/2 z-50 mb-6 -translate-x-1/2 sm:top-0 sm:pt-6",
        className
      )}
    >
      <div className="relative flex items-center gap-3 rounded-full border border-white/30 dark:border-white/10 bg-white/10 dark:bg-white/5 px-3 py-2 text-foreground shadow-[0_18px_40px_rgba(15,23,42,0.25)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-3xl backdrop-saturate-200">
        <div className="pointer-events-none absolute inset-0 rounded-full bg-linear-to-br from-white/70 via-white/15 to-transparent opacity-70 dark:from-white/20 dark:via-white/10" />
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;

          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "relative z-10 cursor-pointer rounded-full px-6 py-2 text-sm font-semibold transition-all",
                "text-foreground/80 hover:text-foreground",
                isActive &&
                  "bg-white/20 text-foreground dark:bg-white/10"
              )}
            >
              <span className={cn(!isMobile ? "inline" : "hidden", "md:inline")}>
                {item.name}
              </span>
              <span className={cn(isMobile ? "inline" : "hidden", "md:hidden")}>
                <Icon size={18} strokeWidth={2.5} />
              </span>

              {isActive ? (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 -z-10 w-full rounded-full bg-primary/5"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 h-1 w-8 -translate-x-1/2 rounded-t-full bg-primary">
                    <div className="absolute -top-2 -left-2 h-6 w-12 rounded-full bg-primary/20 blur-md" />
                    <div className="absolute -top-1 h-6 w-8 rounded-full bg-primary/20 blur-md" />
                    <div className="absolute top-0 left-2 h-4 w-4 rounded-full bg-primary/20 blur-sm" />
                  </div>
                </motion.div>
              ) : null}
            </Link>
          );
        })}
        <ThemeToggle className="relative z-10 ml-1 h-10 w-10" />
      </div>
    </div>
  );
}

export function NavBarDemo() {
  const navItems: NavItem[] = [
    { name: "Home", url: "#", icon: Home },
    { name: "About", url: "#about", icon: User },
    { name: "Projects", url: "#projects", icon: Briefcase },
    { name: "Resume", url: "#resume", icon: FileText },
  ];

  return <NavBar items={navItems} />;
}



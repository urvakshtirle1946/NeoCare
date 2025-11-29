'use client';

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = (resolvedTheme ?? theme) === "dark";

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={`Activate ${isDark ? "light" : "dark"} theme`}
      aria-pressed={isDark}
      disabled={!mounted}
      onClick={handleToggle}
      className={cn(
        "relative rounded-full border border-black/10 bg-white/80 text-slate-900 shadow-[inset_0_0_15px_rgba(255,255,255,0.65)] backdrop-blur-md backdrop-saturate-200 transition-all hover:bg-white/90 hover:text-slate-900 disabled:opacity-60 dark:border-white/20 dark:bg-white/10 dark:text-white dark:shadow-[inset_0_0_12px_rgba(255,255,255,0.25)] dark:hover:bg-white/20",
        className
      )}
    >
      <Sun
        className={cn(
          "absolute h-4 w-4 text-slate-900 transition-all",
          mounted && !isDark
            ? "scale-100 opacity-100 rotate-0"
            : "scale-0 opacity-0 -rotate-90"
        )}
      />
      <Moon
        className={cn(
          "absolute h-4 w-4 transition-all text-white",
          mounted && isDark
            ? "scale-100 opacity-100 rotate-0"
            : "scale-0 opacity-0 rotate-90"
        )}
      />
      <span className="sr-only">Toggle theme</span>
      {/* Reserve space so the button stays square even while icons animate */}
      <span className="invisible h-4 w-4" aria-hidden />
    </Button>
  );
}



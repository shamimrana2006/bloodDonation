"use client";

import React, { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function ProgressBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  // When route changes, complete and hide bar
  useEffect(() => {
    setIsNavigating(false);
    setProgress(100);
    const timeout = setTimeout(() => {
      setProgress(0);
    }, 300);
    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  // Intercept click on links to start progress bar instantly (0ms feedback)
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore external, target="_blank", or tel/mailto/wa links
      if (
        href.startsWith("http") ||
        href.startsWith("tel:") ||
        href.startsWith("mailto:") ||
        href.startsWith("https://wa.me") ||
        target.getAttribute("target") === "_blank"
      ) {
        return;
      }

      // If clicked link is for a different route
      if (href.startsWith("/") && href !== pathname) {
        setIsNavigating(true);
        setProgress(25);
      }
    };

    window.addEventListener("click", handleLinkClick, { capture: true });
    return () => {
      window.removeEventListener("click", handleLinkClick, { capture: true });
    };
  }, [pathname]);

  // Animate progress while navigating
  useEffect(() => {
    if (!isNavigating) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) return prev;
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isNavigating]);

  if (progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-blood-600 via-rose-500 to-amber-400 shadow-md shadow-blood-600/50 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export function TopProgressBar() {
  return (
    <Suspense fallback={null}>
      <ProgressBarInner />
    </Suspense>
  );
}

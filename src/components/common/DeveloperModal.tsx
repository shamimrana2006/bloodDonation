"use client";

import React, { useState, useEffect } from "react";
import {
  FaCode,
  FaLaptopCode,
  FaPalette,
  FaVideo,
  FaAward,
} from "react-icons/fa6";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export function DeveloperModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl + Shift + N or Cmd + Shift + N
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "n" || e.key === "N")) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-950 via-slate-900 to-blood-950 text-white border border-slate-700/80 shadow-2xl p-0 overflow-hidden rounded-3xl">
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-blood-600/30 blur-2xl pointer-events-none rounded-full" />

        <div className="p-7 relative z-10 space-y-6">
          {/* Header Badge */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blood-600/20 border border-blood-500/40 text-blood-300 text-xs font-bold">
              <FaCode className="text-blood-400 text-xs" />
              <span>Lead Developer & Architect</span>
            </span>

            <span className="text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60 font-mono">
              Ctrl + Shift + N
            </span>
          </div>

          {/* Developer Profile Header */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blood-600 via-rose-600 to-amber-500 p-0.5 shadow-xl shadow-blood-600/30 flex-shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center font-black text-2xl text-transparent bg-clip-text bg-gradient-to-tr from-blood-400 to-amber-300">
                SR
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-black text-white tracking-tight leading-tight">
                MD. Shamim Rana
              </h3>
              <p className="text-xs text-blood-400 font-semibold mt-0.5 flex items-center space-x-1">
                <FaAward className="text-amber-400 text-xs" />
                <span>6+ Years Professional Experience</span>
              </p>
            </div>
          </div>

          {/* Specialties / Core Roles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 text-center">
              <FaLaptopCode className="text-cyan-400 text-lg mx-auto mb-1.5" />
              <div className="text-xs font-bold text-slate-200 leading-tight">
                Full Stack Developer
              </div>
            </div>

            <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 text-center">
              <FaPalette className="text-pink-400 text-lg mx-auto mb-1.5" />
              <div className="text-xs font-bold text-slate-200 leading-tight">
                Graphics Designer
              </div>
            </div>

            <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 text-center">
              <FaVideo className="text-amber-400 text-lg mx-auto mb-1.5" />
              <div className="text-xs font-bold text-slate-200 leading-tight">
                Video Editor
              </div>
            </div>
          </div>

          {/* Skills Breakdown */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              দক্ষতা ও প্রযুক্তি (Key Competencies)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Next.js 14",
                "React",
                "Node.js",
                "TypeScript",
                "MongoDB",
                "Tailwind CSS",
                "UI/UX Design",
                "Adobe Photoshop",
                "Premiere Pro",
                "After Effects",
                "System Architecture",
              ].map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 bg-slate-800/80 border border-slate-700/70 text-slate-300 text-[11px] rounded-lg font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center space-x-1.5 text-emerald-400 font-semibold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Available for Creative & Dev Projects</span>
            </span>

            <span className="text-[10px] text-slate-500">
              Shortcut: Ctrl + Shift + N
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

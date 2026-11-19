import React from "react";
import { FaDroplet, FaIdCard, FaSpinner } from "react-icons/fa6";

export default function MemberDetailLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50/50 via-slate-50 to-white text-slate-900 pb-20">
      {/* Top Bar Skeleton */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="h-8 w-28 bg-slate-200 rounded-xl animate-pulse" />
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
            <div className="w-32 h-4 bg-slate-200 rounded-md animate-pulse hidden sm:block" />
          </div>
          <div className="h-8 w-20 bg-slate-200 rounded-xl animate-pulse" />
        </div>
      </header>

      {/* Main Skeleton Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
        {/* Verification Status Banner Skeleton */}
        <div className="bg-emerald-600/20 border border-emerald-600/30 p-3.5 sm:p-4 rounded-2xl flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/40" />
            <div className="space-y-1.5">
              <div className="h-4 w-36 bg-emerald-500/40 rounded-md" />
              <div className="h-3 w-56 bg-emerald-500/30 rounded-md hidden sm:block" />
            </div>
          </div>
          <div className="h-6 w-24 bg-emerald-500/40 rounded-md" />
        </div>

        {/* Loading Spinner Indicator */}
        <div className="flex items-center justify-center space-x-2.5 py-2 text-blood-600 text-sm font-bold">
          <FaSpinner className="animate-spin text-base" />
          <span>সদস্যের তথ্য লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</span>
        </div>

        {/* Profile Card & Digital ID Skeleton */}
        <div className="bg-white rounded-3xl border-2 border-slate-200/90 shadow-xl overflow-hidden animate-pulse">
          {/* Top Banner Cover Skeleton */}
          <div className="bg-slate-900 p-6 sm:p-8 text-white">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
              {/* Photo Box Skeleton */}
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-slate-800 border-4 border-slate-700 flex items-center justify-center flex-shrink-0">
                <FaIdCard className="text-4xl text-slate-700" />
              </div>

              {/* Info Column Skeleton */}
              <div className="flex-1 w-full space-y-3 text-center sm:text-left">
                <div className="flex justify-center sm:justify-start gap-2">
                  <div className="h-6 w-28 bg-slate-800 rounded-full" />
                  <div className="h-6 w-24 bg-slate-800 rounded-full" />
                </div>
                <div className="h-8 w-48 sm:w-64 bg-slate-800 rounded-xl mx-auto sm:mx-0" />
                <div className="h-4 w-40 bg-slate-800 rounded-md mx-auto sm:mx-0" />
              </div>
            </div>
          </div>

          {/* Details Section Skeleton */}
          <div className="p-5 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                <div className="h-4 w-32 bg-slate-200 rounded-md" />
                <div className="space-y-2 pt-2">
                  <div className="h-3 w-full bg-slate-200 rounded-md" />
                  <div className="h-3 w-full bg-slate-200 rounded-md" />
                  <div className="h-3 w-3/4 bg-slate-200 rounded-md" />
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                <div className="h-4 w-32 bg-slate-200 rounded-md" />
                <div className="space-y-2 pt-2">
                  <div className="h-3 w-full bg-slate-200 rounded-md" />
                  <div className="h-3 w-full bg-slate-200 rounded-md" />
                  <div className="h-3 w-3/4 bg-slate-200 rounded-md" />
                </div>
              </div>
            </div>

            {/* Quick Action Buttons Skeleton */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5 pt-2">
              <div className="h-10 rounded-xl bg-slate-200 w-full sm:w-36" />
              <div className="h-10 rounded-xl bg-slate-200 w-full sm:w-36" />
              <div className="h-10 rounded-xl bg-slate-200 w-full sm:w-48 col-span-2 sm:col-span-1" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

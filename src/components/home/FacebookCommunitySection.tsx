"use client";

import React from "react";
import Image from "next/image";
import { FaFacebook, FaArrowRight, FaUsers, FaHeart } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { ORG_INFO } from "@/lib/data";

export function FacebookCommunitySection() {
  return (
    <section className="py-16 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-white/15 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-4xl shadow-xl flex-shrink-0">
              <FaFacebook />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-xs font-semibold">
                <FaUsers />
                <span>আমাদের সক্রিয় অনলাইন কমিউনিটি</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                আমাদের অফিসিয়াল ফেসবুক গ্রুপে যুক্ত হোন
              </h3>
              <p className="text-slate-300 text-sm sm:text-base max-w-xl">
                সর্বশেষ রক্তের আবেদন, ফ্রি মেডিকেল ক্যাম্প, শীতবস্ত্র বিতরণ ও মানবিক কার্যক্রমের তথ্য সবার আগে পেতে আমাদের ফেসবুক পরিবারের সাথে সংযুক্ত থাকুন।
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <a
              href={ORG_INFO.facebookGroup}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-base px-8 py-6 rounded-2xl shadow-xl shadow-blue-600/30"
              >
                <FaFacebook className="mr-2 text-xl" />
                <span>গ্রুপে যুক্ত হোন</span>
                <FaArrowRight className="ml-2 text-sm" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

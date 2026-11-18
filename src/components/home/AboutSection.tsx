"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  FaLocationDot,
  FaShieldHeart,
  FaHeart,
  FaHandsPraying,
  FaBullseye,
  FaScaleBalanced,
  FaUsers,
  FaCheck,
} from "react-icons/fa6";
import { ORG_INFO } from "@/lib/data";

export function AboutSection() {
  return (
    <section id="about" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-red-100 border border-red-200 text-blood-700 text-xs font-bold mb-3">
            <FaShieldHeart className="text-blood-600" />
            <span>আমাদের পরিচিতি ও অঙ্গীকার</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            ব্লাড ডোনেশন এসোসিয়েশন বাংলাদেশ
          </h2>
          <p className="mt-2 text-blood-600 font-bold text-lg">
            “{ORG_INFO.slogan}”
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          {/* Left Column: Organization & Head Office */}
          <div className="lg:col-span-6 space-y-6">
            {/* Box 1: Introduction */}
            <div className="bg-gradient-to-br from-red-50/60 to-rose-50/40 p-6 sm:p-8 rounded-3xl border border-red-100 shadow-xs">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blood-600 text-white flex items-center justify-center text-lg shadow-sm">
                  <FaUsers />
                </div>
                <div>
                  <span className="text-xs font-bold text-blood-600 uppercase tracking-wider">
                    ১. আমাদের পরিচিতি
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    একটি মানবিক, সামাজিক ও স্বেচ্ছাসেবী সংগঠন
                  </h3>
                </div>
              </div>
              <p className="text-base text-slate-700 leading-relaxed font-medium">
                ব্লাড ডোনেশন এসোসিয়েশন বাংলাদেশ একটি অরাজনৈতিক, সম্পূর্ণ মানবিক, সামাজিক ও স্বেচ্ছাসেবী সংগঠন। মানবসেবা, জরুরি রক্তদান এবং অসহায় বিপদাপন্ন মানুষের পাশে নিঃস্বার্থভাবে দাঁড়ানোই আমাদের মূল লক্ষ্য।
              </p>
            </div>

            {/* Box 2: Head Office */}
            <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg shadow-sm">
                  <FaLocationDot />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                    ২. প্রধান কার্যালয় ও শাখা
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    সরিষাবাড়ী উপজেলা, জামালপুর
                  </h3>
                </div>
              </div>
              <div className="space-y-3 text-sm text-slate-700">
                <p>
                  <strong>প্রধান কার্যালয়:</strong> সরিষাবাড়ী উপজেলা, জামালপুর জেলা।
                </p>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">
                    কার্যক্রমের বিস্তৃতি:
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    জামালপুর সহ বাংলাদেশের বিভিন্ন থানা ও জেলা পর্যায়ে সংগঠনটির একনিষ্ঠ স্বেচ্ছাসেবী কমিটি ও সক্রিয় কার্যক্রম বিস্তৃত রয়েছে।
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Mission & Pledge */}
          <div className="lg:col-span-6 space-y-6">
            {/* Box 3: Mission & Goals */}
            <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg shadow-sm">
                  <FaBullseye />
                </div>
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    ৫. আমাদের লক্ষ্য ও উদ্দেশ্য
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    মানবতার কল্যাণে নিঃস্বার্থ সেবা
                  </h3>
                </div>
              </div>
              <p className="text-base text-slate-700 leading-relaxed font-medium mb-3">
                মানবতার কল্যাণে নিঃস্বার্থভাবে কাজ করা এবং সমাজের অসহায়, দরিদ্র ও বিপদগ্রস্ত মানুষের পাশে দাঁড়ানোই আমাদের দৃঢ় অঙ্গীকার।
              </p>
              <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-100 text-sm text-blue-900 font-medium">
                “আমরা চাই, বাংলাদেশের প্রতিটি মানুষ ভালো থাকুক, সুস্থ থাকুক এবং একটি সুন্দর ও মানবিক সমাজ গড়ে উঠুক।”
              </div>
            </div>

            {/* Box 4: Pledge (আমাদের অঙ্গীকার) */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-700">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blood-600 text-white flex items-center justify-center text-lg shadow-md">
                  <FaHeart />
                </div>
                <div>
                  <span className="text-xs font-bold text-blood-400 uppercase tracking-wider">
                    ৬. আমাদের অঙ্গীকার
                  </span>
                  <h3 className="text-xl font-extrabold text-white">
                    মানুষের সেবাই আমাদের অঙ্গীকার
                  </h3>
                </div>
              </div>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-4">
                মহান আল্লাহ তাআলার সন্তুষ্টি অর্জনের লক্ষ্যে মানবতার এই মহৎ কাজে অংশগ্রহণ করতে পেরে আমরা আনন্দিত ও গর্বিত।
              </p>
              <div className="border-t border-slate-700/80 pt-4 text-center sm:text-left">
                <p className="text-base sm:text-lg font-bold text-blood-400">
                  “মানুষের সেবাই আমাদের অঙ্গীকার, মানবতাই আমাদের পরিচয়।”
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  ব্লাড ডোনেশন এসোসিয়েশন বাংলাদেশ — মানবতার কল্যাণে, মানুষের পাশে সর্বদা।
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

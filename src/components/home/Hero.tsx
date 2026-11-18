"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  FaDroplet,
  FaHeart,
  FaMagnifyingGlass,
  FaUserPlus,
  FaPhoneVolume,
  FaShieldHeart,
  FaHandsHoldingChild,
  FaLocationDot,
  FaCheck,
} from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { ORG_INFO } from "@/lib/data";

interface HeroProps {
  onOpenDonorModal: () => void;
  onOpenRequestModal: () => void;
  totalDonorsCount?: number;
}

export function Hero({
  onOpenDonorModal,
  onOpenRequestModal,
  totalDonorsCount = 500,
}: HeroProps) {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-gradient-to-b from-red-50/70 via-white to-slate-50 pt-10 pb-16 lg:pt-16 lg:pb-24"
    >
      {/* Background decorative animated blood drops */}
      <motion.div
        animate={{ y: [-15, 15, -15], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-12 left-6 lg:left-20 w-16 h-16 rounded-full bg-red-100/60 blur-xs flex items-center justify-center pointer-events-none text-blood-400 opacity-60"
      >
        <FaDroplet className="text-3xl" />
      </motion.div>

      <motion.div
        animate={{ y: [15, -15, 15], rotate: [0, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-28 right-8 lg:right-28 w-20 h-20 rounded-full bg-red-200/40 blur-xs flex items-center justify-center pointer-events-none text-blood-500 opacity-50"
      >
        <FaDroplet className="text-4xl" />
      </motion.div>

      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-16 right-1/4 w-12 h-12 rounded-full bg-rose-100/50 flex items-center justify-center pointer-events-none text-blood-300 opacity-40"
      >
        <FaHeart className="text-2xl" />
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blood-100/80 border border-blood-200 text-blood-700 text-xs sm:text-sm font-bold shadow-xs"
            >
              <FaShieldHeart className="text-blood-600 animate-pulse text-sm" />
              <span>{ORG_INFO.tagline}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.18]"
            >
              <span className="text-blood-600">{ORG_INFO.name}</span>
              <br />
              <span className="text-slate-800 text-2xl sm:text-3xl md:text-4xl font-bold mt-2 block">
                “{ORG_INFO.slogan}”
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium"
            >
              জরুরি মুহূর্তে রক্তের প্রয়োজনে অসহায় মানুষের পাশে দাঁড়ানো এবং সমাজের প্রতিটি কোনায় মানবতার আলো ছড়িয়ে দেওয়াই আমাদের ব্রত। এক ব্যাগ রক্তে বেঁচে যেতে পারে একটি অমূল্য প্রাণ।
            </motion.p>

            {/* Quick Location & Direct Call Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs sm:text-sm font-semibold text-slate-700"
            >
              <span className="flex items-center space-x-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs">
                <FaLocationDot className="text-blood-600" />
                <span>প্রধান কার্যালয়: সরিষাবাড়ী, জামালপুর</span>
              </span>
              <span className="flex items-center space-x-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs">
                <FaCheck className="text-emerald-600" />
                <span>২৪ ঘণ্টা বিনামূল্যে সেবা</span>
              </span>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2"
            >
              <a href="#donors" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-blood-600 hover:bg-blood-700 text-white font-bold text-base shadow-lg shadow-blood-600/30 px-6 py-6 rounded-xl"
                >
                  <FaMagnifyingGlass className="mr-2 text-lg" />
                  রক্তদাতা খুঁজুন
                </Button>
              </a>

              <Button
                onClick={onOpenRequestModal}
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-2 border-blood-600 text-blood-700 hover:bg-blood-50 font-bold text-base px-6 py-6 rounded-xl shadow-xs"
              >
                <FaDroplet className="mr-2 text-blood-600 text-lg" />
                জরুরি রক্তের আবেদন
              </Button>

              <Button
                onClick={onOpenDonorModal}
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base px-6 py-6 rounded-xl shadow-md shadow-emerald-600/20"
              >
                <FaUserPlus className="mr-2 text-lg" />
                রক্তদাতা হোন
              </Button>
            </motion.div>
          </div>

          {/* Right Visual Card with Badge & Quick Stats */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="relative mx-auto max-w-md lg:max-w-none"
            >
              {/* Outer Card Glow */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-blood-600 to-rose-500 rounded-3xl blur-md opacity-25" />

              <div className="relative bg-white/95 rounded-3xl p-6 sm:p-8 shadow-xl border border-red-100">
                {/* Central Emblem */}
                <div className="flex flex-col items-center text-center space-y-4 pb-6 border-b border-slate-100">
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-blood-600 bg-white p-1 shadow-lg">
                    <Image
                      src="/logo.png"
                      alt="ব্লাড ডোনেশন এসোসিয়েশন বাংলাদেশ"
                      width={128}
                      height={128}
                      className="object-contain w-full h-full"
                      priority
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">
                      ব্লাড ডোনেশন এসোসিয়েশন বাংলাদেশ
                    </h3>
                    <p className="text-xs font-semibold text-blood-600 mt-0.5">
                      সরিষাবাড়ী উপজেলা, জামালপুর
                    </p>
                    <p className="text-xs text-slate-500 mt-1 italic">
                      “মানবতার সেবায়, মানুষের কল্যাণে।”
                    </p>
                  </div>
                </div>

                {/* Quick 2x2 Stats Matrix */}
                <div className="grid grid-cols-2 gap-3 pt-6">
                  <div className="bg-red-50/70 p-3.5 rounded-2xl border border-red-100 text-center">
                    <div className="flex items-center justify-center text-blood-600 mb-1">
                      <FaDroplet className="text-xl" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">
                      ৫০০+
                    </div>
                    <div className="text-xs font-medium text-slate-600">
                      নিবন্ধিত রক্তদাতা
                    </div>
                  </div>

                  <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100 text-center">
                    <div className="flex items-center justify-center text-emerald-600 mb-1">
                      <FaHeart className="text-xl" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">
                      ১২০০+
                    </div>
                    <div className="text-xs font-medium text-slate-600">
                      সফল রক্তদান
                    </div>
                  </div>

                  <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-100 text-center">
                    <div className="flex items-center justify-center text-blue-600 mb-1">
                      <FaHandsHoldingChild className="text-xl" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">
                      ১১টি
                    </div>
                    <div className="text-xs font-medium text-slate-600">
                      মানবিক কার্যক্রম
                    </div>
                  </div>

                  <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-100 text-center">
                    <div className="flex items-center justify-center text-amber-600 mb-1">
                      <FaPhoneVolume className="text-xl" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">
                      ২৪/৭
                    </div>
                    <div className="text-xs font-medium text-slate-600">
                      জরুরি হেল্পলাইন
                    </div>
                  </div>
                </div>

                {/* Urgent Hotline Direct Button */}
                <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                  <p className="text-xs text-slate-500 mb-1.5 font-medium">
                    জরুরি রক্তের প্রয়োজনে সরাসরি কল দিন:
                  </p>
                  <a
                    href="tel:01846474949"
                    className="inline-flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-blood-600 to-rose-600 hover:from-blood-700 hover:to-rose-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all text-sm"
                  >
                    <FaPhoneVolume className="animate-bounce" />
                    <span>01846474949 (মিঠু - প্রতিষ্ঠাতা ও পরিচালক)</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

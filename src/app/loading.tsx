import React from "react";
import Image from "next/image";
import { FaSpinner } from "react-icons/fa6";

export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-sm mx-auto animate-in fade-in zoom-in duration-300">
        {/* Pulsing Logo */}
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 bg-blood-500/20 rounded-full animate-ping pointer-events-none" />
          <div className="w-20 h-20 rounded-full border-2 border-blood-600 bg-white p-2 shadow-xl flex items-center justify-center relative z-10">
            <Image
              src="/logo.png"
              alt="BDAB"
              width={64}
              height={64}
              priority
              className="object-contain w-full h-full animate-pulse"
            />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-1">
          <h3 className="text-base font-black text-slate-900">
            ব্লাড ডোনেশন এসোসিয়েশন বাংলাদেশ
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            মানবতার সেবায়, মানুষের কল্যাণে।
          </p>
        </div>

        {/* Spinner Bar */}
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-red-50 border border-red-200 text-blood-700 rounded-full text-xs font-bold shadow-xs">
          <FaSpinner className="animate-spin text-sm" />
          <span>লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</span>
        </div>
      </div>
    </div>
  );
}

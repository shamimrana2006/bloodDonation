"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaDroplet,
  FaHospital,
  FaVialCircleCheck,
  FaHandsHoldingChild,
  FaUtensils,
  FaHandHoldingDollar,
  FaHandshakeAngle,
  FaShieldHeart,
  FaFaucetDrip,
  FaTree,
  FaBuildingColumns,
  FaHeart,
  FaFilter,
} from "react-icons/fa6";
import { HUMANITARIAN_ACTIVITIES } from "@/lib/data";

const iconMap: Record<string, React.ReactNode> = {
  FaDroplet: <FaDroplet />,
  FaHospital: <FaHospital />,
  FaVialCircleCheck: <FaVialCircleCheck />,
  FaHandsHoldingChild: <FaHandsHoldingChild />,
  FaUtensils: <FaUtensils />,
  FaHandHoldingDollar: <FaHandHoldingDollar />,
  FaHandshakeAngle: <FaHandshakeAngle />,
  FaShieldHeart: <FaShieldHeart />,
  FaFaucetDrip: <FaFaucetDrip />,
  FaTree: <FaTree />,
  FaBuildingColumns: <FaBuildingColumns />,
};

const bgColors = [
  "from-red-500 to-rose-600",
  "from-blue-500 to-cyan-600",
  "from-violet-500 to-purple-600",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
  "from-indigo-500 to-blue-600",
  "from-pink-500 to-rose-600",
  "from-sky-500 to-blue-600",
  "from-cyan-500 to-teal-600",
  "from-green-500 to-emerald-600",
  "from-slate-700 to-slate-900",
];

export function ActivitiesSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { label: "সকল কার্যক্রম (১১টি)", value: "all" },
    { label: "রক্তসেবা ও স্বাস্থ্য", value: "স্বাস্থ্যসেবা" },
    { label: "ত্রাণ ও সামাজিক সেবা", value: "সামাজিক" },
    { label: "পরিবেশ ও জনকল্যাণ", value: "কল্যাণ" },
  ];

  const filteredActivities = HUMANITARIAN_ACTIVITIES.filter((act) => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "স্বাস্থ্যসেবা") {
      return act.category.includes("রক্ত") || act.category.includes("স্বাস্থ্য") || act.category.includes("সচেতনতা");
    }
    if (selectedCategory === "সামাজিক") {
      return act.category.includes("ত্রাণ") || act.category.includes("সামাজিক") || act.category.includes("আর্থিক") || act.category.includes("দুর্যোগ");
    }
    if (selectedCategory === "কল্যাণ") {
      return act.category.includes("জনকল্যাণ") || act.category.includes("পরিবেশ") || act.category.includes("প্রশাসন");
    }
    return true;
  });

  return (
    <section id="activities" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-red-100 border border-red-200 text-blood-700 text-xs font-bold mb-3">
            <FaHeart className="text-blood-600" />
            <span>মানবসেবা ও সমাজকল্যাণ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            আমাদের মানবিক ও সামাজিক কার্যক্রম
          </h2>
          <p className="mt-3 text-slate-600 text-base leading-relaxed">
            ব্লাড ডোনেশন এসোসিয়েশন বাংলাদেশ শুধু রক্তদানেই সীমাবদ্ধ নয়; সমাজের অসহায়, সুবিধাবঞ্চিত ও বিপদগ্রস্ত মানুষের কল্যাণে নিরলসভাবে কাজ করে চলেছে।
          </p>
        </div>

        {/* Category Filter Pills (Smooth horizontal scroll on mobile) */}
        <div className="flex overflow-x-auto sm:flex-wrap items-center sm:justify-center gap-2 pb-2 sm:pb-0 scrollbar-none mb-10">
          {categories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                selectedCategory === cat.value
                  ? "bg-blood-600 text-white shadow-md shadow-blood-600/30 scale-105"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 11 Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((act) => {
            const idx = act.id - 1;
            const gradient = bgColors[idx % bgColors.length];

            return (
              <motion.div
                key={act.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: (act.id % 4) * 0.05 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform`}
                    >
                      {iconMap[act.iconName] || <FaHeart />}
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                      {act.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blood-600 transition-colors leading-snug mb-2">
                    {act.id}. {act.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {act.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 group-hover:text-blood-600 font-semibold transition-colors">
                  <span>কার্যক্রম #{act.id}</span>
                  <span className="flex items-center space-x-1">
                    <FaShieldHeart className="text-blood-500 text-xs" />
                    <span>স্বেচ্ছাসেবী সেবা</span>
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

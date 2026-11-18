"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  FaUsers,
  FaPhone,
  FaWhatsapp,
  FaLocationDot,
  FaDroplet,
  FaUserShield,
  FaHeart,
} from "react-icons/fa6";
import { Member } from "@/lib/types";

interface MembersSectionProps {
  members: Member[];
}

export function MembersSection({ members }: MembersSectionProps) {
  const [filter, setFilter] = useState<"all" | "leadership" | "volunteers">("all");

  if (!members || members.length === 0) return null;

  const filteredMembers = members.filter((m) => {
    if (filter === "leadership") {
      return (
        m.role.includes("পরিচালক") ||
        m.role.includes("এডমিন") ||
        m.role.includes("সভাপতি") ||
        m.role.includes("সম্পাদক")
      );
    }
    if (filter === "volunteers") {
      return (
        !m.role.includes("পরিচালক") &&
        !m.role.includes("এডমিন")
      );
    }
    return true;
  });

  return (
    <section id="members" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-red-100 border border-red-200 text-blood-700 text-xs font-bold mb-3">
            <FaUsers className="text-blood-600" />
            <span>আমাদের পরিচালনা পর্ষদ ও সদস্যবৃন্দ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            সংগঠনের নিবেদিতপ্রাণ সদস্য ও সেবাব্রতীবৃন্দ
          </h2>
          <p className="mt-3 text-slate-600 text-base leading-relaxed">
            ব্লাড ডোনেশন এসোসিয়েশন বাংলাদেশ-এর অগ্রগতি ও সার্বক্ষণিক মানবিক কার্যক্রম সচল রাখতে নিঃস্বার্থভাবে ভূমিকা রেখে চলেছেন আমাদের সম্মানিত সদস্যগণ।
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-center gap-2 mb-12">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              filter === "all"
                ? "bg-blood-600 text-white shadow-md shadow-blood-600/30"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            সকল সদস্য ({members.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("leadership")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              filter === "leadership"
                ? "bg-blood-600 text-white shadow-md shadow-blood-600/30"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            পরিচালনা পরিষদ
          </button>
          <button
            type="button"
            onClick={() => setFilter("volunteers")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              filter === "volunteers"
                ? "bg-blood-600 text-white shadow-md shadow-blood-600/30"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            স্বেচ্ছাসেবী ও রক্তযোদ্ধা
          </button>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (index % 4) * 0.05 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-slate-50/80 rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Photo or Avatar */}
                <div className="relative mx-auto w-24 h-24 mb-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-blood-600 shadow-md bg-white p-1 flex items-center justify-center">
                    {member.image ? (
                      <Image
                        src={member.image}
                        alt={member.name}
                        width={96}
                        height={96}
                        className="object-cover w-full h-full rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-blood-600 to-rose-600 text-white flex items-center justify-center text-3xl font-black">
                        {member.name.slice(0, 2)}
                      </div>
                    )}
                  </div>

                  {member.bloodGroup && (
                    <span className="absolute bottom-0 right-0 bg-blood-600 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-md border-2 border-white flex items-center space-x-0.5">
                      <FaDroplet className="text-[9px]" />
                      <span>{member.bloodGroup}</span>
                    </span>
                  )}
                </div>

                {/* Name & Role */}
                <div className="text-center space-y-1 mb-4">
                  <h3 className="font-extrabold text-slate-900 text-lg leading-tight group-hover:text-blood-600 transition-colors">
                    {member.name}
                  </h3>
                  <div className="inline-block bg-red-100/80 text-blood-700 text-xs font-bold px-3 py-1 rounded-full">
                    {member.role}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-xs text-slate-600 bg-white p-3 rounded-2xl border border-slate-200/60">
                  <div className="flex items-start space-x-1.5">
                    <FaLocationDot className="text-blood-500 mt-0.5 flex-shrink-0" />
                    <span>{member.address}</span>
                  </div>

                  {member.bio && (
                    <p className="text-slate-500 italic text-[11px] pt-1 border-t border-slate-100 leading-relaxed">
                      &quot;{member.bio}&quot;
                    </p>
                  )}
                </div>
              </div>

              {/* Action: Call & WhatsApp */}
              <div className="pt-4 mt-4 border-t border-slate-200/70">
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${member.phone}`}
                    className="inline-flex items-center justify-center space-x-1.5 bg-blood-600 hover:bg-blood-700 text-white font-bold text-xs py-2 px-3 rounded-xl transition-all shadow-xs"
                  >
                    <FaPhone className="text-[10px]" />
                    <span>কল দিন</span>
                  </a>

                  <a
                    href={`https://wa.me/88${member.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-xl transition-all shadow-xs"
                  >
                    <FaWhatsapp className="text-sm" />
                    <span>হোয়াটসঅ্যাপ</span>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

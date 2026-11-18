"use client";

import React, { useState } from "react";
import {
  FaPhoneVolume,
  FaPhone,
  FaWhatsapp,
  FaLocationDot,
  FaUserShield,
  FaCopy,
  FaCheck,
  FaShieldHeart,
} from "react-icons/fa6";
import { EMERGENCY_LEADERS } from "@/lib/data";

export function EmergencyContactsSection() {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (phone: string, id: number) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-slate-50 to-red-50/50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-red-100 border border-red-200 text-blood-700 text-xs font-bold mb-3">
            <FaPhoneVolume className="text-blood-600 animate-bounce" />
            <span>৩. জরুরি প্রয়োজনে যোগাযোগ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            সংগঠনের দায়িত্বশীল কর্মকর্তাদের সাথে সরাসরি যোগাযোগ
          </h2>
          <p className="mt-3 text-slate-600 text-base">
            যেকোনো জরুরি রক্তের প্রয়োজন, মেডিকেল ক্যাম্প আয়োজন বা সংগঠনের যেকোনো সেবামূলক তথ্যের জন্য নিচের দায়িত্বশীল নেতৃবৃন্দের সাথে সরাসরি কল বা হোয়াটসঅ্যাপে যোগাযোগ করুন।
          </p>
        </div>

        {/* 3 Leaders Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {EMERGENCY_LEADERS.map((leader, index) => (
            <div
              key={leader.id}
              className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between relative overflow-hidden group"
            >
              {/* Top accent badge */}
              <div className="flex items-center justify-between mb-5">
                <span className="w-8 h-8 rounded-full bg-red-100 text-blood-700 font-black text-sm flex items-center justify-center">
                  ০{index + 1}
                </span>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full flex items-center space-x-1">
                  <FaUserShield className="text-blood-600 text-xs" />
                  <span>জরুরি দায়িত্বপ্রাপ্ত</span>
                </span>
              </div>

              <div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blood-600 to-rose-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-blood-600/30 mb-4 group-hover:scale-105 transition-transform">
                  <FaShieldHeart />
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 leading-snug group-hover:text-blood-600 transition-colors">
                  {leader.name}
                </h3>
                <p className="text-sm font-bold text-blood-600 mt-1">
                  {leader.role}
                </p>

                <div className="mt-3 flex items-center space-x-1.5 text-xs text-slate-500">
                  <FaLocationDot className="text-blood-500" />
                  <span>{leader.location}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 mt-6 border-t border-slate-100 space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${leader.phone}`}
                    className="inline-flex items-center justify-center space-x-1.5 bg-blood-600 hover:bg-blood-700 text-white font-bold text-xs sm:text-sm py-2.5 px-3 rounded-xl transition-all shadow-md shadow-blood-600/20 whitespace-nowrap"
                  >
                    <FaPhone className="text-xs flex-shrink-0" />
                    <span>কল দিন</span>
                  </a>

                  {leader.whatsapp && (
                    <a
                      href={`https://wa.me/88${leader.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm py-2.5 px-3 rounded-xl transition-all shadow-md shadow-emerald-600/20 whitespace-nowrap"
                    >
                      <FaWhatsapp className="text-base flex-shrink-0" />
                      <span>হোয়াটসঅ্যাপ</span>
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(leader.phone, leader.id)}
                  className="w-full inline-flex items-center justify-center space-x-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 py-2 rounded-xl border border-slate-200 transition-colors font-semibold whitespace-nowrap"
                >
                  {copiedId === leader.id ? (
                    <>
                      <FaCheck className="text-emerald-600 flex-shrink-0" />
                      <span className="text-emerald-700">নম্বর কপি হয়েছে!</span>
                    </>
                  ) : (
                    <>
                      <FaCopy className="text-slate-400 flex-shrink-0" />
                      <span className="truncate">নম্বর কপি: {leader.phone}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

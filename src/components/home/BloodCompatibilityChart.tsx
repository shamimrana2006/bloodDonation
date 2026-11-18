"use client";

import React, { useState } from "react";
import { FaDroplet, FaCircleInfo, FaCheck, FaHeart, FaHandHoldingHeart } from "react-icons/fa6";
import { BloodGroup } from "@/lib/types";

const COMPATIBILITY_MAP: Record<
  BloodGroup,
  { giveTo: BloodGroup[]; receiveFrom: BloodGroup[]; note: string }
> = {
  "A+": {
    giveTo: ["A+", "AB+"],
    receiveFrom: ["A+", "A-", "O+", "O-"],
    note: "A+ গ্রুপের রক্তগ্রহীতারা A+, A-, O+, O- রক্ত নিতে পারেন।",
  },
  "O+": {
    giveTo: ["O+", "A+", "B+", "AB+"],
    receiveFrom: ["O+", "O-"],
    note: "O+ রক্ত সব পজিটিভ গ্রুপের রোগীকে দেওয়া যায়।",
  },
  "B+": {
    giveTo: ["B+", "AB+"],
    receiveFrom: ["B+", "B-", "O+", "O-"],
    note: "B+ গ্রুপের রক্তগ্রহীতারা B+, B-, O+, O- রক্ত নিতে পারেন।",
  },
  "AB+": {
    giveTo: ["AB+"],
    receiveFrom: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    note: "AB+ হলো সর্বজনীন গ্রহীতা (Universal Recipient), যেকোনো গ্রুপের রক্ত নিতে পারেন।",
  },
  "A-": {
    giveTo: ["A+", "A-", "AB+", "AB-"],
    receiveFrom: ["A-", "O-"],
    note: "A- গ্রুপের রক্ত সব A এবং AB রোগীদের দেওয়া যায়।",
  },
  "O-": {
    giveTo: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    receiveFrom: ["O-"],
    note: "O- হলো সর্বজনীন রক্তদাতা (Universal Donor), যেকোনো জরুরি মুহূর্তে যেকোনো রোগীকে দেওয়া যায়।",
  },
  "B-": {
    giveTo: ["B+", "B-", "AB+", "AB-"],
    receiveFrom: ["B-", "O-"],
    note: "B- গ্রুপের রক্ত সব B এবং AB রোগীদের দেওয়া যায়।",
  },
  "AB-": {
    giveTo: ["AB+", "AB-"],
    receiveFrom: ["AB-", "A-", "B-", "O-"],
    note: "AB- সকল নেগেটিভ গ্রুপের রক্ত নিতে পারেন।",
  },
};

const GROUPS: BloodGroup[] = ["A+", "O+", "B+", "AB+", "A-", "O-", "B-", "AB-"];

export function BloodCompatibilityChart() {
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>("O+");

  const current = COMPATIBILITY_MAP[selectedGroup];

  return (
    <section className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-red-100 border border-red-200 text-blood-700 text-xs font-bold mb-3">
            <FaCircleInfo className="text-blood-600" />
            <span>ইন্টারঅ্যাক্টিভ রক্তদান নির্দেশিকা</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            রক্তের গ্রুপ ও গ্রহণ-দানের সামঞ্জস্যতা
          </h2>
          <p className="mt-2 text-slate-600 text-sm sm:text-base">
            আপনার রক্তের গ্রুপটি সিলেক্ট করুন এবং সরাসরি দেখুন আপনি কাদের রক্ত দিতে পারবেন এবং কাদের থেকে নিতে পারবেন।
          </p>
        </div>

        {/* Interactive Group Selector Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
          {GROUPS.map((g) => {
            const isSelected = selectedGroup === g;

            return (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGroup(g)}
                className={`px-5 py-2.5 rounded-2xl font-black text-base transition-all duration-200 flex items-center space-x-2 ${
                  isSelected
                    ? "bg-blood-600 text-white shadow-lg shadow-blood-600/30 scale-105"
                    : "bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-blood-700 border border-slate-200"
                }`}
              >
                <FaDroplet className={`text-xs ${isSelected ? "text-white" : "text-blood-600"}`} />
                <span>{g}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Group Result Box */}
        <div className="bg-gradient-to-br from-red-50/70 via-white to-rose-50/40 rounded-3xl border border-red-100 p-6 sm:p-10 shadow-sm mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Blood Avatar */}
            <div className="lg:col-span-4 text-center lg:text-left space-y-3">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-tr from-blood-600 to-rose-600 text-white text-4xl font-black shadow-xl shadow-blood-600/30">
                {selectedGroup}
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900">
                রক্তের গ্রুপ: {selectedGroup}
              </h3>
              <p className="text-xs text-slate-500 italic max-w-xs">
                {current.note}
              </p>
            </div>

            {/* Can Donate & Can Receive Matrix */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Give To */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center space-x-2 text-blood-600 font-extrabold text-sm mb-3">
                  <FaHandHoldingHeart className="text-base" />
                  <span>আপনি রক্ত দিতে পারবেন:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {current.giveTo.map((g) => (
                    <span
                      key={g}
                      className="px-3.5 py-1.5 bg-blood-600 text-white rounded-xl text-sm font-black shadow-xs flex items-center space-x-1"
                    >
                      <FaDroplet className="text-xs" />
                      <span>{g}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Receive From */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center space-x-2 text-emerald-600 font-extrabold text-sm mb-3">
                  <FaHeart className="text-base" />
                  <span>আপনি রক্ত নিতে পারবেন:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {current.receiveFrom.map((g) => (
                    <span
                      key={g}
                      className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-sm font-black shadow-xs flex items-center space-x-1"
                    >
                      <FaDroplet className="text-xs" />
                      <span>{g}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Guidelines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs sm:text-sm">
          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 flex items-start space-x-3.5">
            <FaHeart className="text-blood-600 text-xl mt-1 flex-shrink-0" />
            <div className="space-y-1">
              <strong className="text-slate-900 block font-bold text-sm">
                রক্তদানের সাধারণ নিয়মাবলী:
              </strong>
              <p className="text-slate-600 leading-relaxed">
                বয়স ১৮-৬০ বছর, ওজন পুরুষদের ক্ষেত্রে কমপক্ষে ৪৮ কেজি এবং নারীদের ৪৫ কেজি। রক্তদানের পূর্বে পর্যাপ্ত পানি পান করুন এবং হালকা খাবার গ্রহণ করুন।
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 flex items-start space-x-3.5">
            <FaCheck className="text-emerald-600 text-xl mt-1 flex-shrink-0" />
            <div className="space-y-1">
              <strong className="text-slate-900 block font-bold text-sm">
                রক্তদানের উপকারিতা:
              </strong>
              <p className="text-slate-600 leading-relaxed">
                নিয়মিত রক্তদানে হৃদরোগ ও স্ট্রোকের ঝুঁকি হ্রাস পায়, অস্থিমজ্জায় নতুন রক্তকণিকা তৈরি হয় এবং মানসিক আত্মতৃপ্তি ও সওয়াব অর্জিত হয়।
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

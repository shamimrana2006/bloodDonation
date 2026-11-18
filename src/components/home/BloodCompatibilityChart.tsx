"use client";

import React from "react";
import { FaDroplet, FaCircleInfo, FaCheck, FaHeart } from "react-icons/fa6";

const compatibilityData = [
  { group: "A+", giveTo: "A+, AB+", receiveFrom: "A+, A-, O+, O-" },
  { group: "O+", giveTo: "O+, A+, B+, AB+", receiveFrom: "O+, O-" },
  { group: "B+", giveTo: "B+, AB+", receiveFrom: "B+, B-, O+, O-" },
  { group: "AB+", giveTo: "AB+ (সর্বজনীন গ্রহীতা)", receiveFrom: "সকল গ্রুপের রক্ত নিতে পারে" },
  { group: "A-", giveTo: "A+, A-, AB+, AB-", receiveFrom: "A-, O-" },
  { group: "O-", giveTo: "সকল গ্রুপকে দিতে পারে (সর্বজনীন দাতা)", receiveFrom: "শুধুমাত্র O-" },
  { group: "B-", giveTo: "B+, B-, AB+, AB-", receiveFrom: "B-, O-" },
  { group: "AB-", giveTo: "AB+, AB-", receiveFrom: "AB-, A-, B-, O-" },
];

export function BloodCompatibilityChart() {
  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-red-100 border border-red-200 text-blood-700 text-xs font-bold mb-3">
            <FaCircleInfo className="text-blood-600" />
            <span>রক্তদান নির্দেশিকা</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            রক্তের গ্রুপ ও গ্রহণ-দানের সামঞ্জস্যতা
          </h2>
          <p className="mt-2 text-slate-600 text-sm sm:text-base">
            কে কাকে রক্ত দিতে পারে এবং কার কাছ থেকে রক্ত গ্রহণ করতে পারে তার সুস্পষ্ট তালিকা।
          </p>
        </div>

        {/* Compatibility Table / Grid */}
        <div className="overflow-x-auto bg-slate-50 rounded-3xl border border-slate-200 p-2 sm:p-4 shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-700 text-xs sm:text-sm font-bold">
                <th className="py-3.5 px-4">রক্তের গ্রুপ</th>
                <th className="py-3.5 px-4">কাকে রক্ত দিতে পারবে</th>
                <th className="py-3.5 px-4">কার থেকে রক্ত নিতে পারবে</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
              {compatibilityData.map((item) => (
                <tr key={item.group} className="hover:bg-white transition-colors">
                  <td className="py-3.5 px-4 font-black">
                    <span className="inline-flex items-center space-x-1.5 bg-blood-600 text-white px-3 py-1 rounded-xl text-sm shadow-xs">
                      <FaDroplet className="text-xs" />
                      <span>{item.group}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-800 font-semibold">
                    {item.giveTo}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {item.receiveFrom}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Important notice cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="bg-red-50/70 p-4 rounded-2xl border border-red-100 flex items-start space-x-3">
            <FaHeart className="text-blood-600 text-lg mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-slate-900 block font-bold mb-0.5">
                রক্তদানের সাধারণ নিয়মাবলী:
              </strong>
              <p className="text-slate-600">
                বয়স ১৮-৬০ বছর, ওজন কমপক্ষে ৪৮ কেজি, এবং পুরুষদের ক্ষেত্রে ৪ মাস ও নারীদের ক্ষেত্রে ৪ মাস পর পর রক্তদান করা সম্পূর্ণ নিরাপদ ও স্বাস্থ্যসম্মত।
              </p>
            </div>
          </div>

          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 flex items-start space-x-3">
            <FaCheck className="text-emerald-600 text-lg mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-slate-900 block font-bold mb-0.5">
                রক্তদানে স্বাস্থ্যগত উপকারিতা:
              </strong>
              <p className="text-slate-600">
                নিয়মিত রক্তদানে হৃদরোগ ও স্ট্রোকের ঝুঁকি কমে, নতুন রক্তকণিকা তৈরি হয় এবং মানসিক তৃপ্তি অনুভূত হয়।
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

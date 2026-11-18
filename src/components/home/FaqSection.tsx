"use client";

import React, { useState } from "react";
import { FaCircleQuestion, FaChevronDown, FaDroplet, FaHeart, FaShieldHeart } from "react-icons/fa6";

const FAQS = [
  {
    q: "কে রক্তদান করতে পারবেন?",
    a: "১৮ থেকে ৬০ বছর বয়সী যেকোনো সুস্থ ও প্রাপ্তবয়স্ক নারী ও পুরুষ রক্তদান করতে পারেন। পুরুষের ওজন কমপক্ষে ৪৮ কেজি এবং নারীর ওজন কমপক্ষে ৪৫ কেজি হতে হবে। রক্তদানের আগে রক্তচাপ ও হিমোগ্লোবিনের মাত্রা স্বাভাবিক থাকা আবশ্যক।",
  },
  {
    q: "কতদিন পর পর রক্তদান করা যায়?",
    a: "একজন সুস্থ পুরুষ প্রতি ৩ থেকে ৪ মাস পর পর এবং একজন সুস্থ নারী প্রতি ৪ মাস পর পর নিরাপদভাবে রক্তদান করতে পারেন। এতে শরীরে কোনো দুর্বলতা আসে না।",
  },
  {
    q: "রক্তদানে কি কোনো শারীরিক ক্ষতি বা ঝুঁকি আছে?",
    a: "না, রক্তদানে শরীরের কোনো ক্ষতি হয় না। রক্তদানের ৪৮ ঘণ্টার মধ্যে শরীরে রক্তের জলীয় অংশ পূরণ হয়ে যায় এবং কয়েক সপ্তাহের মধ্যে নতুন রক্তকণিকা তৈরি হয়। বরং নিয়মিত রক্তদানে হার্ট অ্যাটাকের ঝুঁকি কমে এবং শরীরের রোগ প্রতিরোধ ক্ষমতা বাড়ে।",
  },
  {
    q: "ব্লাড ডোনেশন এসোসিয়েশন বাংলাদেশ থেকে রক্ত পেতে কি কোনো টাকা দিতে হয়?",
    a: "একদমই না! ব্লাড ডোনেশন এসোসিয়েশন বাংলাদেশ সম্পূর্ণ অরাজনৈতিক ও স্বেচ্ছাসেবী মানবিক সংগঠন। আমাদের রক্তদান কার্যক্রম শতভাগ বিনামূল্যে পরিচালিত হয়। কোনো রোগী বা তার পরিবারের কাছ থেকে কোনো ফি বা অর্থ গ্রহণ করা হয় না।",
  },
  {
    q: "জরুরি প্রয়োজনে কীভাবে তাৎক্ষণিক রক্ত পাওয়া যাবে?",
    a: "আমাদের ওয়েবসাইটের 'রক্তদাতা খুঁজুন' সেকশনে গিয়ে আপনার রক্তের গ্রুপ ও এলাকা সিলেক্ট করে সরাসরি রক্তদাতার সাথে ফোনে যোগাযোগ করতে পারেন অথবা 'জরুরি রক্তের আবেদন করুন' বাটনে ক্লিক করে রোগীর তথ্য পোস্ট করলে নিকটস্থ রক্তদাতারা দ্রুত সাড়া দেবেন।",
  },
  {
    q: "আমি কীভাবে সংগঠনের সদস্য বা স্বেচ্ছাসেবী হিসেবে যুক্ত হতে পারি?",
    a: "আপনি আমাদের ওয়েবসাইটের 'রক্তদাতা হোন' ফর্ম পূরণ করে রক্তদাতা হিসেবে যুক্ত হতে পারেন অথবা আমাদের প্রতিষ্ঠাতা ও পরিচালক মোঃ কামরুল হাসান (মিঠু) - 01846474949 নম্বরে কল করে বা আমাদের অফিসিয়াল ফেসবুক গ্রুপে যুক্ত হয়ে সংগঠনে অংশগ্রহণ করতে পারেন।",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white via-slate-50 to-red-50/40 border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-red-100 border border-red-200 text-blood-700 text-xs font-bold mb-3">
            <FaCircleQuestion className="text-blood-600" />
            <span>সাধারণ প্রশ্নোত্তর</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            রক্তদান সম্পর্কে আপনার প্রয়োজনীয় তথ্য
          </h2>
          <p className="mt-3 text-slate-600 text-base">
            রক্তদান নিয়ে সাধারণ মানুষের মনে থাকা বহুল জিজ্ঞাসিত প্রশ্ন ও সঠিক চিকিৎসা বিজ্ঞানের তথ্য নিচে দেওয়া হলো।
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full py-4.5 px-6 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-base sm:text-lg hover:text-blood-600 transition-colors"
                >
                  <span className="flex items-center space-x-3">
                    <span className="w-8 h-8 rounded-full bg-red-50 text-blood-600 text-xs flex items-center justify-center flex-shrink-0 font-extrabold">
                      {idx + 1}
                    </span>
                    <span>{faq.q}</span>
                  </span>
                  <FaChevronDown
                    className={`text-slate-400 text-sm transition-transform duration-300 flex-shrink-0 ${
                      isOpen ? "rotate-180 text-blood-600" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-100 animate-in fade-in-50 duration-200">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

"use client";

import React, { useState } from "react";
import {
  FaDroplet,
  FaHospital,
  FaLocationDot,
  FaCalendarCheck,
  FaPhoneVolume,
  FaWhatsapp,
  FaTriangleExclamation,
  FaCircleCheck,
  FaPlus,
} from "react-icons/fa6";
import { BloodRequest } from "@/lib/types";
import { formatBanglaNumber, formatBanglaDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BloodRequestFeedProps {
  requests: BloodRequest[];
  onOpenRequestModal: () => void;
}

export function BloodRequestFeed({
  requests,
  onOpenRequestModal,
}: BloodRequestFeedProps) {
  const [filter, setFilter] = useState<"all" | "active">("active");

  const displayedRequests = requests.filter((r) => {
    if (filter === "active") return r.status === "সক্রিয়";
    return true;
  });

  return (
    <section id="requests" className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-red-100 border border-red-200 text-blood-700 text-xs font-bold mb-3">
              <FaTriangleExclamation className="text-blood-600 animate-pulse" />
              <span>জরুরি রক্তের আবেদন তালিকা</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              মুমূর্ষু রোগীর রক্তের লাইভ আবেদন
            </h2>
            <p className="mt-2 text-slate-600 text-base max-w-2xl">
              হাসপাতালে ভর্তি রোগীদের জরুরি রক্তের আবেদনগুলো নিচে তুলে ধরা হলো। আপনার রক্তের গ্রুপ মিলে গেলে অবিলম্বে রোগীর স্বজনদের সাথে যোগাযোগ করুন।
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-bold">
              <button
                type="button"
                onClick={() => setFilter("active")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filter === "active"
                    ? "bg-white text-blood-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                সক্রিয় আবেদন ({requests.filter((r) => r.status === "সক্রিয়").length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filter === "all"
                    ? "bg-white text-blood-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                সকল ({requests.length})
              </button>
            </div>

            <Button
              onClick={onOpenRequestModal}
              className="bg-blood-600 hover:bg-blood-700 text-white font-bold text-sm shadow-md shadow-blood-600/20"
            >
              <FaPlus className="mr-1.5" />
              রক্তের আবেদন করুন
            </Button>
          </div>
        </div>

        {/* Requests Cards Grid */}
        {displayedRequests.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-300 p-8">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl">
              <FaCircleCheck />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              বর্তমানে কোনো সক্রিয় জরুরি আবেদন নেই
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
              আলহামদুলিল্লাহ! কোনো রোগীর রক্তের প্রয়োজন হলে নিচের বাটনে ক্লিক করে দ্রুত আবেদন পোস্ট করুন।
            </p>
            <div className="mt-5">
              <Button
                onClick={onOpenRequestModal}
                className="bg-blood-600 hover:bg-blood-700 text-white font-bold"
              >
                <FaPlus className="mr-2" />
                নতুন রক্তের আবেদন পোস্ট করুন
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedRequests.map((req) => {
              const isEmergency = req.urgency.includes("খুব জরুরি");

              return (
                <div
                  key={req.id}
                  className={`bg-white rounded-3xl border p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
                    isEmergency
                      ? "border-red-300 ring-2 ring-red-500/10"
                      : "border-slate-200"
                  }`}
                >
                  {/* Emergency banner tag */}
                  {isEmergency && (
                    <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-xs">
                      জরুরি
                    </div>
                  )}

                  <div>
                    {/* Header: Blood Group & Patient Name */}
                    <div className="flex items-start space-x-3.5 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blood-600 via-rose-600 to-red-700 text-white flex flex-col items-center justify-center font-black text-2xl shadow-lg shadow-blood-600/30 flex-shrink-0">
                        <span>{req.bloodGroup}</span>
                        <span className="text-[10px] font-bold text-red-100">
                          {formatBanglaNumber(req.units)} ব্যাগ
                        </span>
                      </div>
                      <div className="flex-1 pr-6">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                              req.status === "সক্রিয়"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-lg leading-tight mt-1">
                          {req.patientName}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">
                          পোস্ট: {formatBanglaDate(req.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Request Details */}
                    <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                      <div className="flex items-start space-x-2">
                        <FaHospital className="text-blood-600 mt-0.5 flex-shrink-0 text-sm" />
                        <div>
                          <strong className="text-slate-800 block text-xs">
                            {req.hospitalName}
                          </strong>
                          <span className="text-slate-500">
                            {req.upazila}, {req.district}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 pt-1 border-t border-slate-200/60">
                        <FaCalendarCheck className="text-emerald-600 flex-shrink-0" />
                        <span>
                          প্রয়োজন:{" "}
                          <strong className="text-slate-800">
                            {formatBanglaDate(req.neededDate)} ({req.neededTime})
                          </strong>
                        </span>
                      </div>

                      {req.reason && (
                        <div className="pt-1 border-t border-slate-200/60 text-slate-500 italic">
                          কারণ: {req.reason}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions: Call & WhatsApp */}
                  <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`tel:${req.contactPhone}`}
                        className="inline-flex items-center justify-center space-x-1.5 bg-blood-600 hover:bg-blood-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-all shadow-md shadow-blood-600/20"
                      >
                        <FaPhoneVolume className="text-xs" />
                        <span>কল দিন</span>
                      </a>

                      <a
                        href={`https://wa.me/88${req.contactPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-all shadow-md shadow-emerald-600/20"
                      >
                        <FaWhatsapp className="text-sm" />
                        <span>হোয়াটসঅ্যাপ</span>
                      </a>
                    </div>

                    <div className="text-center text-[11px] text-slate-500 font-medium">
                      যোগাযোগ: {req.contactPhone}
                      {req.alternatePhone && ` / ${req.alternatePhone}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

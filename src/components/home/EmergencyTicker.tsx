"use client";

import React from "react";
import { FaTriangleExclamation, FaPhone, FaDroplet, FaArrowRight } from "react-icons/fa6";
import { BloodRequest } from "@/lib/types";

interface EmergencyTickerProps {
  requests: BloodRequest[];
  onOpenRequestModal: () => void;
}

export function EmergencyTicker({ requests, onOpenRequestModal }: EmergencyTickerProps) {
  const activeRequests = requests.filter((r) => r.status === "সক্রিয়");

  if (activeRequests.length === 0) return null;

  const urgentReq = activeRequests[0];

  return (
    <div className="bg-red-500 text-white border-y border-red-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center space-x-2.5 flex-1 min-w-[280px]">
          <span className="flex-shrink-0 bg-white text-red-600 px-2.5 py-0.5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center space-x-1 animate-pulse">
            <FaTriangleExclamation />
            <span>জরুরি রক্ত প্রয়োজন</span>
          </span>
          <p className="truncate font-medium">
            <span className="font-bold underline decoration-white/50 underline-offset-2">
              [{urgentReq.bloodGroup}]
            </span>{" "}
            গ্রুপের রক্ত প্রয়োজন: {urgentReq.patientName} - {urgentReq.hospitalName}, {urgentReq.district}
          </p>
        </div>

        <div className="flex items-center space-x-3 ml-auto flex-shrink-0">
          <a
            href={`tel:${urgentReq.contactPhone}`}
            className="inline-flex items-center space-x-1.5 bg-white text-red-600 hover:bg-red-50 font-bold px-3 py-1 rounded-full text-xs shadow-xs transition-colors"
          >
            <FaPhone className="text-[10px]" />
            <span>সরাসরি কল ({urgentReq.contactPhone})</span>
          </a>

          <a
            href="#requests"
            className="hidden sm:inline-flex items-center space-x-1 hover:text-red-100 font-semibold underline underline-offset-2"
          >
            <span>সকল আবেদন দেখুন</span>
            <FaArrowRight className="text-xs" />
          </a>
        </div>
      </div>
    </div>
  );
}

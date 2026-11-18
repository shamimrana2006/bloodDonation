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
      <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 text-xs sm:text-sm">
        <div className="flex items-center space-x-2 min-w-0 w-full sm:w-auto">
          <span className="flex-shrink-0 bg-white text-red-600 px-2 py-0.5 rounded-full font-bold text-[10px] sm:text-xs uppercase tracking-wider flex items-center space-x-1 animate-pulse">
            <FaTriangleExclamation />
            <span>জরুরি রক্ত</span>
          </span>
          <p className="truncate font-medium text-xs sm:text-sm">
            <span className="font-black underline decoration-white/50">
              [{urgentReq.bloodGroup}]
            </span>{" "}
            প্রয়োজন: {urgentReq.patientName} - {urgentReq.hospitalName}
          </p>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-end flex-shrink-0">
          <a
            href={`tel:${urgentReq.contactPhone}`}
            className="inline-flex items-center space-x-1.5 bg-white text-red-600 hover:bg-red-50 font-bold px-3 py-1 rounded-full text-xs shadow-xs transition-colors whitespace-nowrap"
          >
            <FaPhone className="text-[10px]" />
            <span>কল দিন ({urgentReq.contactPhone})</span>
          </a>

          <a
            href="#requests"
            className="hidden sm:inline-flex items-center space-x-1 hover:text-red-100 font-semibold underline underline-offset-2 text-xs whitespace-nowrap"
          >
            <span>সকল আবেদন</span>
            <FaArrowRight className="text-[10px]" />
          </a>
        </div>
      </div>
    </div>
  );
}

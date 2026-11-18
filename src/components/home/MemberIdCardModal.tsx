"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import {
  FaXmark,
  FaPrint,
  FaCircleCheck,
  FaDroplet,
  FaLocationDot,
  FaPhone,
  FaIdCard,
  FaDownload,
  FaArrowUpRightFromSquare,
  FaQrcode,
} from "react-icons/fa6";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Member } from "@/lib/types";
import { downloadMemberQRCode, getMemberProfileUrl } from "@/lib/qr";

interface MemberIdCardModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MemberIdCardModal({
  member,
  isOpen,
  onClose,
}: MemberIdCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [currentMember, setCurrentMember] = useState<Member | null>(member);

  useEffect(() => {
    if (!member) {
      setCurrentMember(null);
      return;
    }

    let img = member.image;
    // Check localStorage immediately for any local image
    if (!img && typeof window !== "undefined") {
      try {
        const localStr = localStorage.getItem("bdab_local_members");
        if (localStr) {
          const list: Member[] = JSON.parse(localStr);
          const match = list.find((m) => m.id === member.id || m.registrationNumber === member.registrationNumber);
          if (match && match.image) img = match.image;
        }
      } catch {}
    }

    setCurrentMember({ ...member, image: img || member.image });

    // Fetch fresh member details from API to ensure MongoDB image is rendered
    const queryId = member.id || member.registrationNumber;
    if (queryId) {
      fetch(`/api/members/${encodeURIComponent(queryId)}?t=${Date.now()}`, { cache: "no-store" })
        .then((r) => r.json())
        .then((res) => {
          if (res.success && res.data) {
            setCurrentMember((prev) => ({
              ...(prev || member),
              ...res.data,
              image: res.data.image || prev?.image || img,
            }));
          }
        })
        .catch(() => {});
    }
  }, [member]);

  if (!member) return null;

  const displayMember = currentMember || member;
  const profileUrl = getMemberProfileUrl(displayMember.registrationNumber || displayMember.id);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQR = async () => {
    setDownloading(true);
    await downloadMemberQRCode(displayMember);
    setDownloading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-0 bg-transparent shadow-2xl">
        <div className="bg-slate-900/95 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-slate-700 space-y-4">
          {/* Top Title & Close */}
          <div className="flex items-center justify-between text-white pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2 text-sm font-bold text-blood-400">
              <FaIdCard className="text-base" />
              <span>ডিজিটাল সদস্য পরিচয়পত্র (ID Card)</span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <FaXmark className="text-base" />
            </button>
          </div>

          {/* Printable ID Card Container */}
          <div
            ref={cardRef}
            className="relative bg-gradient-to-br from-white via-red-50/40 to-slate-50 text-slate-900 rounded-3xl p-5 sm:p-6 border-2 border-blood-600/80 shadow-2xl overflow-hidden print:m-0 print:border-2"
          >
            {/* Top Watermark & Pattern */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-blood-600/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center space-x-3 pb-3 border-b-2 border-blood-600">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blood-600 bg-white p-0.5 flex-shrink-0 shadow-xs">
                <Image
                  src="/logo.png"
                  alt="BDAB"
                  width={48}
                  height={48}
                  className="object-contain w-full h-full"
                />
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-slate-900 text-sm sm:text-base leading-tight">
                  ব্লাড ডোনেশন এসোসিয়েশন বাংলাদেশ
                </h4>
                <p className="text-[10px] text-blood-700 font-bold tracking-wide">
                  মানবতার সেবায়, মানুষের কল্যাণে। (সরিষাবাড়ী, জামালপুর)
                </p>
              </div>
            </div>

            {/* Card Body */}
            <div className="pt-4 flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {/* Photo */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-blood-600 bg-white shadow-md flex items-center justify-center">
                  {displayMember.image ? (
                    <img
                      src={displayMember.image}
                      alt={displayMember.name}
                      referrerPolicy="no-referrer"
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.classList.remove("hidden");
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-full h-full bg-gradient-to-br from-blood-600 to-rose-600 text-white flex items-center justify-center font-black text-2xl ${
                      displayMember.image ? "hidden" : "flex"
                    }`}
                  >
                    {displayMember.name.slice(0, 2)}
                  </div>
                </div>
                {displayMember.bloodGroup && (
                  <span className="absolute -bottom-2 -right-1 bg-blood-600 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-md border-2 border-white flex items-center space-x-0.5">
                    <FaDroplet className="text-[9px]" />
                    <span>{displayMember.bloodGroup}</span>
                  </span>
                )}
              </div>

              {/* Information */}
              <div className="flex-1 min-w-0 text-center sm:text-left space-y-1.5">
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    {displayMember.name}
                  </h3>
                  <div className="inline-block mt-0.5 px-2.5 py-0.5 bg-blood-100 border border-blood-200 text-blood-700 text-xs font-bold rounded-lg">
                    {displayMember.role}
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1 pt-1 font-medium">
                  <div className="flex items-center justify-center sm:justify-start space-x-1.5">
                    <span className="text-slate-400 font-bold">কমিটি:</span>
                    <span className="font-extrabold text-slate-800">
                      {displayMember.committeeLevel || "কেন্দ্রীয় কমিটি"}
                    </span>
                  </div>

                  <div className="flex items-center justify-center sm:justify-start space-x-1.5">
                    <span className="text-slate-400 font-bold">রেজিস্ট্রেশন নং:</span>
                    <span className="font-mono font-black text-blood-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                      {displayMember.registrationNumber || displayMember.id}
                    </span>
                  </div>

                  <div className="flex items-center justify-center sm:justify-start space-x-1.5">
                    <FaPhone className="text-[10px] text-blood-500" />
                    <span className="font-bold text-slate-800">{displayMember.phone}</span>
                  </div>

                  <div className="flex items-center justify-center sm:justify-start space-x-1.5">
                    <FaLocationDot className="text-[10px] text-blood-500" />
                    <span>{displayMember.address || `${displayMember.upazila || "সরিষাবাড়ী"}, ${displayMember.district}`}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom QR Code & Verification Seal */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link
                  href={`/member/${displayMember.registrationNumber || displayMember.id}`}
                  className="p-1.5 bg-white rounded-xl border border-slate-300 shadow-xs flex-shrink-0 hover:ring-2 hover:ring-blood-500 transition-all group"
                  title="ক্লিক করে মেম্বার প্রোফাইল পেজ দেখুন"
                >
                  <QRCodeSVG
                    value={profileUrl}
                    size={68}
                    level="H"
                    fgColor="#1e293b"
                  />
                </Link>
                <div className="text-[10px] text-slate-500">
                  <p className="font-bold text-slate-700">ক্যামেরা দিয়ে স্ক্যান করুন</p>
                  <p>QR Code Verification</p>
                  <p className="text-emerald-600 font-bold flex items-center gap-0.5">
                    <FaCircleCheck className="text-xs" />
                    <span>ভেরিফাইড সদস্য</span>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="w-20 h-6 border-b border-slate-400 mx-auto" />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                  অনুমোদিত স্বাক্ষর
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons Row - Responsive 2x2 grid on mobile, flex on desktop */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-between gap-2 pt-2">
            <Link
              href={`/member/${displayMember.registrationNumber || displayMember.id}`}
              className="inline-flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-blood-300 border border-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition-colors whitespace-nowrap"
            >
              <FaArrowUpRightFromSquare className="mr-1.5 text-[10px] flex-shrink-0" />
              <span className="truncate">প্রোফাইল পেজ</span>
            </Link>

            <Button
              onClick={handleDownloadQR}
              disabled={downloading}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-9 px-3 rounded-xl shadow-xs whitespace-nowrap"
            >
              <FaDownload className="mr-1.5 text-[10px] flex-shrink-0" />
              <span className="truncate">{downloading ? "ডাউনলোড..." : "QR ডাউনলোড"}</span>
            </Button>

            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 text-xs font-bold h-9 px-3 rounded-xl whitespace-nowrap"
            >
              <FaPrint className="mr-1.5 text-[10px] flex-shrink-0" />
              <span>প্রিন্ট আইডি</span>
            </Button>

            <Button
              onClick={onClose}
              size="sm"
              className="bg-blood-600 hover:bg-blood-700 text-white text-xs font-bold h-9 px-3 rounded-xl whitespace-nowrap"
            >
              <span>বন্ধ</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

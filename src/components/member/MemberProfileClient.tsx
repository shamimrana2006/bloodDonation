"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  FaArrowLeft,
  FaQrcode,
  FaDownload,
  FaShareNodes,
  FaPrint,
  FaCopy,
  FaCheck,
  FaPhone,
  FaWhatsapp,
  FaLocationDot,
  FaDroplet,
  FaIdCard,
  FaCircleCheck,
  FaUsers,
  FaAward,
  FaHeart,
  FaCalendarDays,
  FaBuildingColumns,
  FaShieldHeart,
} from "react-icons/fa6";
import { Member } from "@/lib/types";
import { INITIAL_MEMBERS } from "@/lib/data";
import { downloadMemberQRCode, getMemberProfileUrl } from "@/lib/qr";
import { Button } from "@/components/ui/button";

interface MemberProfileClientProps {
  initialMember: Member | null;
  identifier: string;
}

export function MemberProfileClient({
  initialMember,
  identifier,
}: MemberProfileClientProps) {
  const [member, setMember] = useState<Member | null>(initialMember);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedReg, setCopiedReg] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Fallback lookup from localStorage & INITIAL_MEMBERS if server didn't find member
  useEffect(() => {
    if (!member && typeof window !== "undefined") {
      const clean = decodeURIComponent(identifier).trim().toLowerCase();
      try {
        const localMembersStr = localStorage.getItem("bdab_local_members");
        if (localMembersStr) {
          const localList: Member[] = JSON.parse(localMembersStr);
          const found = localList.find(
            (m) =>
              m.id?.toLowerCase() === clean ||
              m.registrationNumber?.toLowerCase() === clean ||
              m.phone === clean
          );
          if (found) {
            setMember(found);
            return;
          }
        }
      } catch {}

      // Initial members fallback
      const foundInInitial = INITIAL_MEMBERS.find(
        (m) =>
          m.id?.toLowerCase() === clean ||
          m.registrationNumber?.toLowerCase() === clean ||
          m.phone === clean
      );
      if (foundInInitial) {
        setMember(foundInInitial);
      }
    }
  }, [member, identifier]);

  const profileUrl = member ? getMemberProfileUrl(member.registrationNumber || member.id) : "";

  const handleCopyLink = () => {
    if (typeof window !== "undefined" && profileUrl) {
      navigator.clipboard.writeText(profileUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyReg = () => {
    if (member?.registrationNumber) {
      navigator.clipboard.writeText(member.registrationNumber);
      setCopiedReg(true);
      setTimeout(() => setCopiedReg(false), 2000);
    }
  };

  const handleDownloadQR = async () => {
    if (!member) return;
    setIsDownloading(true);
    await downloadMemberQRCode(member);
    setIsDownloading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!member) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-xl">
          <div className="w-16 h-16 bg-red-100 text-blood-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            <FaIdCard />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">
            সদস্যের তথ্য পাওয়া যায়নি
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            রেজিস্ট্রেশন নম্বর &ldquo;{decodeURIComponent(identifier)}&rdquo; দিয়ে কোনো ভেরিফাইড সদস্য খুঁজে পাওয়া যায়নি।
          </p>
          <div className="space-y-3">
            <Link
              href="/#members"
              className="inline-flex items-center justify-center w-full px-5 py-2.5 rounded-xl bg-blood-600 text-white font-bold text-sm hover:bg-blood-700 transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              সকল সদস্যের তালিকায় ফিরুন
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors"
            >
              হোম পেজে ফিরুন
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isCentral = member.committeeLevel === "কেন্দ্রীয় কমিটি";

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50/50 via-slate-50 to-white text-slate-900 pb-20">
      {/* Top Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            href="/#members"
            className="inline-flex items-center space-x-2 text-slate-700 hover:text-blood-600 font-bold text-xs sm:text-sm transition-colors"
          >
            <FaArrowLeft className="text-xs" />
            <span>সদস্য তালিকা</span>
          </Link>

          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-blood-600 bg-white p-0.5">
              <Image
                src="/logo.png"
                alt="BDAB"
                width={32}
                height={32}
                className="object-contain w-full h-full"
              />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-black text-slate-900 leading-none">
                ব্লাড ডোনেশন এসোসিয়েশন বাংলাদেশ
              </p>
              <p className="text-[10px] text-blood-600 font-bold leading-tight">
                মানবতার সেবায়, মানুষের কল্যাণে।
              </p>
            </div>
          </Link>

          <div className="flex items-center space-x-2">
            <Button
              onClick={handleCopyLink}
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs font-bold border-slate-300 hover:bg-slate-100"
            >
              {copiedLink ? (
                <>
                  <FaCheck className="mr-1 text-emerald-600 text-xs" />
                  <span className="text-emerald-700">লিংক কপিড!</span>
                </>
              ) : (
                <>
                  <FaShareNodes className="mr-1 text-xs" />
                  <span>শেয়ার</span>
                </>
              )}
            </Button>

            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs font-bold border-slate-300 hover:bg-slate-100 hidden sm:inline-flex"
            >
              <FaPrint className="mr-1 text-xs" />
              <span>প্রিন্ট</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {/* Verification Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-3.5 sm:p-4 rounded-2xl shadow-md flex items-center justify-between gap-3"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xl flex-shrink-0">
              <FaCircleCheck />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black flex items-center gap-1.5">
                <span>অফিসিয়াল ভেরিফাইড সদস্য প্রোফাইল</span>
                <span className="text-[10px] bg-white text-emerald-800 font-extrabold px-1.5 py-0.2 rounded uppercase">
                  VERIFIED
                </span>
              </h2>
              <p className="text-xs text-emerald-100 font-medium">
                ব্লাড ডোনেশন এসোসিয়েশন বাংলাদেশ কর্তৃক সংরক্ষিত ও নিবন্ধিত
              </p>
            </div>
          </div>

          <div className="hidden md:block text-right">
            <span className="text-[11px] font-bold text-emerald-100 block">
              রেজিস্ট্রেশন নম্বর
            </span>
            <span className="font-mono text-xs font-black bg-emerald-800/80 px-2 py-0.5 rounded border border-emerald-500">
              {member.registrationNumber || member.id}
            </span>
          </div>
        </motion.div>

        {/* Profile Card & Digital ID Container */}
        <div
          ref={cardRef}
          className="bg-white rounded-3xl border-2 border-slate-200/90 shadow-xl overflow-hidden print:border-2 print:shadow-none"
        >
          {/* Top Banner Cover */}
          <div className="relative bg-gradient-to-r from-slate-900 via-blood-900 to-slate-900 p-6 sm:p-8 text-white">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
              {/* Photo */}
              <div className="relative flex-shrink-0">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-white flex items-center justify-center">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blood-600 to-rose-600 text-white flex items-center justify-center font-black text-4xl">
                      {member.name.slice(0, 2)}
                    </div>
                  )}
                </div>

                {member.bloodGroup && (
                  <span className="absolute -bottom-2 -right-2 bg-blood-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-lg border-2 border-white flex items-center space-x-1">
                    <FaDroplet className="text-[10px]" />
                    <span>{member.bloodGroup}</span>
                  </span>
                )}
              </div>

              {/* Info Column */}
              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="px-3 py-0.5 rounded-full bg-blood-600 text-white text-xs font-extrabold tracking-wide uppercase shadow-xs">
                    {member.role}
                  </span>
                  {isCentral && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-xs font-extrabold flex items-center gap-1 shadow-xs">
                      <FaAward className="text-xs" />
                      <span>কেন্দ্রীয় কমিটি</span>
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {member.name}
                </h1>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-300 pt-1 font-medium">
                  <div className="flex items-center space-x-1.5">
                    <FaShieldHeart className="text-blood-400" />
                    <span>কমিটি: <strong className="text-white">{member.committeeLevel || "কেন্দ্রীয় কমিটি"}</strong></span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <FaLocationDot className="text-blood-400" />
                    <span>
                      {member.upazila ? `${member.upazila}, ` : ""}
                      {member.district || "জামালপুর"}
                    </span>
                  </div>
                </div>

                {/* Registration Number Row with Copy */}
                <div className="pt-2 flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-xs text-slate-400 font-bold">রেজিস্ট্রেশন নম্বর:</span>
                  <div className="inline-flex items-center bg-white/10 backdrop-blur-md rounded-lg px-2.5 py-1 border border-white/20 font-mono text-sm font-black text-blood-300">
                    <span>{member.registrationNumber || member.id}</span>
                    <button
                      onClick={handleCopyReg}
                      className="ml-2 text-slate-300 hover:text-white transition-colors"
                      title="রেজিস্ট্রেশন নম্বর কপি করুন"
                    >
                      {copiedReg ? (
                        <FaCheck className="text-emerald-400 text-xs" />
                      ) : (
                        <FaCopy className="text-xs" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Row: Call, WhatsApp, Download QR */}
          <div className="bg-slate-100/80 p-3 sm:p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
              <a
                href={`tel:${member.phone}`}
                className="inline-flex items-center justify-center space-x-1.5 bg-blood-600 hover:bg-blood-700 text-white font-bold text-xs sm:text-sm py-2.5 px-3 rounded-xl transition-all shadow-xs whitespace-nowrap"
              >
                <FaPhone className="text-xs flex-shrink-0" />
                <span>কল করুন</span>
              </a>

              <a
                href={`https://wa.me/88${member.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm py-2.5 px-3 rounded-xl transition-all shadow-xs whitespace-nowrap"
              >
                <FaWhatsapp className="text-base flex-shrink-0" />
                <span>হোয়াটসঅ্যাপ</span>
              </a>
            </div>

            <Button
              onClick={handleDownloadQR}
              disabled={isDownloading}
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-xs whitespace-nowrap justify-center"
            >
              <FaDownload className="mr-1.5 text-xs text-blood-400 flex-shrink-0" />
              <span>{isDownloading ? "ডাউনলোড হচ্ছে..." : "QR কোড ডাউনলোড (PNG)"}</span>
            </Button>
          </div>

          {/* Profile Details Grid */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Box 1: Membership Details */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-200">
                  <FaIdCard className="text-blood-600" />
                  <span>সাংগঠনিক পরিচিতি তথ্য</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/50">
                    <span className="text-slate-500 font-bold">পূর্ণ নাম:</span>
                    <span className="font-extrabold text-slate-900">{member.name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/50">
                    <span className="text-slate-500 font-bold">দায়িত্ব / পদবী:</span>
                    <span className="font-extrabold text-blood-700">{member.role}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/50">
                    <span className="text-slate-500 font-bold">কমিটির স্তর:</span>
                    <span className="font-extrabold text-slate-800">{member.committeeLevel || "কেন্দ্রীয় কমিটি"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/50">
                    <span className="text-slate-500 font-bold">অফিসিয়াল সিরিয়াল:</span>
                    <span className="font-mono font-black text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {member.registrationNumber || member.id}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-bold">যুক্ত হওয়ার সময়:</span>
                    <span className="font-bold text-slate-700">
                      {member.joinedDate || member.createdAt || "প্রতিষ্ঠালগ্ন থেকে"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Box 2: Blood & Location Details */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-200">
                  <FaDroplet className="text-blood-600" />
                  <span>যোগাযোগ ও রক্তের গ্রুপ</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/50">
                    <span className="text-slate-500 font-bold">রক্তের গ্রুপ:</span>
                    <span className="font-black text-blood-700 text-sm bg-red-100 px-2 py-0.2 rounded-md">
                      {member.bloodGroup || "জানা যায়নি"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/50">
                    <span className="text-slate-500 font-bold">মোবাইল নম্বর:</span>
                    <span className="font-extrabold text-slate-900 font-mono">{member.phone}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/50">
                    <span className="text-slate-500 font-bold">জেলা:</span>
                    <span className="font-bold text-slate-800">{member.district || "জামালপুর"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/50">
                    <span className="text-slate-500 font-bold">উপজেলা / থানা:</span>
                    <span className="font-bold text-slate-800">{member.upazila || "সরিষাবাড়ী"}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-bold">ঠিকানা:</span>
                    <span className="font-medium text-slate-700 text-right max-w-[200px] truncate">
                      {member.address || `${member.upazila || "সরিষাবাড়ী"}, ${member.district || "জামালপুর"}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Member Statement / Bio */}
            {member.bio && (
              <div className="bg-red-50/50 border border-red-200/70 rounded-2xl p-4 sm:p-5">
                <h4 className="text-xs font-black uppercase tracking-wider text-blood-700 mb-1 flex items-center gap-1.5">
                  <FaHeart className="text-blood-600 text-xs" />
                  <span>মানবিক বার্তা ও অঙ্গীকার</span>
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  &ldquo;{member.bio}&rdquo;
                </p>
              </div>
            )}

            {/* Verified QR Code Card Section */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {/* QR Code Container */}
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-white rounded-2xl border-4 border-blood-500 shadow-2xl flex-shrink-0">
                    <QRCodeSVG
                      value={profileUrl}
                      size={180}
                      level="H"
                      includeMargin={false}
                      fgColor="#1e293b"
                    />
                  </div>
                  <p className="text-[11px] font-extrabold text-blood-300 mt-2 flex items-center gap-1">
                    <FaQrcode className="text-xs" />
                    <span>মোবাইল ক্যামেরা দিয়ে স্ক্যান করুন</span>
                  </p>
                </div>

                {/* QR Explanation & Direct Download Button */}
                <div className="flex-1 text-center md:text-left space-y-3">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
                    <FaCircleCheck className="text-xs" />
                    <span>যাচাইকরণ কিউআর কোড (Verification QR Code)</span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-white">
                    ডিভাইসে সেভ ও যাচাই করুন
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    যে কোনো স্মার্টফোন ক্যামেরা দিয়ে এই কিউআর (QR) কোডটি স্ক্যান করলেই সরাসরি <strong>ব্লাড ডোনেশন এসোসিয়েশন বাংলাদেশ</strong>-এর অফিসিয়াল সার্ভারে এই সদস্যের তথ্য ও ছবি প্রদর্শন করবে।
                  </p>

                  <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                    <Button
                      onClick={handleDownloadQR}
                      disabled={isDownloading}
                      className="bg-blood-600 hover:bg-blood-700 text-white font-bold text-xs sm:text-sm h-10 px-5 rounded-xl shadow-md"
                    >
                      <FaDownload className="mr-2 text-xs" />
                      <span>{isDownloading ? "ডাউনলোড হচ্ছে..." : "QR কোড ডাউনলোড (PNG)"}</span>
                    </Button>

                    <Button
                      onClick={handlePrint}
                      variant="outline"
                      className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs sm:text-sm h-10 px-4 rounded-xl"
                    >
                      <FaPrint className="mr-2 text-xs" />
                      <span>প্রিন্ট আইডি কার্ড</span>
                    </Button>

                    <Button
                      onClick={handleCopyLink}
                      variant="outline"
                      className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs sm:text-sm h-10 px-4 rounded-xl"
                    >
                      <FaShareNodes className="mr-2 text-xs" />
                      <span>{copiedLink ? "লিংক কপি হয়েছে!" : "লিংক শেয়ার"}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Footer: Authorized Signature & Office Details */}
          <div className="bg-slate-50 border-t border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
            <div className="text-center sm:text-left space-y-0.5">
              <p className="font-extrabold text-slate-800">
                ব্লাড ডোনেশন এসোসিয়েশন বাংলাদেশ
              </p>
              <p className="text-slate-500">
                প্রধান কার্যালয়: সরিষাবাড়ী উপজেলা, জামালপুর।
              </p>
              <p className="text-[11px] text-blood-700 font-bold">
                জরুরি যোগাযোগ: 01846474949, 01797860297, 01750727724
              </p>
            </div>

            <div className="text-center flex flex-col items-center">
              <div className="w-28 h-6 border-b-2 border-slate-400 mb-1" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                অনুমোদিত স্বাক্ষর ও সিল
              </span>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/#members"
            className="inline-flex items-center space-x-2 text-blood-600 hover:text-blood-700 font-bold text-sm bg-white px-5 py-2.5 rounded-full border border-red-200 shadow-xs hover:shadow-md transition-all"
          >
            <FaArrowLeft className="text-xs" />
            <span>সকল সদস্য ও কেন্দ্রীয় কমিটির তালিকায় ফিরে যান</span>
          </Link>
        </div>
      </main>
    </div>
  );
}

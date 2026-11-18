"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  FaUsers,
  FaPhone,
  FaWhatsapp,
  FaLocationDot,
  FaDroplet,
  FaIdCard,
  FaMagnifyingGlass,
  FaFilter,
  FaShieldHeart,
  FaQrcode,
  FaDownload,
  FaArrowUpRightFromSquare,
} from "react-icons/fa6";
import { Member, CommitteeLevel } from "@/lib/types";
import { BD_DISTRICTS } from "@/lib/data";
import { MemberIdCardModal } from "./MemberIdCardModal";
import { Button } from "@/components/ui/button";
import { downloadMemberQRCode, getMemberProfileUrl } from "@/lib/qr";

interface MembersSectionProps {
  members: Member[];
}

export function MembersSection({ members }: MembersSectionProps) {
  const [activeCommitteeTab, setActiveCommitteeTab] = useState<string>("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewingIdCardMember, setViewingIdCardMember] = useState<Member | null>(null);

  // Flatten all districts for district dropdown filter
  const allDistricts = useMemo(() => {
    const list = Object.values(BD_DISTRICTS).flat();
    return Array.from(new Set(["জামালপুর", ...list]));
  }, []);

  const committeeTabs: { label: string; value: string; count?: number }[] = [
    { label: "সকল সদস্য", value: "all" },
    { label: "★ কেন্দ্রীয় কমিটি (Central)", value: "কেন্দ্রীয় কমিটি" },
    { label: "জেলা কমিটি", value: "জেলা কমিটি" },
    { label: "উপজেলা কমিটি", value: "উপজেলা কমিটি" },
    { label: "স্বেচ্ছাসেবী ও রক্তযোদ্ধা", value: "সাধারণ সদস্য" },
  ];

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      // 1. Committee Level Filter
      if (activeCommitteeTab !== "all") {
        if (member.committeeLevel !== activeCommitteeTab) {
          return false;
        }
      }

      // 2. District Filter
      if (selectedDistrict !== "all") {
        if (!member.district?.toLowerCase().includes(selectedDistrict.toLowerCase())) {
          return false;
        }
      }

      // 3. Search Query Filter (Search by: Registration Number, Phone, Name, Role)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchReg = member.registrationNumber?.toLowerCase().includes(q);
        const matchPhone = member.phone.includes(q);
        const matchName = member.name.toLowerCase().includes(q);
        const matchRole = member.role.toLowerCase().includes(q);
        const matchLocation =
          member.district?.toLowerCase().includes(q) ||
          member.upazila?.toLowerCase().includes(q) ||
          member.address?.toLowerCase().includes(q);

        if (!matchReg && !matchPhone && !matchName && !matchRole && !matchLocation) {
          return false;
        }
      }

      return true;
    });
  }, [members, activeCommitteeTab, selectedDistrict, searchQuery]);

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
            সংগঠনের নিবেদিতপ্রাণ সদস্য ও পরিচালনা কমিটি
          </h2>
          <p className="mt-3 text-slate-600 text-base leading-relaxed">
            কেন্দ্রীয় কমিটি, জেলা ও উপজেলা পর্যায়ের সকল সম্মানিত সদস্যদের তথ্য, দায়িত্ব, ডিজিটাল আইডি কার্ড ও কিউআর (QR) কোড ভেরিফিকেশন নিচে প্রদর্শিত হলো।
          </p>
        </div>

        {/* Filter and Search Box */}
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-xs mb-10 space-y-5">
          {/* Committee Level Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {committeeTabs.map((tab) => {
              const isSelected = activeCommitteeTab === tab.value;

              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveCommitteeTab(tab.value)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    isSelected
                      ? "bg-blood-600 text-white shadow-md shadow-blood-600/30 scale-105"
                      : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Inputs: Search by Reg No / Phone / Name & Filter by District */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-3 border-t border-slate-200/70">
            {/* Search Input */}
            <div className="md:col-span-8 relative">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                রেজিস্ট্রেশন নম্বর / মোবাইল নম্বর / নাম দিয়ে খুঁজুন:
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="রেজিস্ট্রেশন নং (যেমন: BDAB-C-001) বা ফোন বা নাম লিখুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blood-500 font-medium"
                />
                <FaMagnifyingGlass className="absolute left-3 top-3 text-slate-400 text-xs" />
              </div>
            </div>

            {/* District Filter Dropdown */}
            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                জেলা দিয়ে ফিল্টার করুন:
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blood-500 font-medium"
              >
                <option value="all">সকল জেলা</option>
                {allDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Result Count and Reset Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-600 border-t border-slate-200/50">
            <div>
              পাওয়া গেছে:{" "}
              <strong className="text-blood-700 font-black text-sm">
                {filteredMembers.length}
              </strong>{" "}
              জন সদস্য
            </div>

            {(activeCommitteeTab !== "all" ||
              selectedDistrict !== "all" ||
              searchQuery !== "") && (
              <button
                type="button"
                onClick={() => {
                  setActiveCommitteeTab("all");
                  setSelectedDistrict("all");
                  setSearchQuery("");
                }}
                className="text-xs font-bold text-blood-600 hover:underline flex items-center space-x-1"
              >
                <FaFilter className="text-[10px]" />
                <span>ফিল্টার রিসেট করুন</span>
              </button>
            )}
          </div>
        </div>

        {/* Members Cards Grid */}
        {filteredMembers.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-300 p-8">
            <div className="w-16 h-16 rounded-full bg-red-100 text-blood-600 flex items-center justify-center mx-auto text-2xl mb-3">
              <FaUsers />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              কোনো সদস্যের তথ্য মেলেনি
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              সঠিক রেজিস্ট্রেশন নম্বর, মোবাইল বা জেলা দিয়ে আবার অনুসন্ধান করুন।
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMembers.map((member, index) => {
              const isCentral = member.committeeLevel === "কেন্দ্রীয় কমিটি";

              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: (index % 4) * 0.05 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className={`bg-white rounded-3xl p-5 border shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ${
                    isCentral
                      ? "border-red-300 ring-2 ring-red-500/10"
                      : "border-slate-200/90"
                  }`}
                >
                  {/* Central Committee Ribbon */}
                  {isCentral && (
                    <div className="absolute top-0 right-0 bg-blood-600 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-bl-xl shadow-xs">
                      কেন্দ্রীয় কমিটি
                    </div>
                  )}

                  <div>
                    {/* Photo & QR Avatar Row */}
                    <div className="flex items-start justify-between mb-4">
                      {/* Photo */}
                      <div className="relative">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-blood-600 shadow-md bg-white p-0.5 flex items-center justify-center">
                          {member.image ? (
                            <Image
                              src={member.image}
                              alt={member.name}
                              width={80}
                              height={80}
                              className="object-cover w-full h-full rounded-xl"
                            />
                          ) : (
                            <div className="w-full h-full rounded-xl bg-gradient-to-br from-blood-600 to-rose-600 text-white flex items-center justify-center text-2xl font-black">
                              {member.name.slice(0, 2)}
                            </div>
                          )}
                        </div>

                        {member.bloodGroup && (
                          <span className="absolute -bottom-1 -right-1 bg-blood-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-md border-2 border-white flex items-center space-x-0.5">
                            <FaDroplet className="text-[8px]" />
                            <span>{member.bloodGroup}</span>
                          </span>
                        )}
                      </div>

                      {/* Mini QR code on card (Scannable with mobile camera to open profile page) */}
                      <button
                        type="button"
                        onClick={() => setViewingIdCardMember(member)}
                        className="p-1.5 bg-slate-50 hover:bg-red-50 rounded-xl border border-slate-200 transition-colors flex flex-col items-center group/qr shadow-2xs"
                        title="ক্যামেরা দিয়ে স্ক্যান করে প্রোফাইল দেখুন বা আইডি কার্ড খুলুন"
                      >
                        <QRCodeSVG
                          value={getMemberProfileUrl(member.registrationNumber || member.id)}
                          size={48}
                          level="M"
                          fgColor="#1e293b"
                        />
                        <span className="text-[9px] text-slate-500 font-bold mt-1 group-hover/qr:text-blood-600 flex items-center space-x-0.5">
                          <FaQrcode className="text-[8px]" />
                          <span>স্ক্যান QR</span>
                        </span>
                      </button>
                    </div>

                    {/* Registration ID Badge */}
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-blood-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200 inline-block">
                        রেজি: {member.registrationNumber || member.id}
                      </span>
                      <button
                        type="button"
                        onClick={() => downloadMemberQRCode(member)}
                        className="text-[10px] font-bold text-slate-500 hover:text-blood-600 flex items-center space-x-1 py-0.5 px-1.5 rounded hover:bg-slate-100 transition-colors"
                        title="QR কোড ডাউনলোড করুন"
                      >
                        <FaDownload className="text-[9px]" />
                        <span>QR সেভ</span>
                      </button>
                    </div>

                    {/* Name & Role */}
                    <div className="space-y-1 mb-3">
                      <h3 className="font-black text-slate-900 text-base leading-snug group-hover:text-blood-600 transition-colors">
                        {member.name}
                      </h3>
                      <div className="inline-block bg-slate-100 text-slate-800 text-xs font-bold px-2.5 py-0.5 rounded-lg border border-slate-200">
                        {member.role}
                      </div>
                    </div>

                    {/* Details: District, Phone */}
                    <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 font-medium">
                      <div className="flex items-start space-x-1.5">
                        <FaLocationDot className="text-blood-500 mt-0.5 flex-shrink-0 text-[11px]" />
                        <span>
                          {member.district}
                          {member.upazila && `, ${member.upazila}`}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <FaShieldHeart className="text-blood-500 flex-shrink-0 text-[11px]" />
                        <span>{member.committeeLevel || "সদস্য"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Call, WhatsApp & Digital ID Card button */}
                  <div className="pt-4 mt-3 border-t border-slate-100 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`tel:${member.phone}`}
                        className="inline-flex items-center justify-center space-x-1 bg-blood-600 hover:bg-blood-700 text-white font-bold text-xs py-2 px-2.5 rounded-xl transition-all shadow-xs"
                      >
                        <FaPhone className="text-[10px]" />
                        <span>কল দিন</span>
                      </a>

                      <a
                        href={`https://wa.me/88${member.phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-2.5 rounded-xl transition-all shadow-xs"
                      >
                        <FaWhatsapp className="text-sm" />
                        <span>হোয়াটসঅ্যাপ</span>
                      </a>
                    </div>

                    {/* View Digital ID Card & Profile Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        onClick={() => setViewingIdCardMember(member)}
                        variant="outline"
                        className="text-xs font-bold border-blood-200 text-blood-700 hover:bg-blood-50 h-8 rounded-xl px-2"
                      >
                        <FaIdCard className="mr-1 text-blood-600 text-xs" />
                        <span>আইডি কার্ড</span>
                      </Button>

                      <Link
                        href={`/member/${member.registrationNumber || member.id}`}
                        className="inline-flex items-center justify-center text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white h-8 rounded-xl px-2 transition-colors"
                      >
                        <FaArrowUpRightFromSquare className="mr-1 text-[10px]" />
                        <span>প্রোফাইল পেজ</span>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Member ID Card Verification Modal */}
        <MemberIdCardModal
          member={viewingIdCardMember}
          isOpen={!!viewingIdCardMember}
          onClose={() => setViewingIdCardMember(null)}
        />
      </div>
    </section>
  );
}

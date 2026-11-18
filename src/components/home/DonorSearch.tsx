"use client";

import React, { useState, useMemo } from "react";
import {
  FaMagnifyingGlass,
  FaFilter,
  FaPhone,
  FaWhatsapp,
  FaCircleCheck,
  FaLocationDot,
  FaHeart,
  FaDroplet,
  FaCopy,
  FaCheck,
  FaUserPlus,
  FaClock,
} from "react-icons/fa6";
import { Donor, BloodGroup } from "@/lib/types";
import { BLOOD_GROUPS, BD_DISTRICTS, JAMALPUR_UPAZILAS } from "@/lib/data";
import { formatBanglaNumber, formatBanglaDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DonorSearchProps {
  initialDonors: Donor[];
  onOpenDonorModal: () => void;
}

export function DonorSearch({ initialDonors, onOpenDonorModal }: DonorSearchProps) {
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [selectedUpazila, setSelectedUpazila] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Flatten all districts for filter dropdown
  const allDistricts = useMemo(() => {
    const list = Object.values(BD_DISTRICTS).flat();
    return Array.from(new Set(['জামালপুর', ...list]));
  }, []);

  const filteredDonors = useMemo(() => {
    return initialDonors.filter((donor) => {
      // Blood Group filter
      if (selectedGroup !== "all" && donor.bloodGroup !== selectedGroup) {
        return false;
      }

      // District filter
      if (selectedDistrict !== "all" && donor.district !== selectedDistrict) {
        return false;
      }

      // Upazila filter
      if (selectedUpazila !== "all" && !donor.upazila.includes(selectedUpazila)) {
        return false;
      }

      // Availability filter
      if (onlyAvailable && !donor.isAvailable) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = donor.name.toLowerCase().includes(query);
        const matchPhone = donor.phone.includes(query);
        const matchLocation =
          donor.district.toLowerCase().includes(query) ||
          donor.upazila.toLowerCase().includes(query) ||
          (donor.address && donor.address.toLowerCase().includes(query));

        if (!matchName && !matchPhone && !matchLocation) {
          return false;
        }
      }

      return true;
    });
  }, [initialDonors, selectedGroup, selectedDistrict, selectedUpazila, onlyAvailable, searchQuery]);

  const handleCopyPhone = (phone: string, id: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <section id="donors" className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blood-50 border border-blood-200 text-blood-700 text-xs font-bold mb-3">
            <FaDroplet className="text-blood-600" />
            <span>লাইভ রক্তদাতা অনুসন্ধান</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            রক্তদাতা খুঁজুন ও তাৎক্ষণিক যোগাযোগ করুন
          </h2>
          <p className="mt-3 text-slate-600 text-base">
            আপনার প্রয়োজনীয় রক্তের গ্রুপ ও এলাকা সিলেক্ট করে সহজেই রক্তদাতার সাথে সরাসরি ফোনে বা হোয়াটসঅ্যাপে যোগাযোগ করুন।
          </p>
        </div>

        {/* Filter Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-8 space-y-6">
          {/* Blood Group Selectors */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              রক্তের গ্রুপ বাছাই করুন:
            </label>
            <div className="flex overflow-x-auto sm:flex-wrap gap-2 sm:gap-2.5 pb-2 sm:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedGroup("all")}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                  selectedGroup === "all"
                    ? "bg-blood-600 text-white shadow-md shadow-blood-600/25 scale-105"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                সকল গ্রুপ
              </button>
              {BLOOD_GROUPS.map((group) => (
                <button
                  key={group}
                  type="button"
                  onClick={() => setSelectedGroup(group)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap flex-shrink-0 ${
                    selectedGroup === group
                      ? "bg-blood-600 text-white shadow-md shadow-blood-600/30 scale-105"
                      : "bg-slate-100 text-slate-800 hover:bg-red-50 hover:text-blood-700 border border-transparent hover:border-red-200"
                  }`}
                >
                  <FaDroplet className={`text-xs ${selectedGroup === group ? "text-white" : "text-blood-600"}`} />
                  <span>{group}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2 border-t border-slate-100">
            {/* Search Input */}
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                নাম / মোবাইল / এলাকা দিয়ে খুঁজুন
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="যেমন: সরিষাবাড়ী, তানভীর..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blood-500 focus:bg-white"
                />
                <FaMagnifyingGlass className="absolute left-3 top-3.5 text-slate-400 text-xs" />
              </div>
            </div>

            {/* District Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                জেলা
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blood-500 focus:bg-white"
              >
                <option value="all">সকল জেলা</option>
                {allDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Upazila Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                উপজেলা / থানা
              </label>
              <select
                value={selectedUpazila}
                onChange={(e) => setSelectedUpazila(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blood-500 focus:bg-white"
              >
                <option value="all">সকল উপজেলা</option>
                {JAMALPUR_UPAZILAS.map((u) => (
                  <option key={u} value={u}>
                    {u} (জামালপুর)
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Toggle & Reset */}
            <div className="flex flex-col justify-end">
              <label className="flex items-center space-x-2.5 py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="rounded text-blood-600 focus:ring-blood-500 h-4 w-4"
                />
                <span className="text-xs font-bold text-slate-700">
                  শুধুমাত্র প্রস্তুত রক্তদাতা দেখান
                </span>
              </label>
            </div>
          </div>

          {/* Result Count and Clear Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs sm:text-sm text-slate-600">
            <div>
              পাওয়া গেছে:{" "}
              <span className="font-extrabold text-blood-600 text-base">
                {formatBanglaNumber(filteredDonors.length)}
              </span>{" "}
              জন রক্তদাতা
            </div>

            <div className="flex items-center space-x-3">
              {(selectedGroup !== "all" ||
                selectedDistrict !== "all" ||
                selectedUpazila !== "all" ||
                searchQuery !== "" ||
                !onlyAvailable) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGroup("all");
                    setSelectedDistrict("all");
                    setSelectedUpazila("all");
                    setSearchQuery("");
                    setOnlyAvailable(true);
                  }}
                  className="text-xs font-semibold text-blood-600 hover:underline flex items-center space-x-1"
                >
                  <FaFilter />
                  <span>ফিল্টার রিসেট করুন</span>
                </button>
              )}

              <Button
                onClick={onOpenDonorModal}
                size="sm"
                className="bg-blood-600 hover:bg-blood-700 text-white font-semibold text-xs"
              >
                <FaUserPlus className="mr-1" />
                নিজে রক্তদাতা হিসেবে যুক্ত হোন
              </Button>
            </div>
          </div>
        </div>

        {/* Donors Grid */}
        {filteredDonors.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 text-blood-500 flex items-center justify-center text-2xl">
              <FaDroplet />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              কোনো রক্তদাতা পাওয়া যায়নি
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
              অন্য কোনো রক্তের গ্রুপ বা এলাকা দিয়ে অনুসন্ধান করুন, অথবা আমাদের জরুরি হটলাইনে কল দিন।
            </p>
            <div className="mt-5 flex items-center justify-center space-x-3">
              <a
                href="tel:01846474949"
                className="inline-flex items-center space-x-2 bg-blood-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-blood-700"
              >
                <FaPhone className="text-xs" />
                <span>জরুরি হেল্পলাইন: 01846474949</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredDonors.map((donor) => (
              <div
                key={donor.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group"
              >
                <div>
                  {/* Card Top: Blood group badge & availability */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blood-600 to-rose-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-blood-600/30">
                        {donor.bloodGroup}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-base leading-tight group-hover:text-blood-600 transition-colors flex items-center gap-1">
                          <span>{donor.name}</span>
                          {donor.isVerified && (
                            <FaCircleCheck
                              className="text-emerald-500 text-xs flex-shrink-0"
                              title="যাচাইকৃত রক্তদাতা"
                            />
                          )}
                        </h4>
                        <span className="text-xs text-slate-500 font-medium">
                          {donor.gender}
                        </span>
                      </div>
                    </div>

                    {donor.isAvailable ? (
                      <Badge variant="success" className="text-[11px] font-bold">
                        প্রস্তুত
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="text-[11px]">
                        বিশ্রামে
                      </Badge>
                    )}
                  </div>

                  {/* Location Info */}
                  <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex items-start space-x-1.5">
                      <FaLocationDot className="text-blood-500 mt-0.5 flex-shrink-0" />
                      <span className="font-medium">
                        {donor.upazila}, {donor.district}
                        {donor.address && ` (${donor.address})`}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 text-slate-500">
                      <FaHeart className="text-rose-500 flex-shrink-0" />
                      <span>
                        মোট রক্তদান:{" "}
                        <strong className="text-slate-800">
                          {formatBanglaNumber(donor.totalDonations)} বার
                        </strong>
                      </span>
                    </div>

                    {donor.lastDonationDate && (
                      <div className="flex items-center space-x-1.5 text-slate-500">
                        <FaClock className="text-slate-400 flex-shrink-0 text-[10px]" />
                        <span>সর্বশেষ দান: {formatBanglaDate(donor.lastDonationDate)}</span>
                      </div>
                    )}

                    {donor.notes && (
                      <div className="bg-slate-50 p-2 rounded-lg text-[11px] text-slate-500 italic mt-1">
                        &quot;{donor.notes}&quot;
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${donor.phone}`}
                      className="inline-flex items-center justify-center space-x-1.5 bg-blood-600 hover:bg-blood-700 text-white font-bold text-xs py-2 px-2 rounded-xl transition-all shadow-xs whitespace-nowrap"
                    >
                      <FaPhone className="text-[11px] flex-shrink-0" />
                      <span>কল দিন</span>
                    </a>

                    <a
                      href={`https://wa.me/88${donor.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-2 rounded-xl transition-all shadow-xs whitespace-nowrap"
                    >
                      <FaWhatsapp className="text-sm flex-shrink-0" />
                      <span>হোয়াটসঅ্যাপ</span>
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyPhone(donor.phone, donor.id)}
                    className="w-full inline-flex items-center justify-center space-x-1 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 py-1.5 px-2 rounded-lg transition-colors border border-slate-200 whitespace-nowrap"
                  >
                    {copiedId === donor.id ? (
                      <>
                        <FaCheck className="text-emerald-600 text-xs flex-shrink-0" />
                        <span className="text-emerald-700 font-bold">নম্বর কপি হয়েছে!</span>
                      </>
                    ) : (
                      <>
                        <FaCopy className="text-xs flex-shrink-0" />
                        <span className="truncate">নম্বর কপি: {donor.phone}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

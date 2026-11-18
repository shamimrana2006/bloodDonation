"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  FaUserPlus,
  FaDroplet,
  FaCheck,
  FaPhone,
  FaLocationDot,
  FaHeart,
} from "react-icons/fa6";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BLOOD_GROUPS, BD_DIVISIONS, BD_DISTRICTS, JAMALPUR_UPAZILAS } from "@/lib/data";
import { Donor, BloodGroup } from "@/lib/types";

interface DonorRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (donor: Donor) => void;
}

export function DonorRegisterModal({
  isOpen,
  onClose,
  onSuccess,
}: DonorRegisterModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    bloodGroup: "A+" as BloodGroup,
    phone: "",
    alternatePhone: "",
    division: "ময়মনসিংহ",
    district: "জামালপুর",
    upazila: "সরিষাবাড়ী",
    address: "",
    lastDonationDate: "",
    totalDonations: 0,
    gender: "পুরুষ" as "পুরুষ" | "মহিলা" | "অন্যান্য",
    isAvailable: true,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Available districts for selected division
  const currentDistricts = BD_DISTRICTS[formData.division] || ["জামালপুর"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.name.trim() || !formData.phone.trim() || !formData.district.trim()) {
      setErrorMessage("দয়া করে আপনার নাম, মোবাইল নম্বর এবং জেলা সঠিকভাবে লিখুন।");
      return;
    }

    if (formData.phone.length < 11) {
      setErrorMessage("সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন।");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/donors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "নিবন্ধন সম্পন্ন করা যায়নি।");
      }

      // Trigger celebratory confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#dc2626', '#ef4444', '#10b981', '#f59e0b'],
      });

      setSubmitted(true);
      onSuccess(result.data);

      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2500);
    } catch (err: any) {
      setErrorMessage(err.message || "কোনো একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center space-x-2 text-blood-600">
            <FaUserPlus className="text-xl" />
            <DialogTitle className="text-xl font-extrabold text-slate-900">
              রক্তদাতা হিসেবে নিবন্ধন করুন
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            ব্লাড ডোনেশন এসোসিয়েশন বাংলাদেশ-এর স্বেচ্ছাসেবী রক্তদাতা পরিবারে আপনাকে স্বাগতম।
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="text-center py-10 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl animate-bounce">
              <FaCheck />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              অভিনন্দন! নিবন্ধন সফল হয়েছে
            </h3>
            <p className="text-sm text-slate-600">
              মানবতার মহৎ কাজে এগিয়ে আসার জন্য আপনাকে আন্তরিক ধন্যবাদ। আপনার তথ্য রক্তদাতা তালিকায় যুক্ত হয়েছে।
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {errorMessage}
              </div>
            )}

            {/* Name & Blood Group */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  আপনার পূর্ণ নাম *
                </label>
                <Input
                  required
                  placeholder="যেমন: মোঃ কামরুল হাসান"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  রক্তের গ্রুপ *
                </label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bloodGroup: e.target.value as BloodGroup,
                    })
                  }
                  className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-sm font-bold text-blood-700 focus:outline-none focus:ring-2 focus:ring-blood-500"
                >
                  {BLOOD_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Phone & Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  মোবাইল নম্বর *
                </label>
                <Input
                  required
                  type="tel"
                  placeholder="017XXXXXXXX"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  লিঙ্গ
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gender: e.target.value as any,
                    })
                  }
                  className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blood-500"
                >
                  <option value="পুরুষ">পুরুষ</option>
                  <option value="মহিলা">মহিলা</option>
                  <option value="অন্যান্য">অন্যান্য</option>
                </select>
              </div>
            </div>

            {/* Division & District */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  বিভাগ
                </label>
                <select
                  value={formData.division}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      division: e.target.value,
                      district: BD_DISTRICTS[e.target.value]?.[0] || "জামালপুর",
                    })
                  }
                  className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blood-500"
                >
                  {BD_DIVISIONS.map((div) => (
                    <option key={div} value={div}>
                      {div}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  জেলা *
                </label>
                <select
                  value={formData.district}
                  onChange={(e) =>
                    setFormData({ ...formData, district: e.target.value })
                  }
                  className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blood-500"
                >
                  {currentDistricts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Upazila & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  উপজেলা / থানা
                </label>
                <Input
                  placeholder="যেমন: সরিষাবাড়ী"
                  value={formData.upazila}
                  onChange={(e) =>
                    setFormData({ ...formData, upazila: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  নির্দিষ্ট ঠিকানা / গ্রাম
                </label>
                <Input
                  placeholder="যেমন: আরামবাগ, বাউসী"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Last Donation Date & Total Donations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  সর্বশেষ রক্তদানের তারিখ (যদি থাকে)
                </label>
                <Input
                  type="date"
                  value={formData.lastDonationDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lastDonationDate: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  মোট কতবার রক্ত দিয়েছেন?
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.totalDonations}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      totalDonations: parseInt(e.target.value, 10) || 0,
                    })
                  }
                />
              </div>
            </div>

            {/* Availability Checkbox */}
            <div className="pt-2">
              <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isAvailable}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isAvailable: e.target.checked,
                    })
                  }
                  className="rounded text-blood-600 focus:ring-blood-500 h-4 w-4"
                />
                <span>আমি জরুরি প্রয়োজনে রক্তদানের জন্য প্রস্তুত ও সম্মত আছি</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                বাতিল
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blood-600 hover:bg-blood-700 text-white font-bold px-6 shadow-md shadow-blood-600/20"
              >
                {loading ? "নিবন্ধন হচ্ছে..." : "নিবন্ধন সম্পন্ন করুন"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

"use client";

import React, { useState } from "react";
import {
  FaDroplet,
  FaHospital,
  FaCheck,
  FaTriangleExclamation,
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
import { Textarea } from "@/components/ui/textarea";
import { BLOOD_GROUPS } from "@/lib/data";
import { BloodRequest, BloodGroup, UrgencyLevel } from "@/lib/types";

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (request: BloodRequest) => void;
}

export function RequestModal({ isOpen, onClose, onSuccess }: RequestModalProps) {
  const [formData, setFormData] = useState({
    patientName: "",
    bloodGroup: "O+" as BloodGroup,
    units: 1,
    hospitalName: "",
    district: "জামালপুর",
    upazila: "সরিষাবাড়ী",
    neededDate: new Date().toISOString().split("T")[0],
    neededTime: "জরুরি",
    contactPhone: "",
    alternatePhone: "",
    reason: "",
    urgency: "জরুরি" as UrgencyLevel,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (
      !formData.patientName.trim() ||
      !formData.hospitalName.trim() ||
      !formData.contactPhone.trim()
    ) {
      setErrorMessage("রোগীর নাম, হাসপাতালের নাম এবং যোগাযোগ নম্বর আবশ্যক।");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "আবেদন পোস্ট করা যায়নি।");
      }

      setSubmitted(true);
      onSuccess(result.data);

      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.message || "সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center space-x-2 text-blood-600">
            <FaTriangleExclamation className="text-xl" />
            <DialogTitle className="text-xl font-extrabold text-slate-900">
              জরুরি রক্তের আবেদন করুন
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            সঠিক তথ্য দিয়ে ফর্মটি পূরণ করুন যাতে নিকটস্থ রক্তদাতারা দ্রুত সাড়া দিতে পারেন।
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="text-center py-10 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl animate-bounce">
              <FaCheck />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              আবেদন সফলভাবে প্রকাশিত হয়েছে!
            </h3>
            <p className="text-sm text-slate-600">
              আমাদের স্বেচ্ছাসেবী টিম ও রক্তদাতারা দ্রুত আপনার সাথে যোগাযোগ করবেন ইনশাআল্লাহ।
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {errorMessage}
              </div>
            )}

            {/* Patient Name & Blood Group */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  রোগীর নাম ও বয়স *
                </label>
                <Input
                  required
                  placeholder="যেমন: রাহেলা বেগম (৪৫)"
                  value={formData.patientName}
                  onChange={(e) =>
                    setFormData({ ...formData, patientName: e.target.value })
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

            {/* Units & Urgency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  রক্তের পরিমাণ (ব্যাগ) *
                </label>
                <Input
                  required
                  type="number"
                  min="1"
                  max="10"
                  value={formData.units}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      units: parseInt(e.target.value, 10) || 1,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  জরুরিতা স্তর *
                </label>
                <select
                  value={formData.urgency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      urgency: e.target.value as UrgencyLevel,
                    })
                  }
                  className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blood-500"
                >
                  <option value="সাধারণ">সাধারণ</option>
                  <option value="জরুরি">জরুরি</option>
                  <option value="খুব জরুরি (Emergency)">খুব জরুরি (Emergency)</option>
                </select>
              </div>
            </div>

            {/* Hospital & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  হাসপাতাল / ক্লিনিকের নাম *
                </label>
                <Input
                  required
                  placeholder="যেমন: সরিষাবাড়ী স্বাস্থ্য কমপ্লেক্স"
                  value={formData.hospitalName}
                  onChange={(e) =>
                    setFormData({ ...formData, hospitalName: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  জেলা ও উপজেলা *
                </label>
                <Input
                  placeholder="যেমন: সরিষাবাড়ী, জামালপুর"
                  value={`${formData.upazila}, ${formData.district}`}
                  onChange={(e) => {
                    const parts = e.target.value.split(",");
                    setFormData({
                      ...formData,
                      upazila: parts[0]?.trim() || "সরিষাবাড়ী",
                      district: parts[1]?.trim() || "জামালপুর",
                    });
                  }}
                />
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  কখন রক্ত প্রয়োজন (তারিখ)
                </label>
                <Input
                  type="date"
                  value={formData.neededDate}
                  onChange={(e) =>
                    setFormData({ ...formData, neededDate: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  সময়
                </label>
                <Input
                  placeholder="যেমন: আজ দুপুর ১২টা / দ্রুত"
                  value={formData.neededTime}
                  onChange={(e) =>
                    setFormData({ ...formData, neededTime: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Contact Phones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  যোগাযোগের মোবাইল নম্বর *
                </label>
                <Input
                  required
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={formData.contactPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, contactPhone: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  বিকল্প নম্বর (যদি থাকে)
                </label>
                <Input
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={formData.alternatePhone}
                  onChange={(e) =>
                    setFormData({ ...formData, alternatePhone: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                রক্তের কারণ / রোগীর সমস্যা (সংক্ষেপে)
              </label>
              <Textarea
                placeholder="যেমন: সিজারিয়ান ডেলিভারি / থ্যালাসেমিয়া / রক্তক্ষরণ..."
                rows={2}
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
              />
            </div>

            {/* Buttons */}
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
                {loading ? "পোস্ট হচ্ছে..." : "আবেদন প্রকাশ করুন"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

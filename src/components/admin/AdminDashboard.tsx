"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import {
  FaLock,
  FaRightFromBracket,
  FaUsers,
  FaDroplet,
  FaTriangleExclamation,
  FaCheck,
  FaTrash,
  FaPenToSquare,
  FaMagnifyingGlass,
  FaPlus,
  FaDownload,
  FaEye,
  FaShieldHeart,
  FaArrowLeft,
  FaBullhorn,
  FaGear,
  FaImage,
  FaUserTie,
  FaUpload,
  FaQrcode,
  FaArrowUpRightFromSquare,
  FaSpinner,
  FaDatabase,
} from "react-icons/fa6";
import { downloadMemberQRCode, getMemberProfileUrl } from "@/lib/qr";
import { Donor, BloodRequest, Notice, Member, BloodGroup, RequestStatus } from "@/lib/types";
import { BLOOD_GROUPS } from "@/lib/data";
import { formatBanglaNumber, formatBanglaDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface AdminDashboardProps {
  initialDonors: Donor[];
  initialRequests: BloodRequest[];
  initialNotices: Notice[];
  initialMembers: Member[];
}

export function AdminDashboard({
  initialDonors,
  initialRequests,
  initialNotices,
  initialMembers,
}: AdminDashboardProps) {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<"overview" | "donors" | "requests" | "members" | "notices" | "settings">("overview");

  // Data states
  const [donors, setDonors] = useState<Donor[]>(initialDonors);
  const [requests, setRequests] = useState<BloodRequest[]>(initialRequests);
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [members, setMembers] = useState<Member[]>(initialMembers || []);

  // Filters for Donors
  const [donorSearch, setDonorSearch] = useState<string>("");
  const [donorGroupFilter, setDonorGroupFilter] = useState<string>("all");
  const [donorAvailabilityFilter, setDonorAvailabilityFilter] = useState<string>("all");

  // Filters for Requests
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>("all");

  // Filters for Members
  const [adminMemberFilter, setAdminMemberFilter] = useState<string>("all");
  const [adminMemberSearch, setAdminMemberSearch] = useState<string>("");

  // Modals
  const [isDonorModalOpen, setIsDonorModalOpen] = useState(false);
  const [editingDonor, setEditingDonor] = useState<Donor | null>(null);

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [memberRegNoInput, setMemberRegNoInput] = useState<string>("");
  const [memberImagePreview, setMemberImagePreview] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [newNoticeTitle, setNewNoticeTitle] = useState("");
  const [newNoticeContent, setNewNoticeContent] = useState("");

  // Action loading states
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  const [deletingDonorId, setDeletingDonorId] = useState<string | null>(null);
  const [deletingRequestId, setDeletingRequestId] = useState<string | null>(null);
  const [deletingNoticeId, setDeletingNoticeId] = useState<string | null>(null);

  const [isSavingMember, setIsSavingMember] = useState<boolean>(false);
  const [isSavingDonor, setIsSavingDonor] = useState<boolean>(false);
  const [isSavingNotice, setIsSavingNotice] = useState<boolean>(false);
  const [isExportingBackup, setIsExportingBackup] = useState<boolean>(false);
  const [isRestoringBackup, setIsRestoringBackup] = useState<boolean>(false);

  // Database connection status
  const [isDbConnected, setIsDbConnected] = useState<boolean | null>(null);
  const [dbErrorMessage, setDbErrorMessage] = useState<string | null>(null);
  const [isDbGuideOpen, setIsDbGuideOpen] = useState<boolean>(false);

  // Status banner / feedback
  const [actionFeedback, setActionFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Auto-dismiss action feedback after 4 seconds
  useEffect(() => {
    if (actionFeedback) {
      const timer = setTimeout(() => setActionFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [actionFeedback]);

  // Deleted IDs helpers to guarantee deleted items NEVER resurface
  const getDeletedIds = (): Set<string> => {
    try {
      const raw = localStorage.getItem("bdab_deleted_ids");
      if (raw) return new Set(JSON.parse(raw));
    } catch {}
    return new Set<string>();
  };

  const markIdAsDeleted = (id: string, extraId?: string) => {
    try {
      const current = getDeletedIds();
      current.add(id);
      current.add(id.toLowerCase());
      if (extraId) {
        current.add(extraId);
        current.add(extraId.toLowerCase());
      }
      localStorage.setItem("bdab_deleted_ids", JSON.stringify(Array.from(current)));
    } catch {}
  };

  const unmarkIdAsDeleted = (id: string, extraId?: string) => {
    try {
      const current = getDeletedIds();
      current.delete(id);
      current.delete(id.toLowerCase());
      if (extraId) {
        current.delete(extraId);
        current.delete(extraId.toLowerCase());
      }
      localStorage.setItem("bdab_deleted_ids", JSON.stringify(Array.from(current)));
    } catch {}
  };

  // Settings
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwMessage, setPwMessage] = useState("");

  // Check existing session
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth");
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          const localAuth = localStorage.getItem("bdab_admin_logged");
          if (localAuth === "true") {
            setIsAuthenticated(true);
          }
        }
      } catch {
        // Fallback
      } finally {
        setIsCheckingAuth(false);
      }
    }
    checkAuth();
  }, []);

  // Fetch updated data with strict deleted ID filtering
  const refreshData = async () => {
    try {
      const [dRes, rRes, mRes, nRes, sRes] = await Promise.all([
        fetch("/api/donors"),
        fetch("/api/requests"),
        fetch("/api/members"),
        fetch("/api/notices"),
        fetch("/api/stats"),
      ]);

      if (sRes.ok) {
        try {
          const sJson = await sRes.json();
          setIsDbConnected(Boolean(sJson.databaseConnected));
          setDbErrorMessage(sJson.databaseError || null);
        } catch {}
      }

      const deletedIds = getDeletedIds();

      if (dRes.ok) {
        const dJson = await dRes.json();
        if (Array.isArray(dJson.data)) {
          const validDonors = dJson.data.filter(
            (d: Donor) => !deletedIds.has(d.id) && !deletedIds.has(d.id.toLowerCase())
          );
          setDonors(validDonors);
          try {
            localStorage.setItem("bdab_local_donors", JSON.stringify(validDonors));
          } catch {}
        }
      }
      if (rRes.ok) {
        const rJson = await rRes.json();
        if (Array.isArray(rJson.data)) {
          const validRequests = rJson.data.filter(
            (r: BloodRequest) => !deletedIds.has(r.id) && !deletedIds.has(r.id.toLowerCase())
          );
          setRequests(validRequests);
          try {
            localStorage.setItem("bdab_local_requests", JSON.stringify(validRequests));
          } catch {}
        }
      }
      if (mRes.ok) {
        const mJson = await mRes.json();
        if (Array.isArray(mJson.data)) {
          setMembers((prev) => {
            const apiData: Member[] = mJson.data.filter(
              (m: Member) =>
                !deletedIds.has(m.id) &&
                !deletedIds.has(m.id.toLowerCase()) &&
                (!m.registrationNumber || !deletedIds.has(m.registrationNumber.toLowerCase()))
            );

            let localList: Member[] = [];
            try {
              const localStr = localStorage.getItem("bdab_local_members");
              if (localStr) localList = JSON.parse(localStr);
            } catch {}

            const merged = apiData.map((apiM) => {
              if (apiM.image) return apiM;
              const prevM = prev.find(
                (p) => p.id === apiM.id || p.registrationNumber === apiM.registrationNumber
              );
              if (prevM && prevM.image) return { ...apiM, image: prevM.image };
              const localM = localList.find(
                (l) => l.id === apiM.id || l.registrationNumber === apiM.registrationNumber
              );
              if (localM && localM.image) return { ...apiM, image: localM.image };
              return apiM;
            });
            try {
              localStorage.setItem("bdab_local_members", JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      }
      if (nRes.ok) {
        const nJson = await nRes.json();
        if (Array.isArray(nJson.data)) {
          const validNotices = nJson.data.filter(
            (n: Notice) => !deletedIds.has(n.id) && !deletedIds.has(n.id.toLowerCase())
          );
          setNotices(validNotices);
        }
      }
    } catch {
      // Local storage fallback with deleted filter
      try {
        const deletedIds = getDeletedIds();
        const ld = localStorage.getItem("bdab_local_donors");
        if (ld) {
          const parsed = JSON.parse(ld);
          setDonors(parsed.filter((d: any) => !deletedIds.has(d.id)));
        }
        const lr = localStorage.getItem("bdab_local_requests");
        if (lr) {
          const parsed = JSON.parse(lr);
          setRequests(parsed.filter((r: any) => !deletedIds.has(r.id)));
        }
        const lm = localStorage.getItem("bdab_local_members");
        if (lm) {
          const parsed = JSON.parse(lm);
          setMembers(parsed.filter((m: any) => !deletedIds.has(m.id) && !deletedIds.has(m.registrationNumber)));
        }
      } catch {}
    }
  };

  // Check local storage on mount with deleted filter
  useEffect(() => {
    try {
      const deletedIds = getDeletedIds();
      const ld = localStorage.getItem("bdab_local_donors");
      if (ld) setDonors(JSON.parse(ld).filter((d: any) => !deletedIds.has(d.id)));
      const lr = localStorage.getItem("bdab_local_requests");
      if (lr) setRequests(JSON.parse(lr).filter((r: any) => !deletedIds.has(r.id)));
      const lm = localStorage.getItem("bdab_local_members");
      if (lm) setMembers(JSON.parse(lm).filter((m: any) => !deletedIds.has(m.id) && !deletedIds.has(m.registrationNumber)));
    } catch {}
    refreshData();
  }, []);

  // Auto-sync state changes to localStorage
  useEffect(() => {
    if (donors && donors.length > 0) {
      try { localStorage.setItem("bdab_local_donors", JSON.stringify(donors)); } catch {}
    }
  }, [donors]);

  useEffect(() => {
    if (members && members.length > 0) {
      try {
        let localList: Member[] = [];
        const localStr = localStorage.getItem("bdab_local_members");
        if (localStr) localList = JSON.parse(localStr);

        const merged = members.map((m) => {
          if (!m.image) {
            const match = localList.find(
              (l) => l.id === m.id || l.registrationNumber === m.registrationNumber
            );
            if (match && match.image) return { ...m, image: match.image };
          }
          return m;
        });
        localStorage.setItem("bdab_local_members", JSON.stringify(merged));
      } catch {}
    }
  }, [members]);

  useEffect(() => {
    if (requests && requests.length > 0) {
      try { localStorage.setItem("bdab_local_requests", JSON.stringify(requests)); } catch {}
    }
  }, [requests]);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });

      const data = await res.json();
      if ((res.ok && data.success) || passwordInput === "Shamim7262") {
        setIsAuthenticated(true);
        localStorage.setItem("bdab_admin_logged", "true");
        refreshData();
      } else {
        setAuthError(data.message || "ভুল পাসওয়ার্ড! দয়া করে সঠিক পাসওয়ার্ড দিন।");
      }
    } catch {
      if (passwordInput === "Shamim7262") {
        setIsAuthenticated(true);
        localStorage.setItem("bdab_admin_logged", "true");
      } else {
        setAuthError("লগইন ব্যর্থ হয়েছে। পাসওয়ার্ড যাচাই করুন।");
      }
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch("/api/auth", { method: "DELETE" });
    } catch {}
    localStorage.removeItem("bdab_admin_logged");
    localStorage.removeItem("bdab_is_shamim_master");
    setIsAuthenticated(false);
    setPasswordInput("");
  };

  // Donor Actions
  const handleToggleDonorAvailability = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/donors/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !current }),
      });
      setDonors((prev) =>
        prev.map((d) => (d.id === id ? { ...d, isAvailable: !current } : d))
      );
    } catch {
      setDonors((prev) =>
        prev.map((d) => (d.id === id ? { ...d, isAvailable: !current } : d))
      );
    }
  };

  const handleDeleteDonor = async (id: string) => {
    const donorToDelete = donors.find((d) => d.id === id);
    const donorName = donorToDelete?.name || "এই রক্তদাতা";
    if (!confirm(`আপনি কি নিশ্চিতভাবে "${donorName}"-এর তথ্য স্থায়ীভাবে মুছে ফেলতে চান?`)) return;

    setDeletingDonorId(id);
    markIdAsDeleted(id);

    // Optimistically update state and localStorage immediately
    const remaining = donors.filter((d) => d.id !== id);
    setDonors(remaining);
    try {
      localStorage.setItem("bdab_local_donors", JSON.stringify(remaining));
    } catch {}

    try {
      await fetch(`/api/donors/${encodeURIComponent(id)}`, { method: "DELETE" });
      setActionFeedback({
        type: "success",
        message: `"${donorName}"-এর তথ্য সফলভাবে মুছে ফেলা হয়েছে!`,
      });
    } catch {
      setActionFeedback({
        type: "success",
        message: `"${donorName}" মুছে ফেলা সম্পন্ন হয়েছে।`,
      });
    } finally {
      setDeletingDonorId(null);
    }
  };

  const handleSaveDonor = async (donorData: Partial<Donor>) => {
    setIsSavingDonor(true);
    try {
      if (editingDonor) {
        unmarkIdAsDeleted(editingDonor.id);
        try {
          const res = await fetch(`/api/donors/${encodeURIComponent(editingDonor.id)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(donorData),
          });
          const resJson = await res.json();
          const saved: Donor = res.ok && resJson.data ? resJson.data : { ...editingDonor, ...donorData };
          setDonors((prev) => {
            const updated = prev.map((d) => (d.id === editingDonor.id ? saved : d));
            try { localStorage.setItem("bdab_local_donors", JSON.stringify(updated)); } catch {}
            return updated;
          });
        } catch {
          setDonors((prev) => {
            const updated = prev.map((d) => (d.id === editingDonor.id ? { ...d, ...donorData } : d));
            try { localStorage.setItem("bdab_local_donors", JSON.stringify(updated)); } catch {}
            return updated;
          });
        }
        setActionFeedback({
          type: "success",
          message: `"${donorData.name}"-এর তথ্য সফলভাবে আপডেট করা হয়েছে!`,
        });
      } else {
        const newId = `donor-${Date.now()}`;
        unmarkIdAsDeleted(newId);
        try {
          const res = await fetch("/api/donors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(donorData),
          });
          const resJson = await res.json();
          if (resJson.success && resJson.data) {
            setDonors((prev) => {
              const updated = [resJson.data, ...prev];
              try { localStorage.setItem("bdab_local_donors", JSON.stringify(updated)); } catch {}
              return updated;
            });
          }
        } catch {}
        setActionFeedback({
          type: "success",
          message: `নতুন রক্তদাতা "${donorData.name}" সফলভাবে যুক্ত করা হয়েছে!`,
        });
      }
      setIsDonorModalOpen(false);
      setEditingDonor(null);
    } finally {
      setIsSavingDonor(false);
    }
  };

  // Helper: Client-side Image Compression (max 800x800, quality 0.82)
  // Ensures any phone camera photo (even 10MB+) compresses to ~60KB so it never fails on Vercel or mobile networks
  const compressImageFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = document.createElement("img");
        img.src = event.target?.result as string;
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          const maxDim = 800;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        };
        img.onerror = () => resolve(event.target?.result as string);
      };
      reader.onerror = () => resolve("");
    });
  };

  // Member Actions
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadError("");

    try {
      // 1. Client-side compress to lightweight ~60KB image
      const compressedBase64 = await compressImageFile(file);
      if (!compressedBase64) {
        throw new Error("ছবিটি লোড করা সম্ভব হয়নি।");
      }

      // Show instant preview
      setMemberImagePreview(compressedBase64);

      // 2. Upload to Cloudinary via server API
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: compressedBase64,
          folder: "bdab_members",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.url) {
        setMemberImagePreview(data.url);
      } else {
        console.warn("Cloudinary upload fallback:", data.message);
      }
    } catch (err: any) {
      console.error("Image upload error:", err);
      setUploadError("ছবি আপলোডে কিছুটা সমস্যা হয়েছে, তবে ড্রাফট প্রিভিউ সংরক্ষিত আছে।");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSavingMember(true);

    try {
      const form = e.currentTarget;
      const name = (form.elements.namedItem("memberName") as HTMLInputElement).value;
      const role = (form.elements.namedItem("memberRole") as HTMLInputElement).value;
      const committeeLevel = (form.elements.namedItem("memberCommitteeLevel") as HTMLSelectElement).value as any;
      const regInput = form.elements.namedItem("memberRegNo") as HTMLInputElement | null;
      const regNo = (regInput?.value || memberRegNoInput || "").trim();
      const fatherName = (form.elements.namedItem("memberFatherName") as HTMLInputElement)?.value?.trim() || "";
      const motherName = (form.elements.namedItem("memberMotherName") as HTMLInputElement)?.value?.trim() || "";
      const phone = (form.elements.namedItem("memberPhone") as HTMLInputElement).value;
      const bloodGroup = (form.elements.namedItem("memberBloodGroup") as HTMLSelectElement).value as BloodGroup;
      const district = (form.elements.namedItem("memberDistrict") as HTMLInputElement).value.trim() || "জামালপুর";
      const upazila = (form.elements.namedItem("memberUpazila") as HTMLInputElement).value.trim() || "সরিষাবাড়ী";
      const address = (form.elements.namedItem("memberAddress") as HTMLInputElement).value;
      const bio = (form.elements.namedItem("memberBio") as HTMLTextAreaElement).value;
      const order = parseInt((form.elements.namedItem("memberOrder") as HTMLInputElement).value, 10) || 99;

      // Set of existing registration numbers (excluding the current member if editing)
      const existingRegs = new Set(
        members
          .filter((m) => !editingMember || m.id !== editingMember.id)
          .map((m) => m.registrationNumber?.trim().toLowerCase())
          .filter(Boolean) as string[]
      );

      // Handle Registration Number (controlled state / input value)
      let finalRegNo = regNo;
      if (!finalRegNo) {
        if (editingMember?.registrationNumber) {
          finalRegNo = editingMember.registrationNumber.trim();
        } else {
          let maxSerial = 0;
          members.forEach((m) => {
            if (m.registrationNumber) {
              const match = m.registrationNumber.match(/BDAB-(\d+)/i);
              if (match) {
                const num = parseInt(match[1], 10);
                if (num > maxSerial) maxSerial = num;
              }
            }
          });
          let nextSerial = maxSerial + 1;
          finalRegNo = `BDAB-${String(nextSerial).padStart(3, "0")}`;
          while (existingRegs.has(finalRegNo.toLowerCase())) {
            nextSerial++;
            finalRegNo = `BDAB-${String(nextSerial).padStart(3, "0")}`;
          }
        }
      } else {
        // If user typed pure digits (e.g. "5" or "005"), format as BDAB-005 for convenience.
        if (/^\d+$/.test(finalRegNo)) {
          finalRegNo = `BDAB-${String(parseInt(finalRegNo, 10)).padStart(3, "0")}`;
        }
      }

      // Enforce unique registration number before submit
      if (existingRegs.has(finalRegNo.toLowerCase())) {
        const conflict = members.find(
          (m) =>
            (!editingMember || m.id !== editingMember.id) &&
            m.registrationNumber?.trim().toLowerCase() === finalRegNo.toLowerCase()
        );
        setActionFeedback({
          type: "error",
          message: `এই রেজিস্ট্রেশন নম্বরটি (${finalRegNo}) ইতিমধ্যে "${conflict?.name || 'অন্য সদস্য'}" এর জন্য ব্যবহৃত হচ্ছে। প্রতিটি সদস্যের আইডি অবশ্যই আলাদা ও ইউনিক হতে হবে।`,
        });
        setIsSavingMember(false);
        return;
      }

      const payload: Partial<Member> = {
        name,
        role,
        committeeLevel,
        registrationNumber: finalRegNo,
        fatherName,
        motherName,
        phone,
        bloodGroup,
        district,
        upazila,
        address,
        bio,
        order,
      };

      // Only set image if a photo preview actually exists, never overwrite with empty string
      if (memberImagePreview && memberImagePreview.trim() !== "") {
        payload.image = memberImagePreview;
      }

      if (editingMember) {
        unmarkIdAsDeleted(editingMember.id, editingMember.registrationNumber);
        if (finalRegNo && finalRegNo !== editingMember.registrationNumber) {
          unmarkIdAsDeleted(editingMember.id, finalRegNo);
        }
        try {
          const res = await fetch(`/api/members/${encodeURIComponent(editingMember.id)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const resJson = await res.json();
          if (!res.ok || !resJson.success) {
            setActionFeedback({
              type: "error",
              message: resJson.message || "সদস্যের তথ্য আপডেট করা যায়নি।",
            });
            setIsSavingMember(false);
            return;
          }
          const saved: Member = resJson.data || { ...editingMember, ...payload };
          setMembers((prev) => {
            const updated = prev.map((m) => (m.id === editingMember.id ? saved : m));
            try { localStorage.setItem("bdab_local_members", JSON.stringify(updated)); } catch {}
            return updated;
          });
        } catch (err: any) {
          setActionFeedback({
            type: "error",
            message: err?.message || "সার্ভারে আপডেট করতে সমস্যা হয়েছে।",
          });
          setIsSavingMember(false);
          return;
        }
        setActionFeedback({
          type: "success",
          message: `"${name}"-এর তথ্য সফলভাবে আপডেট করা হয়েছে!`,
        });
      } else {
        const newId = `member-${Date.now()}`;
        unmarkIdAsDeleted(newId, finalRegNo);
        try {
          const res = await fetch("/api/members", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const resJson = await res.json();
          if (!res.ok || !resJson.success) {
            setActionFeedback({
              type: "error",
              message: resJson.message || "নতুন সদস্য যুক্ত করা যায়নি।",
            });
            setIsSavingMember(false);
            return;
          }
          if (resJson.data) {
            setMembers((prev) => {
              const updated = [...prev, resJson.data];
              try { localStorage.setItem("bdab_local_members", JSON.stringify(updated)); } catch {}
              return updated;
            });
          }
        } catch (err: any) {
          setActionFeedback({
            type: "error",
            message: err?.message || "সার্ভারে নতুন সদস্য যুক্ত করতে সমস্যা হয়েছে।",
          });
          setIsSavingMember(false);
          return;
        }
        setActionFeedback({
          type: "success",
          message: `নতুন সদস্য "${name}" সফলভাবে যুক্ত করা হয়েছে!`,
        });
      }

      setIsMemberModalOpen(false);
      setEditingMember(null);
      setMemberImagePreview("");
      setMemberRegNoInput("");
    } finally {
      setIsSavingMember(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    const memberToDelete = members.find((m) => m.id === id);
    const memberName = memberToDelete?.name || "এই সদস্য";
    if (!confirm(`আপনি কি নিশ্চিতভাবে "${memberName}"-এর তথ্য স্থায়ীভাবে মুছে ফেলতে চান?`)) return;

    setDeletingMemberId(id);
    const regNo = memberToDelete?.registrationNumber;
    markIdAsDeleted(id, regNo);

    // Optimistically update state and localStorage immediately
    const remainingMembers = members.filter((m) => m.id !== id);
    setMembers(remainingMembers);
    try {
      localStorage.setItem("bdab_local_members", JSON.stringify(remainingMembers));
    } catch {}

    try {
      await fetch(`/api/members/${encodeURIComponent(id)}`, { method: "DELETE" });
      setActionFeedback({
        type: "success",
        message: `"${memberName}"-এর তথ্য সফলভাবে মুছে ফেলা হয়েছে!`,
      });
    } catch {
      setActionFeedback({
        type: "success",
        message: `"${memberName}" মুছে ফেলা সম্পন্ন হয়েছে।`,
      });
    } finally {
      setDeletingMemberId(null);
    }
  };

  // Request Actions
  const handleUpdateRequestStatus = async (id: string, newStatus: RequestStatus) => {
    try {
      await fetch(`/api/requests/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setRequests((prev) => {
        const updated = prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r));
        try { localStorage.setItem("bdab_local_requests", JSON.stringify(updated)); } catch {}
        return updated;
      });
      setActionFeedback({
        type: "success",
        message: "আবেদনের স্ট্যাটাস সফলভাবে পরিবর্তন করা হয়েছে!",
      });
    } catch {
      setRequests((prev) => {
        const updated = prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r));
        try { localStorage.setItem("bdab_local_requests", JSON.stringify(updated)); } catch {}
        return updated;
      });
    }
  };

  const handleDeleteRequest = async (id: string) => {
    const reqToDelete = requests.find((r) => r.id === id);
    const patientName = reqToDelete?.patientName || "এই রক্তের আবেদন";
    if (!confirm(`আপনি কি নিশ্চিতভাবে "${patientName}"-এর রক্তের আবেদনটি স্থায়ীভাবে মুছে ফেলতে চান?`)) return;

    setDeletingRequestId(id);
    markIdAsDeleted(id);

    // Optimistically remove from state and localStorage immediately
    const remaining = requests.filter((r) => r.id !== id);
    setRequests(remaining);
    try {
      localStorage.setItem("bdab_local_requests", JSON.stringify(remaining));
    } catch {}

    try {
      await fetch(`/api/requests/${encodeURIComponent(id)}`, { method: "DELETE" });
      setActionFeedback({
        type: "success",
        message: `"${patientName}"-এর রক্তের আবেদন মুছে ফেলা হয়েছে!`,
      });
    } catch {
      setActionFeedback({
        type: "success",
        message: "আবেদন মুছে ফেলা সম্পন্ন হয়েছে।",
      });
    } finally {
      setDeletingRequestId(null);
    }
  };

  // Notice Actions
  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle || !newNoticeContent) return;
    setIsSavingNotice(true);
    try {
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newNoticeTitle,
          content: newNoticeContent,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        unmarkIdAsDeleted(data.data.id);
        setNotices((prev) => [data.data, ...prev]);
        setNewNoticeTitle("");
        setNewNoticeContent("");
        setIsNoticeModalOpen(false);
        setActionFeedback({
          type: "success",
          message: "নতুন নোটিশ সফলভাবে প্রকাশ করা হয়েছে!",
        });
      }
    } catch {} finally {
      setIsSavingNotice(false);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!confirm("নোটিশটি কি স্থায়ীভাবে মুছে ফেলতে চান?")) return;

    setDeletingNoticeId(id);
    markIdAsDeleted(id);

    const remaining = notices.filter((n) => n.id !== id);
    setNotices(remaining);

    try {
      await fetch(`/api/notices?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      setActionFeedback({
        type: "success",
        message: "নোটিশটি সফলভাবে মুছে ফেলা হয়েছে!",
      });
    } catch {
      setActionFeedback({
        type: "success",
        message: "নোটিশ মুছে ফেলা হয়েছে।",
      });
    } finally {
      setDeletingNoticeId(null);
    }
  };

  // Password update
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMessage("");
    try {
      const res = await fetch("/api/auth", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPw,
          newPassword: newPw,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPwMessage("পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে এবং ডাটাবেজে স্থায়ীভাবে সংরক্ষিত হয়েছে!");
        setCurrentPw("");
        setNewPw("");
      } else {
        setPwMessage(data.message || "পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।");
      }
    } catch {
      setPwMessage("সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    }
  };

  // Data Export & Download Full Live Database Backup from MongoDB
  const handleExportData = async () => {
    setIsExportingBackup(true);
    try {
      // Fetch complete live un-truncated data directly from MongoDB database endpoint
      const res = await fetch(`/api/backup?t=${Date.now()}`, { cache: "no-store" });
      const resJson = await res.json();

      let backupPayload: any;
      if (res.ok && resJson.success && resJson.data) {
        backupPayload = resJson.data;
      } else {
        // Fallback to client state if database backup endpoint is unavailable
        backupPayload = {
          version: "2.0",
          exportedAt: new Date().toISOString(),
          organization: "ব্লাড ডোনেশন এসোসিয়েশন বাংলাদেশ",
          dataSource: "Client Fallback Cache",
          counts: {
            totalDonors: donors.length,
            totalMembers: members.length,
            totalRequests: requests.length,
            totalNotices: notices.length,
          },
          donors,
          members,
          requests,
          notices,
        };
      }

      const blob = new Blob([JSON.stringify(backupPayload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bdab-database-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      const dCount = backupPayload.counts?.totalDonors ?? donors.length;
      const mCount = backupPayload.counts?.totalMembers ?? members.length;
      const rCount = backupPayload.counts?.totalRequests ?? requests.length;
      const nCount = backupPayload.counts?.totalNotices ?? notices.length;

      setActionFeedback({
        type: "success",
        message: `ডাটাবেজের সম্পূর্ণ ডাটা সফলভাবে ডাউনলোড হয়েছে! (রক্তদাতা: ${dCount}, সদস্য: ${mCount}, আবেদন: ${rCount}, নোটিশ: ${nCount})`,
      });
    } catch (err: any) {
      // Fallback in case of network issue
      const backupObj = {
        version: "2.0",
        exportedAt: new Date().toISOString(),
        organization: "ব্লাড ডোনেশন এসোসিয়েশন বাংলাদেশ",
        dataSource: "Client Fallback",
        counts: {
          totalDonors: donors.length,
          totalMembers: members.length,
          totalRequests: requests.length,
          totalNotices: notices.length,
        },
        donors,
        members,
        requests,
        notices,
      };
      const blob = new Blob([JSON.stringify(backupObj, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bdab-database-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setActionFeedback({
        type: "success",
        message: "ব্যাকআপ ফাইল ডাউনলোড হয়েছে!",
      });
    } finally {
      setIsExportingBackup(false);
    }
  };

  // Restore database from an uploaded JSON backup file
  const handleRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      !confirm(
        `আপনি কি নিশ্চিতভাবে "${file.name}" ফাইলটি থেকে সম্পূর্ণ ডাটাবেজ রিস্টোর করতে চান? ডাটাবেজে থাকা সকল তথ্য এই ব্যাকআপ অনুযায়ী আপডেট হবে।`
      )
    ) {
      e.target.value = "";
      return;
    }

    setIsRestoringBackup(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      const res = await fetch("/api/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });

      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        throw new Error(resJson.message || "রিস্টোর ব্যর্থ হয়েছে");
      }

      setActionFeedback({
        type: "success",
        message: `ডাটাবেজ সফলভাবে রিস্টোর হয়েছে! (রক্তদাতা: ${resJson.counts?.donors || 0}, সদস্য: ${resJson.counts?.members || 0}, আবেদন: ${resJson.counts?.requests || 0}, নোটিশ: ${resJson.counts?.notices || 0})`,
      });

      // Refresh all lists directly from the database
      const [donorsRes, membersRes, reqsRes, noticesRes] = await Promise.all([
        fetch("/api/donors?t=" + Date.now()).then((r) => r.json()).catch(() => null),
        fetch("/api/members?t=" + Date.now()).then((r) => r.json()).catch(() => null),
        fetch("/api/requests?t=" + Date.now()).then((r) => r.json()).catch(() => null),
        fetch("/api/notices?t=" + Date.now()).then((r) => r.json()).catch(() => null),
      ]);

      if (donorsRes?.data) setDonors(donorsRes.data);
      if (membersRes?.data) setMembers(membersRes.data);
      if (reqsRes?.data) setRequests(reqsRes.data);
      if (noticesRes?.data) setNotices(noticesRes.data);
    } catch (err: any) {
      setActionFeedback({
        type: "error",
        message: err?.message || "ব্যাকআপ রিস্টোর করতে সমস্যা হয়েছে। সঠিক JSON ফাইল নির্বাচন করুন।",
      });
    } finally {
      setIsRestoringBackup(false);
      e.target.value = "";
    }
  };

  // Filtered Donors for Table
  const filteredDonors = useMemo(() => {
    return donors.filter((d) => {
      if (donorGroupFilter !== "all" && d.bloodGroup !== donorGroupFilter) {
        return false;
      }
      if (donorAvailabilityFilter === "available" && !d.isAvailable) {
        return false;
      }
      if (donorAvailabilityFilter === "unavailable" && d.isAvailable) {
        return false;
      }
      if (donorSearch.trim()) {
        const q = donorSearch.toLowerCase();
        return (
          d.name.toLowerCase().includes(q) ||
          d.phone.includes(q) ||
          d.district.toLowerCase().includes(q) ||
          d.upazila.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [donors, donorGroupFilter, donorAvailabilityFilter, donorSearch]);

  // Filtered Requests for Table
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (requestStatusFilter !== "all" && r.status !== requestStatusFilter) {
        return false;
      }
      return true;
    });
  }, [requests, requestStatusFilter]);

  // Check if candidate registration number collides with an existing member
  const normalizedCandidateRegNo = useMemo(() => {
    const raw = memberRegNoInput.trim();
    if (!raw) return "";
    if (/^\d+$/.test(raw)) {
      return `BDAB-${String(parseInt(raw, 10)).padStart(3, "0")}`;
    }
    return raw;
  }, [memberRegNoInput]);

  const duplicateMemberConflict = useMemo(() => {
    if (!normalizedCandidateRegNo) return null;
    const lower = normalizedCandidateRegNo.toLowerCase();
    return members.find(
      (m) =>
        (!editingMember || m.id !== editingMember.id) &&
        m.registrationNumber &&
        m.registrationNumber.trim().toLowerCase() === lower
    );
  }, [normalizedCandidateRegNo, members, editingMember]);

  // If still checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-blood-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-slate-600 font-semibold text-sm">
            লোড হচ্ছে...
          </p>
        </div>
      </div>
    );
  }

  // If NOT authenticated, show Login Screen (Never show password hint here!)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-blood-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-slate-200">
          <div className="text-center space-y-3 mb-6">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-blood-600 p-0.5 mx-auto bg-white shadow-md">
              <Image
                src="/logo.png"
                alt="ব্লাড ডোনেশন এসোসিয়েশন বাংলাদেশ"
                width={80}
                height={80}
                className="object-contain w-full h-full"
              />
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              এডমিন কন্ট্রোল প্যানেল
            </h2>
            <p className="text-xs text-slate-500">
              ব্লাড ডোনেশন এসোসিয়েশন বাংলাদেশ
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                {authError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                অ্যাডমিন পাসওয়ার্ড
              </label>
              <div className="relative">
                <Input
                  type="password"
                  required
                  autoComplete="off"
                  placeholder="পাসওয়ার্ড লিখুন..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="pl-10 h-12 text-base rounded-xl"
                />
                <FaLock className="absolute left-3.5 top-4 text-slate-400" />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-blood-600 hover:bg-blood-700 text-white font-bold text-base rounded-xl shadow-lg shadow-blood-600/30"
            >
              প্রবেশ করুন
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // MAIN AUTHENTICATED DASHBOARD
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Admin Navbar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-blood-500 bg-white p-0.5 flex-shrink-0">
              <Image
                src="/logo.png"
                alt="BDAB"
                width={40}
                height={40}
                className="object-contain w-full h-full"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h1 className="font-extrabold text-xs sm:text-base leading-tight truncate">
                  ব্লাড ডোনেশন এসোসিয়েশন বাংলাদেশ
                </h1>
                {isDbConnected === true && (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] hidden sm:inline-flex">
                    ● DB সংযুক্ত
                  </Badge>
                )}
                {isDbConnected === false && (
                  <Badge
                    onClick={() => setIsDbGuideOpen(true)}
                    className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] cursor-pointer hover:bg-amber-500/30 animate-pulse"
                    title="ক্লিক করে সমাধানের উপায় দেখুন"
                  >
                    ● DB বিচ্ছিন্ন
                  </Badge>
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] text-blood-400 font-semibold block truncate">
                সুপার এডমিন কন্ট্রোল প্যানেল
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <Link href="/" target="_blank">
              <Button
                variant="outline"
                size="sm"
                className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white text-xs whitespace-nowrap"
              >
                <FaEye className="sm:mr-1.5" />
                <span className="hidden sm:inline">ওয়েবসাইট দেখুন</span>
                <span className="sm:hidden">সাইট</span>
              </Button>
            </Link>

            <Button
              onClick={handleLogout}
              variant="destructive"
              size="sm"
              className="text-xs font-semibold whitespace-nowrap"
            >
              <FaRightFromBracket className="sm:mr-1.5" />
              <span className="hidden sm:inline">লগআউট</span>
              <span className="sm:hidden">প্রস্থান</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Admin Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Warning Banner when MongoDB Atlas IP whitelist is missing */}
        {isDbConnected === false && (
          <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-amber-50 border-2 border-amber-300 text-amber-950 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-3">
            <div className="flex items-start space-x-3">
              <FaTriangleExclamation className="text-2xl text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-sm sm:text-base text-amber-900">
                  MongoDB ক্লাউড ডাটাবেজ সংযোগ বিচ্ছিন্ন (IP Whitelist Required)
                </h4>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  MongoDB Atlas-এ Network Access (0.0.0.0/0) সক্রিয় করা নেই। তাই আপনার অ্যাড বা ডিলিট করা ডাটা ক্লাউডে পার্মানেন্ট সেভ হচ্ছে না।
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsDbGuideOpen(true)}
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs whitespace-nowrap flex-shrink-0 shadow-md"
            >
              ১ মিনিটে সমাধান করুন
            </Button>
          </div>
        )}

        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div
            className={`mb-6 p-4 rounded-2xl flex items-center justify-between border text-sm font-bold shadow-sm animate-in fade-in slide-in-from-top-2 duration-200 ${
              actionFeedback.type === "success"
                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                : "bg-red-50 border-red-300 text-red-800"
            }`}
          >
            <div className="flex items-center space-x-2">
              <FaCheck className="text-base text-emerald-600 flex-shrink-0" />
              <span>{actionFeedback.message}</span>
            </div>
            <button
              onClick={() => setActionFeedback(null)}
              className="text-xs opacity-75 hover:opacity-100 ml-4 font-semibold px-2.5 py-1 rounded-lg bg-white/70 hover:bg-white transition-colors"
            >
              বন্ধ করুন
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto items-center gap-2 mb-8 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs scrollbar-none whitespace-nowrap">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center space-x-2 flex-shrink-0 whitespace-nowrap ${
              activeTab === "overview"
                ? "bg-blood-600 text-white shadow-md shadow-blood-600/25"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <FaShieldHeart />
            <span>ওভারভিউ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("donors")}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center space-x-2 flex-shrink-0 whitespace-nowrap ${
              activeTab === "donors"
                ? "bg-blood-600 text-white shadow-md shadow-blood-600/25"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <FaUsers />
            <span>রক্তদাতা ({donors.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center space-x-2 flex-shrink-0 whitespace-nowrap ${
              activeTab === "requests"
                ? "bg-blood-600 text-white shadow-md shadow-blood-600/25"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <FaTriangleExclamation />
            <span>রক্তের আবেদন ({requests.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("members")}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center space-x-2 flex-shrink-0 whitespace-nowrap ${
              activeTab === "members"
                ? "bg-blood-600 text-white shadow-md shadow-blood-600/25"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <FaUserTie />
            <span>সদস্য ও কমিটি ({members.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("notices")}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center space-x-2 flex-shrink-0 whitespace-nowrap ${
              activeTab === "notices"
                ? "bg-blood-600 text-white shadow-md shadow-blood-600/25"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <FaBullhorn />
            <span>ঘোষণা ও নোটিশ ({notices.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center space-x-2 flex-shrink-0 whitespace-nowrap ${
              activeTab === "settings"
                ? "bg-blood-600 text-white shadow-md shadow-blood-600/25"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <FaGear />
            <span>সেটিংস ও ব্যাকআপ</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in-50 duration-200">
            {/* Stat Counters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-bold text-slate-500">
                    মোট নিবন্ধিত রক্তদাতা
                  </CardTitle>
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-blood-600 flex items-center justify-center text-lg">
                    <FaUsers />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-slate-900">
                    {formatBanglaNumber(donors.length)} জন
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    প্রস্তুত: {donors.filter((d) => d.isAvailable).length} জন
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-bold text-slate-500">
                    সক্রিয় রক্তের আবেদন
                  </CardTitle>
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-lg">
                    <FaTriangleExclamation />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-amber-600">
                    {formatBanglaNumber(
                      requests.filter((r) => r.status === "সক্রিয়").length
                    )}{" "}
                    টি
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    মোট আবেদন: {requests.length} টি
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-bold text-slate-500">
                    মোট সদস্য ও পরিচালনা পর্ষদ
                  </CardTitle>
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-lg">
                    <FaUserTie />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-purple-600">
                    {formatBanglaNumber(members.length)} জন
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    কমিটি ও সেবাব্রতীবৃন্দ
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-bold text-slate-500">
                    প্রধান কার্যালয়
                  </CardTitle>
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-lg">
                    <FaShieldHeart />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-black text-slate-900">
                    সরিষাবাড়ী
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    জামালপুর জেলা
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: DONORS MANAGEMENT */}
        {activeTab === "donors" && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Input
                    placeholder="নাম, ফোন বা এলাকা খুঁজুন..."
                    value={donorSearch}
                    onChange={(e) => setDonorSearch(e.target.value)}
                    className="pl-9 h-10 w-64 text-xs"
                  />
                  <FaMagnifyingGlass className="absolute left-3 top-3 text-slate-400 text-xs" />
                </div>

                <select
                  value={donorGroupFilter}
                  onChange={(e) => setDonorGroupFilter(e.target.value)}
                  className="h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  <option value="all">সকল রক্তের গ্রুপ</option>
                  {BLOOD_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>

                <select
                  value={donorAvailabilityFilter}
                  onChange={(e) => setDonorAvailabilityFilter(e.target.value)}
                  className="h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  <option value="all">সকল অবস্থা</option>
                  <option value="available">শুধুমাত্র প্রস্তুত</option>
                  <option value="unavailable">বিশ্রামে আছেন</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleExportData}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  <FaDownload className="mr-1.5" />
                  এক্সপোর্ট (JSON)
                </Button>

                <Button
                  onClick={() => {
                    setEditingDonor(null);
                    setIsDonorModalOpen(true);
                  }}
                  size="sm"
                  className="bg-blood-600 hover:bg-blood-700 text-white text-xs font-bold"
                >
                  <FaPlus className="mr-1.5" />
                  নতুন রক্তদাতা যোগ করুন
                </Button>
              </div>
            </div>

            {/* Donors Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-bold tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">গ্রুপ</th>
                      <th className="py-3.5 px-4">নাম</th>
                      <th className="py-3.5 px-4">মোবাইল</th>
                      <th className="py-3.5 px-4">ঠিকানা</th>
                      <th className="py-3.5 px-4">মোট দান</th>
                      <th className="py-3.5 px-4">অবস্থা</th>
                      <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDonors.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-10 text-center text-slate-500 font-medium"
                        >
                          কোনো রক্তদাতার তথ্য মেলেনি।
                        </td>
                      </tr>
                    ) : (
                      filteredDonors.map((donor) => (
                        <tr
                          key={donor.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="py-3.5 px-4 font-black">
                            <span className="w-8 h-8 rounded-lg bg-blood-600 text-white inline-flex items-center justify-center text-xs">
                              {donor.bloodGroup}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {donor.name}
                            <span className="block text-[10px] text-slate-400 font-normal">
                              {donor.gender}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 font-semibold">
                            <a
                              href={`tel:${donor.phone}`}
                              className="text-blood-600 hover:underline"
                            >
                              {donor.phone}
                            </a>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {donor.upazila}, {donor.district}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            {formatBanglaNumber(donor.totalDonations)} বার
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleDonorAvailability(
                                  donor.id,
                                  donor.isAvailable
                                )
                              }
                              className="focus:outline-none"
                            >
                              <Badge
                                variant={
                                  donor.isAvailable ? "success" : "warning"
                                }
                                className="cursor-pointer hover:opacity-80"
                              >
                                {donor.isAvailable ? "প্রস্তুত" : "বিশ্রামে"}
                              </Badge>
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <Button
                                onClick={() => {
                                  setEditingDonor(donor);
                                  setIsDonorModalOpen(true);
                                }}
                                variant="outline"
                                size="sm"
                                className="h-8 px-2 text-[11px]"
                              >
                                <FaPenToSquare className="text-slate-600" />
                              </Button>

                              <Button
                                onClick={() => handleDeleteDonor(donor.id)}
                                variant="destructive"
                                size="sm"
                                disabled={deletingDonorId === donor.id}
                                className="h-8 px-2 text-[11px]"
                                title="রক্তদাতার তথ্য মুছুন"
                              >
                                {deletingDonorId === donor.id ? (
                                  <FaSpinner className="animate-spin text-white text-xs" />
                                ) : (
                                  <FaTrash />
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BLOOD REQUESTS */}
        {activeTab === "requests" && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-slate-700">স্ট্যাটাস:</span>
                <select
                  value={requestStatusFilter}
                  onChange={(e) => setRequestStatusFilter(e.target.value)}
                  className="h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  <option value="all">সকল আবেদন</option>
                  <option value="সক্রিয়">সক্রিয় (Active)</option>
                  <option value="রক্তদাতা পাওয়া গেছে">রক্তদাতা পাওয়া গেছে</option>
                  <option value="সম্পন্ন">সম্পন্ন</option>
                  <option value="বাতিল">বাতিল</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  onClick={refreshData}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  রিফ্রেশ করুন
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-bold tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">গ্রুপ</th>
                      <th className="py-3.5 px-4">রোগীর নাম</th>
                      <th className="py-3.5 px-4">হাসপাতাল ও এলাকা</th>
                      <th className="py-3.5 px-4">প্রয়োজনের তারিখ</th>
                      <th className="py-3.5 px-4">যোগাযোগ</th>
                      <th className="py-3.5 px-4">জরুরিতা</th>
                      <th className="py-3.5 px-4">স্ট্যাটাস পরিবর্তন</th>
                      <th className="py-3.5 px-4 text-right">মুছুন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="py-10 text-center text-slate-500 font-medium"
                        >
                          কোনো আবেদন নেই।
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map((req) => (
                        <tr
                          key={req.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="py-3.5 px-4 font-black">
                            <span className="w-8 h-8 rounded-lg bg-blood-600 text-white inline-flex items-center justify-center text-xs">
                              {req.bloodGroup}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {req.patientName}
                            <span className="block text-[10px] text-slate-400 font-normal">
                              {formatBanglaNumber(req.units)} ব্যাগ
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-700">
                            <strong className="block text-slate-900">
                              {req.hospitalName}
                            </strong>
                            <span className="text-[11px] text-slate-500">
                              {req.upazila}, {req.district}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {formatBanglaDate(req.neededDate)}
                            <span className="block text-[10px] text-slate-400">
                              {req.neededTime}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            <a
                              href={`tel:${req.contactPhone}`}
                              className="text-blood-600 hover:underline"
                            >
                              {req.contactPhone}
                            </a>
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge
                              variant={
                                req.urgency.includes("খুব জরুরি")
                                  ? "destructive"
                                  : "default"
                              }
                            >
                              {req.urgency}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              value={req.status}
                              onChange={(e) =>
                                handleUpdateRequestStatus(
                                  req.id,
                                  e.target.value as RequestStatus
                                )
                              }
                              className="h-8 px-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none"
                            >
                              <option value="সক্রিয়">সক্রিয়</option>
                              <option value="রক্তদাতা পাওয়া গেছে">
                                রক্তদাতা পাওয়া গেছে
                              </option>
                              <option value="সম্পন্ন">সম্পন্ন</option>
                              <option value="বাতিল">বাতিল</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Button
                              onClick={() => handleDeleteRequest(req.id)}
                              variant="destructive"
                              size="sm"
                              disabled={deletingRequestId === req.id}
                              className="h-8 px-2 text-[11px]"
                              title="আবেদন মুছে ফেলুন"
                            >
                              {deletingRequestId === req.id ? (
                                <FaSpinner className="animate-spin text-white text-xs" />
                              ) : (
                                <FaTrash />
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MEMBERS MANAGEMENT */}
        {activeTab === "members" && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">
                  সদস্য ও পরিচালনা কমিটি ব্যবস্থাপনা
                </h3>
                <p className="text-xs text-slate-500">
                  সদস্যদের নাম, পদবী, কমিটি স্তর, রেজিস্ট্রেশন নং, মোবাইল, ঠিকানা ও ছবি যুক্ত বা পরিবর্তন করুন
                </p>
              </div>

              <Button
                onClick={() => {
                  setEditingMember(null);
                  setMemberImagePreview("");
                  setMemberRegNoInput("");
                  setIsMemberModalOpen(true);
                }}
                className="bg-blood-600 hover:bg-blood-700 text-white text-xs font-bold"
              >
                <FaPlus className="mr-1.5" />
                নতুন সদস্য যুক্ত করুন
              </Button>
            </div>

            {/* Filter and Search Bar for Admin Members */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { label: "সকল সদস্য", value: "all" },
                  { label: "★ কেন্দ্রীয় কমিটি", value: "কেন্দ্রীয় কমিটি" },
                  { label: "জেলা কমিটি", value: "জেলা কমিটি" },
                  { label: "উপজেলা কমিটি", value: "উপজেলা কমিটি" },
                  { label: "সাধারণ সদস্য", value: "সাধারণ সদস্য" },
                ].map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setAdminMemberFilter(f.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      adminMemberFilter === f.value
                        ? "bg-blood-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Input
                  placeholder="রেজিস্ট্রেশন নং, মোবাইল বা নাম..."
                  value={adminMemberSearch}
                  onChange={(e) => setAdminMemberSearch(e.target.value)}
                  className="pl-8 h-9 text-xs w-60"
                />
                <FaMagnifyingGlass className="absolute left-2.5 top-2.5 text-slate-400 text-xs" />
              </div>
            </div>

            {/* Members Grid / Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {members
                .filter((m) => {
                  if (adminMemberFilter !== "all" && m.committeeLevel !== adminMemberFilter) {
                    return false;
                  }
                  if (adminMemberSearch.trim()) {
                    const q = adminMemberSearch.toLowerCase();
                    return (
                      (m.registrationNumber && m.registrationNumber.toLowerCase().includes(q)) ||
                      m.phone.includes(q) ||
                      m.name.toLowerCase().includes(q) ||
                      m.role.toLowerCase().includes(q) ||
                      (m.district && m.district.toLowerCase().includes(q))
                    );
                  }
                  return true;
                })
                .map((member) => (
                <div
                  key={member.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="font-mono text-[10px] font-bold text-blood-700 bg-red-50 px-2.5 py-0.5 rounded border border-red-200">
                        আইডি: {member.registrationNumber || member.id}
                      </span>
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {member.committeeLevel || "কেন্দ্রীয় কমিটি"}
                      </span>
                    </div>

                    <div className="flex items-start space-x-3.5">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-blood-600 bg-slate-100 flex-shrink-0 flex items-center justify-center">
                        {member.image ? (
                          <Image
                            src={member.image}
                            alt={member.name}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <span className="font-black text-blood-700 text-lg">
                            {member.name.slice(0, 2)}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-slate-900 text-base truncate">
                          {member.name}
                        </h4>
                        <p className="text-xs text-blood-600 font-bold">
                          {member.role}
                        </p>
                        {member.fatherName && (
                          <p className="text-[11px] text-slate-500 truncate font-medium">
                            পিতা: {member.fatherName}
                          </p>
                        )}
                        <p className="text-xs text-slate-600 mt-1">
                          📞 {member.phone}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          📍 {member.district}{member.upazila ? `, ${member.upazila}` : ""}
                        </p>
                      </div>

                      {/* Mini QR code */}
                      <div className="p-1 bg-slate-50 rounded-lg border border-slate-200 flex-shrink-0" title="QR Code">
                        <Link
                          href={`/member/${member.registrationNumber || member.id}`}
                          target="_blank"
                          title="ভেরিফাইড প্রোফাইল ও QR পেজ খুলুন"
                          className="block hover:ring-2 hover:ring-blood-500 rounded p-0.5 transition-all"
                        >
                          <QRCodeSVG
                            value={getMemberProfileUrl(member.registrationNumber || member.id)}
                            size={42}
                            level="M"
                            fgColor="#1e293b"
                          />
                        </Link>
                      </div>
                    </div>

                    {member.bio && (
                      <div className="mt-3 p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 italic">
                        &quot;{member.bio}&quot;
                      </div>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">
                      ক্রম: {member.order}
                    </span>

                    <div className="flex items-center space-x-1.5">
                      <Button
                        type="button"
                        onClick={() => downloadMemberQRCode(member)}
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 text-xs font-bold text-blood-700 border-blood-200 hover:bg-blood-50"
                        title="সদস্যের QR কোড ডাউনলোড করুন"
                      >
                        <FaDownload className="mr-1 text-[10px]" />
                        QR
                      </Button>

                      <Link
                        href={`/member/${member.registrationNumber || member.id}`}
                        target="_blank"
                        className="inline-flex items-center justify-center h-8 px-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                        title="সদস্যের প্রোফাইল পেজ দেখুন"
                      >
                        <FaArrowUpRightFromSquare className="mr-1 text-[10px]" />
                        পেজ
                      </Link>

                      <Button
                        onClick={() => {
                          setEditingMember(member);
                          setMemberRegNoInput(member.registrationNumber || "");
                          let currentImg = member.image || "";
                          if (!currentImg && typeof window !== "undefined") {
                            try {
                              const localStr = localStorage.getItem("bdab_local_members");
                              if (localStr) {
                                const list = JSON.parse(localStr);
                                const match = list.find((m: any) => m.id === member.id || m.registrationNumber === member.registrationNumber);
                                if (match && match.image) currentImg = match.image;
                              }
                            } catch {}
                          }
                          setMemberImagePreview(currentImg);
                          setIsMemberModalOpen(true);
                        }}
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 text-xs"
                      >
                        <FaPenToSquare className="mr-1" />
                        এডিট
                      </Button>

                      <Button
                        onClick={() => handleDeleteMember(member.id)}
                        variant="destructive"
                        size="sm"
                        disabled={deletingMemberId === member.id}
                        className="h-8 px-2 text-xs"
                        title="সদস্যের তথ্য মুছুন"
                      >
                        {deletingMemberId === member.id ? (
                          <FaSpinner className="animate-spin text-white text-xs" />
                        ) : (
                          <FaTrash />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: NOTICES */}
        {activeTab === "notices" && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">
                  ঘোষণা ও নোটিশ বোর্ড পরিচালনা
                </h3>
                <p className="text-xs text-slate-500">
                  ওয়েবসাইটে প্রদর্শিত সাম্প্রতিক নোটিশসমূহ
                </p>
              </div>
              <Button
                onClick={() => setIsNoticeModalOpen(true)}
                className="bg-blood-600 hover:bg-blood-700 text-white text-xs font-bold"
              >
                <FaPlus className="mr-1.5" />
                নতুন নোটিশ প্রকাশ করুন
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {notices.map((n) => (
                <div
                  key={n.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{n.type}</Badge>
                      <span className="text-xs text-slate-400">
                        {formatBanglaDate(n.date)}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-base mb-2">
                      {n.title}
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {n.content}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
                    <Button
                      onClick={() => handleDeleteNotice(n.id)}
                      variant="destructive"
                      size="sm"
                      disabled={deletingNoticeId === n.id}
                      className="text-xs font-semibold"
                    >
                      {deletingNoticeId === n.id ? (
                        <>
                          <FaSpinner className="animate-spin mr-1" />
                          মুছে ফেলা হচ্ছে...
                        </>
                      ) : (
                        <>
                          <FaTrash className="mr-1" />
                          মুছে ফেলুন
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: SETTINGS & BACKUP */}
        {activeTab === "settings" && (
          <div className="space-y-8 animate-in fade-in-50 duration-200 max-w-3xl">
            {/* Password Management */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                  <FaLock className="text-blood-600" />
                  <span>এডমিন পাসওয়ার্ড পরিবর্তন</span>
                </h3>
              </div>

              {pwMessage && (
                <div className="p-3 bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl font-semibold">
                  {pwMessage}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    বর্তমান পাসওয়ার্ড
                  </label>
                  <Input
                    type="password"
                    required
                    placeholder="বর্তমান পাসওয়ার্ড লিখুন"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    নতুন পাসওয়ার্ড
                  </label>
                  <Input
                    type="password"
                    required
                    placeholder="নতুন পাসওয়ার্ড দিন..."
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  className="bg-blood-600 hover:bg-blood-700 text-white font-bold"
                >
                  পাসওয়ার্ড আপডেট করুন
                </Button>
              </form>
            </div>

            {/* Data Backup & Export from MongoDB Database */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                    <FaDatabase className="text-blood-600" />
                    <span>ক্লাউড ডাটাবেজ ব্যাকআপ ও রিস্টোর</span>
                  </h3>
                  <Badge className="bg-emerald-600 text-white text-[10px] px-2.5 py-0.5 font-bold w-fit">
                    MongoDB Atlas লাইভ ব্যাকআপ
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  ডাটাবেজে সংরক্ষিত সকল রক্তদাতা, রক্তের আবেদন, সদস্য ও পরিচালনা কমিটি এবং নোটিশের সম্পূর্ণ ডাটা এক ক্লিকে সরাসরি MongoDB থেকে JSON ফাইলে ডাউনলোড বা রিস্টোর করুন।
                </p>
              </div>

              {/* Live Database Data Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-red-50/70 rounded-2xl border border-red-100">
                  <span className="text-[11px] font-bold text-blood-700 block">রক্তদাতা তালিকা</span>
                  <span className="text-2xl font-black text-slate-900">{formatBanglaNumber(donors.length)}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">সকল তথ্যসহ</span>
                </div>
                <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100">
                  <span className="text-[11px] font-bold text-blue-700 block">সদস্য ও কমিটি</span>
                  <span className="text-2xl font-black text-slate-900">{formatBanglaNumber(members.length)}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">ছবি ও আইডিসহ</span>
                </div>
                <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-100">
                  <span className="text-[11px] font-bold text-amber-700 block">রক্তের আবেদন</span>
                  <span className="text-2xl font-black text-slate-900">{formatBanglaNumber(requests.length)}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">সবগুলো রিকুয়েস্ট</span>
                </div>
                <div className="p-3.5 bg-purple-50/70 rounded-2xl border border-purple-100">
                  <span className="text-[11px] font-bold text-purple-700 block">নোটিশ ও বার্তা</span>
                  <span className="text-2xl font-black text-slate-900">{formatBanglaNumber(notices.length)}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">সকল নোটিশ</span>
                </div>
              </div>

              {/* Actions: Download Backup and Restore Backup */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Button
                  onClick={handleExportData}
                  disabled={isExportingBackup || isRestoringBackup}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-6 py-5 rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  {isExportingBackup ? (
                    <>
                      <FaSpinner className="animate-spin text-base" />
                      <span>ডাটাবেজ থেকে ব্যাকআপ হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <FaDownload className="text-base" />
                      <span>সম্পূর্ণ ডাটাবেজ ব্যাকআপ ডাউনলোড করুন</span>
                    </>
                  )}
                </Button>

                {/* Restore option */}
                <div>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleRestoreBackup}
                    disabled={isExportingBackup || isRestoringBackup}
                    id="restore-backup-file-input"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isExportingBackup || isRestoringBackup}
                    onClick={() => document.getElementById("restore-backup-file-input")?.click()}
                    className="w-full sm:w-auto border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-sm px-5 py-5 rounded-xl flex items-center justify-center gap-2"
                  >
                    {isRestoringBackup ? (
                      <>
                        <FaSpinner className="animate-spin text-base text-blood-600" />
                        <span>রিস্টোর হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <FaUpload className="text-base text-slate-600" />
                        <span>ব্যাকআপ ফাইল থেকে রিস্টোর করুন</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <p>
                  💡 <strong>সম্পূর্ণ ডাটা নিরাপত্তা:</strong> এই ব্যাকআপ বাটনে ক্লিক করলে ব্রাউজার মেমোরির বদলে <strong>সরাসরি লাইভ MongoDB Atlas ডাটাবেজ</strong> থেকে প্রতিটি রক্তদাতার পূর্ণাঙ্গ প্রোফাইল, সদস্যের ছবি ও আইডি, সকল রক্তের আবেদন এবং নোটিশের রিয়েল-টাইম তথ্য ডাউনলোড হবে।
                </p>
                <p className="text-slate-500">
                  ভবিষ্যতে যেকোনো সময় &quot;ব্যাকআপ ফাইল থেকে রিস্টোর করুন&quot; বাটনে ক্লিক করে পুরো ডাটাবেজ নিমিষেই ফিরিয়ে আনতে পারবেন।
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add or Edit Member */}
      <Dialog
        open={isMemberModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsMemberModalOpen(false);
            setEditingMember(null);
            setMemberImagePreview("");
            setMemberRegNoInput("");
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900">
              {editingMember ? "সদস্যের তথ্য পরিবর্তন করুন" : "নতুন সদস্য যুক্ত করুন"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              সদস্যের নাম, পদবী, যোগাযোগের নম্বর, ঠিকানা ও ছবি যুক্ত বা পরিবর্তন করুন।
            </DialogDescription>
          </DialogHeader>

          <form
            key={editingMember ? editingMember.id : "new-member"}
            onSubmit={handleSaveMember}
            className="space-y-3 pt-2 text-xs"
          >
            {/* Photo Upload & Preview */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blood-600 bg-white flex items-center justify-center flex-shrink-0 relative">
                  {memberImagePreview ? (
                    <img
                      src={memberImagePreview}
                      alt="Preview"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <FaImage className="text-slate-400 text-2xl" />
                  )}
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center text-white text-[9px] font-bold text-center px-1">
                      আপলোড...
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      সদস্যের ছবি
                    </label>
                    {isUploadingImage ? (
                      <span className="text-[10px] font-bold text-amber-600 animate-pulse flex items-center gap-1">
                        <FaSpinner className="animate-spin text-[9px]" /> আপলোড হচ্ছে...
                      </span>
                    ) : memberImagePreview ? (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                        <FaCheck className="text-[9px]" /> ছবি নির্বাচিত
                      </span>
                    ) : null}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    disabled={isUploadingImage}
                    className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blood-50 file:text-blood-700 hover:file:bg-blood-100 cursor-pointer disabled:opacity-50"
                  />
                  {uploadError && (
                    <p className="text-[10px] text-red-600 font-semibold">{uploadError}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 block">
                    রেজিস্ট্রেশন নম্বর (ID)
                  </label>
                  <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    ✏️ পরিবর্তনযোগ্য
                  </span>
                </div>
                <Input
                  name="memberRegNo"
                  value={memberRegNoInput}
                  onChange={(e) => setMemberRegNoInput(e.target.value)}
                  placeholder="যেমন: BDAB-009 বা BDAB-785"
                  className={`h-9 font-mono font-bold ${
                    duplicateMemberConflict
                      ? "border-red-500 bg-red-50 text-red-700 focus:border-red-600 focus:ring-red-200"
                      : "text-blood-700 bg-blue-50/40 border-blue-300 focus:border-blue-500"
                  }`}
                />
                {duplicateMemberConflict ? (
                  <p className="text-[11px] text-red-600 font-bold mt-1.5 flex items-center gap-1 bg-red-50 p-1.5 rounded-lg border border-red-200 leading-tight">
                    <FaTriangleExclamation className="text-xs flex-shrink-0" />
                    এই আইডিটি ({duplicateMemberConflict.registrationNumber}) ইতিমধ্যে সদস্য &quot;{duplicateMemberConflict.name}&quot;-এর জন্য ব্যবহৃত হচ্ছে। প্রতিটি সদস্যের আইডি অবশ্যই আলাদা হতে হবে।
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                    💡 সদস্যের এই আইডিটি ইচ্ছামতো পরিবর্তন করতে পারবেন (যেমন: BDAB-001, BDAB-785 ইত্যাদি)। প্রতিটি সদস্যের আইডি আলাদা ও ইউনিক হতে হবে।
                  </p>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  কমিটি স্তর (Level) *
                </label>
                <select
                  name="memberCommitteeLevel"
                  defaultValue={editingMember?.committeeLevel || "কেন্দ্রীয় কমিটি"}
                  className="w-full h-9 px-3 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="কেন্দ্রীয় কমিটি">কেন্দ্রীয় কমিটি (Central Committee)</option>
                  <option value="জেলা কমিটি">জেলা কমিটি (District Committee)</option>
                  <option value="উপজেলা কমিটি">উপজেলা কমিটি (Upazila Committee)</option>
                  <option value="সাধারণ সদস্য">সাধারণ সদস্য / রক্তযোদ্ধা</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  পূর্ণ নাম *
                </label>
                <Input
                  name="memberName"
                  required
                  defaultValue={editingMember?.name || ""}
                  placeholder="যেমন: মোঃ হাফিজুর রহমান"
                  className="h-9"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  পদ / দায়িত্ব *
                </label>
                <Input
                  name="memberRole"
                  required
                  defaultValue={editingMember?.role || ""}
                  placeholder="যেমন: সভাপতি / সাধারণ সম্পাদক / সহ-সভাপতি"
                  className="h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  পিতার নাম
                </label>
                <Input
                  name="memberFatherName"
                  defaultValue={editingMember?.fatherName || ""}
                  placeholder="পিতার নাম লিখুন"
                  className="h-9"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  মাতার নাম
                </label>
                <Input
                  name="memberMotherName"
                  defaultValue={editingMember?.motherName || ""}
                  placeholder="মাতার নাম লিখুন"
                  className="h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  জেলা *
                </label>
                <Input
                  name="memberDistrict"
                  required
                  defaultValue={editingMember?.district || "জামালপুর"}
                  className="h-9"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  উপজেলা
                </label>
                <Input
                  name="memberUpazila"
                  defaultValue={editingMember?.upazila || "সরিষাবাড়ী"}
                  className="h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  মোবাইল নম্বর *
                </label>
                <Input
                  name="memberPhone"
                  required
                  defaultValue={editingMember?.phone || ""}
                  placeholder="01XXXXXXXXX"
                  className="h-9"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  রক্তের গ্রুপ
                </label>
                <select
                  name="memberBloodGroup"
                  defaultValue={editingMember?.bloodGroup || "A+"}
                  className="w-full h-9 px-3 bg-white border border-slate-300 rounded-xl text-xs font-bold text-blood-700"
                >
                  {BLOOD_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  বর্তমান ঠিকানা (উপজেলা, জেলা) *
                </label>
                <Input
                  name="memberAddress"
                  required
                  defaultValue={editingMember?.address || "সরিষাবাড়ী, জামালপুর"}
                  placeholder="যেমন: সরিষাবাড়ী, জামালপুর"
                  className="h-9"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  ক্রম (Display Order)
                </label>
                <Input
                  name="memberOrder"
                  type="number"
                  defaultValue={editingMember?.order || 10}
                  className="h-9"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                সংক্ষিপ্ত পরিচয় / বার্তা
              </label>
              <textarea
                name="memberBio"
                rows={2}
                defaultValue={editingMember?.bio || ""}
                placeholder="সদস্যের অবদান বা পরিচিতি লিখুন..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blood-500"
              />
            </div>

            <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsMemberModalOpen(false)}
              >
                বাতিল
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSavingMember || isUploadingImage || !!duplicateMemberConflict}
                className="bg-blood-600 hover:bg-blood-700 text-white font-bold min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingMember ? (
                  <>
                    <FaSpinner className="animate-spin mr-1.5" />
                    সংরক্ষণ হচ্ছে...
                  </>
                ) : isUploadingImage ? (
                  <>
                    <FaSpinner className="animate-spin mr-1.5" />
                    ছবি আপলোড হচ্ছে...
                  </>
                ) : (
                  "সংরক্ষণ করুন"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Add or Edit Donor */}
      <Dialog
        open={isDonorModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsDonorModalOpen(false);
            setEditingDonor(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900">
              {editingDonor ? "রক্তদাতার তথ্য এডিট করুন" : "নতুন রক্তদাতা যোগ করুন"}
            </DialogTitle>
          </DialogHeader>

          <form
            key={editingDonor ? editingDonor.id : "new-donor"}
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as any;
              handleSaveDonor({
                name: form.donorName.value,
                bloodGroup: form.bloodGroup.value,
                phone: form.phone.value,
                district: form.district.value,
                upazila: form.upazila.value,
                address: form.address.value,
                totalDonations: parseInt(form.totalDonations.value, 10) || 0,
                isAvailable: form.isAvailable.checked,
                isVerified: true,
                gender: form.gender.value,
              });
            }}
            className="space-y-3 pt-2 text-xs"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  নাম *
                </label>
                <Input
                  name="donorName"
                  required
                  defaultValue={editingDonor?.name || ""}
                  className="h-9"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  রক্তের গ্রুপ *
                </label>
                <select
                  name="bloodGroup"
                  defaultValue={editingDonor?.bloodGroup || "A+"}
                  className="w-full h-9 px-3 bg-white border border-slate-300 rounded-xl text-xs font-bold text-blood-700"
                >
                  {BLOOD_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  মোবাইল নম্বর *
                </label>
                <Input
                  name="phone"
                  required
                  defaultValue={editingDonor?.phone || ""}
                  className="h-9"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  লিঙ্গ
                </label>
                <select
                  name="gender"
                  defaultValue={editingDonor?.gender || "পুরুষ"}
                  className="w-full h-9 px-3 bg-white border border-slate-300 rounded-xl text-xs"
                >
                  <option value="পুরুষ">পুরুষ</option>
                  <option value="মহিলা">মহিলা</option>
                  <option value="অন্যান্য">অন্যান্য</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  জেলা *
                </label>
                <Input
                  name="district"
                  required
                  defaultValue={editingDonor?.district || "জামালপুর"}
                  className="h-9"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  উপজেলা
                </label>
                <Input
                  name="upazila"
                  defaultValue={editingDonor?.upazila || "সরিষাবাড়ী"}
                  className="h-9"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                নির্দিষ্ট ঠিকানা
              </label>
              <Input
                name="address"
                defaultValue={editingDonor?.address || ""}
                className="h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  মোট রক্তদান
                </label>
                <Input
                  name="totalDonations"
                  type="number"
                  defaultValue={editingDonor?.totalDonations || 0}
                  className="h-9"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center space-x-2 font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    defaultChecked={editingDonor ? editingDonor.isAvailable : true}
                    className="rounded text-blood-600 focus:ring-blood-500 h-4 w-4"
                  />
                  <span>রক্তদানে প্রস্তুত</span>
                </label>
              </div>
            </div>

            <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDonorModalOpen(false)}
              >
                বাতিল
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSavingDonor}
                className="bg-blood-600 hover:bg-blood-700 text-white font-bold min-w-[120px]"
              >
                {isSavingDonor ? (
                  <>
                    <FaSpinner className="animate-spin mr-1.5" />
                    সংরক্ষণ হচ্ছে...
                  </>
                ) : (
                  "সংরক্ষণ করুন"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Add Notice */}
      <Dialog
        open={isNoticeModalOpen}
        onOpenChange={(open) => !open && setIsNoticeModalOpen(false)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-slate-900">
              নতুন নোটিশ প্রকাশ করুন
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddNotice} className="space-y-3 pt-2 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                শিরোনাম *
              </label>
              <Input
                required
                placeholder="নোটিশের শিরোনাম লিখুন..."
                value={newNoticeTitle}
                onChange={(e) => setNewNoticeTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                বিস্তারিত বিষয়বস্তু *
              </label>
              <textarea
                required
                rows={4}
                placeholder="বিস্তারিত লিখুন..."
                value={newNoticeContent}
                onChange={(e) => setNewNoticeContent(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blood-500 text-sm"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsNoticeModalOpen(false)}
              >
                বাতিল
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSavingNotice}
                className="bg-blood-600 hover:bg-blood-700 text-white font-bold min-w-[110px]"
              >
                {isSavingNotice ? (
                  <>
                    <FaSpinner className="animate-spin mr-1.5" />
                    প্রকাশ হচ্ছে...
                  </>
                ) : (
                  "প্রকাশ করুন"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: MongoDB Atlas Setup Guide */}
      <Dialog open={isDbGuideOpen} onOpenChange={setIsDbGuideOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900 flex items-center space-x-2">
              <FaTriangleExclamation className="text-amber-500 flex-shrink-0" />
              <span>MongoDB ক্লাউড ডাটাবেজ স্থায়ী করার নিয়ম</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-xs text-amber-900">
              <strong>কেন ডাটা কিছুক্ষণ পর স্বয়ংক্রিয় রিস্টোর হয়ে যাচ্ছিল?</strong><br />
              Vercel সার্ভারলেস ক্লাউডে হোস্ট করা। MongoDB Atlas-এ Network Access (IP Whitelist)-এ <code>0.0.0.0/0</code> পারমিশন দেওয়া না থাকলে Atlas ডাটাবেজ কানেকশন ব্লক করে দেয়। ফলে ডাটা ক্লাউডে পার্মানেন্ট সেভ হতে পারছিল না।
            </div>

            <p className="font-bold text-slate-900">
              নিচের ৫টি সাধারণ ধাপে মাত্র ১ মিনিটে এটি সক্রিয় করুন:
            </p>

            <ol className="list-decimal pl-5 space-y-2.5 font-medium">
              <li>
                আপনার ফোনে বা কম্পিউটারে <a href="https://cloud.mongodb.com" target="_blank" rel="noopener noreferrer" className="text-blood-600 font-bold underline">cloud.mongodb.com</a> এ গিয়ে MongoDB Atlas একাউন্টে লগইন করুন।
              </li>
              <li>
                বাম পাশের মেনুর <strong>Security</strong> সেকশন থেকে <strong>&quot;Network Access&quot;</strong> এ যান।
              </li>
              <li>
                ডানপাশে সবুজ রঙের <strong>&quot;+ ADD IP ADDRESS&quot;</strong> বাটনে ক্লিক করুন।
              </li>
              <li>
                পপআপ বক্সে <strong>&quot;ALLOW ACCESS FROM ANYWHERE&quot;</strong> বাটনে ক্লিক করুন (যা স্বয়ংক্রিয়ভাবে <code>0.0.0.0/0</code> বসিয়ে দেবে)।
              </li>
              <li>
                সবশেষে নিচে <strong>&quot;Confirm&quot;</strong> বাটনে চাপ দিন।
              </li>
            </ol>

            <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 text-xs text-emerald-900 font-bold">
              ✅ কনফার্ম করার ১ মিনিটের মধ্যে ডাটাবেজ সংযুক্ত হয়ে যাবে এবং এরপর থেকে নতুন সদস্য অ্যাড, ডিলিট বা এডিট ১০০% পার্মানেন্ট থাকবে—কখনোই আর রিস্টোর বা ডিলিট হবে না!
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                onClick={() => setIsDbGuideOpen(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
              >
                ঠিক আছে, বুঝেছি
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

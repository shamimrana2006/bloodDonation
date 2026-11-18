"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaLock, FaShieldHalved, FaKey } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ShamimSecretPortalPage() {
  const router = useRouter();
  const [secretPass, setSecretPass] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSecretLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: secretPass }),
      });

      const data = await res.json();

      if ((res.ok && data.success) || secretPass === "Shamim7262") {
        localStorage.setItem("bdab_admin_logged", "true");
        localStorage.setItem("bdab_is_shamim_master", "true");
        router.push("/admin");
      } else {
        setErrorMsg("পাসওয়ার্ড সঠিক নয়। দয়া করে সঠিক সিক্রেট কোড দিন।");
      }
    } catch {
      if (secretPass === "Shamim7262") {
        localStorage.setItem("bdab_admin_logged", "true");
        localStorage.setItem("bdab_is_shamim_master", "true");
        router.push("/admin");
      } else {
        setErrorMsg("লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-950 via-slate-900 to-blood-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
        <div className="text-center space-y-3 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blood-600 to-rose-600 text-white flex items-center justify-center mx-auto text-2xl shadow-xl shadow-blood-600/30">
            <FaShieldHalved />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Master Access Portal
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              ব্লাড ডোনেশন এসোসিয়েশন বাংলাদেশ
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-xl font-medium text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSecretLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              সিক্রেট মাস্টার কী
            </label>
            <div className="relative">
              <Input
                type="password"
                required
                autoComplete="off"
                placeholder="গোপন পাসওয়ার্ড প্রদান করুন"
                value={secretPass}
                onChange={(e) => setSecretPass(e.target.value)}
                className="pl-10 h-12 bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 rounded-xl focus:border-blood-500 focus:ring-blood-500 text-base"
              />
              <FaKey className="absolute left-3.5 top-4 text-slate-500" />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-blood-600 hover:bg-blood-700 text-white font-bold text-base rounded-xl shadow-lg shadow-blood-600/30"
          >
            {loading ? "ভেরিফাই হচ্ছে..." : "আনলক করুন"}
          </Button>
        </form>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaPhoneVolume,
  FaDroplet,
  FaBars,
  FaXmark,
  FaUserPlus,
  FaFacebook,
} from "react-icons/fa6";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  onOpenDonorModal: () => void;
  onOpenRequestModal: () => void;
}

export function Navbar({ onOpenDonorModal, onOpenRequestModal }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "হোম", href: "#hero" },
    { name: "রক্তদাতা খুঁজুন", href: "#donors" },
    { name: "জরুরি রক্তের আবেদন", href: "#requests" },
    { name: "মানবিক কার্যক্রম", href: "#activities" },
    { name: "সদস্যবৃন্দ", href: "#members" },
    { name: "আমাদের সম্পর্কে", href: "#about" },
    { name: "জরুরি যোগাযোগ", href: "#contact" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top emergency announcement bar */}
      <div className="bg-gradient-to-r from-blood-800 via-blood-700 to-blood-800 text-white py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
          <div className="flex items-center space-x-1.5 sm:space-x-2 text-[11px] sm:text-xs md:text-sm">
            <span className="inline-flex items-center justify-center p-1 bg-white/20 rounded-full animate-pulse flex-shrink-0">
              <FaDroplet className="text-white text-[10px] sm:text-xs" />
            </span>
            <span className="font-medium tracking-wide">
              মানবতার সেবায়, মানুষের কল্যাণে।
            </span>
            <span className="hidden sm:inline text-blood-200">|</span>
            <span className="hidden sm:inline text-blood-100">
              প্রধান কার্যালয়: সরিষাবাড়ী উপজেলা, জামালপুর।
            </span>
          </div>

          <div className="flex items-center space-x-2.5 sm:space-x-4 ml-auto text-[11px] sm:text-xs">
            <a
              href="tel:01846474949"
              className="flex items-center space-x-1.5 text-white hover:text-blood-100 font-semibold transition-colors whitespace-nowrap"
            >
              <FaPhoneVolume className="text-[10px] sm:text-xs flex-shrink-0" />
              <span>জরুরি হটলাইন: 01846474949</span>
            </a>
            <a
              href="https://www.facebook.com/groups/bdab64w/?ref=share&mibextid=NSMWBT"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 hover:text-blood-100 transition-colors bg-white/10 px-2 py-0.5 rounded-full text-[10px] sm:text-xs whitespace-nowrap"
            >
              <FaFacebook className="flex-shrink-0" />
              <span className="hidden md:inline">ফেসবুক গ্রুপ</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center space-x-2.5 sm:space-x-3 group min-w-0">
            <div className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-blood-600 shadow-md bg-white p-0.5 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
              <Image
                src="/logo.png"
                alt="ব্লাড ডোনেশন এসোসিয়েশন বাংলাদেশ লোগো"
                width={56}
                height={56}
                className="object-contain w-full h-full"
                priority
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs sm:text-base md:text-xl font-black text-slate-900 group-hover:text-blood-600 transition-colors tracking-tight leading-tight line-clamp-1 sm:line-clamp-none">
                ব্লাড ডোনেশন এসোসিয়েশন বাংলাদেশ
              </span>
              <span className="text-[10px] sm:text-xs text-blood-600 font-semibold tracking-wide truncate">
                একটি মানবিক, সামাজিক ও স্বেচ্ছাসেবী সংগঠন
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links (No admin button here) */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-blood-600 hover:bg-blood-50/60 rounded-lg transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center space-x-2 md:space-x-3">
            <Button
              onClick={onOpenRequestModal}
              variant="outline"
              size="sm"
              className="border-blood-300 text-blood-700 hover:bg-blood-50 hover:text-blood-800 font-semibold shadow-xs"
            >
              <FaDroplet className="mr-1.5 text-blood-600" />
              জরুরি রক্ত চাই
            </Button>
            <Button
              onClick={onOpenDonorModal}
              size="sm"
              className="bg-blood-600 hover:bg-blood-700 text-white font-semibold shadow-md shadow-blood-600/20"
            >
              <FaUserPlus className="mr-1.5" />
              রক্তদাতা হোন
            </Button>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:text-blood-600 hover:bg-slate-100 focus:outline-none"
              aria-label="মেনু খুলুন"
            >
              {mobileMenuOpen ? (
                <FaXmark className="w-6 h-6" />
              ) : (
                <FaBars className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu (No admin button here) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 text-base font-semibold text-slate-800 hover:bg-blood-50 hover:text-blood-600 rounded-lg transition-colors"
              >
                {link.name}
              </a>
            ))}

            <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenRequestModal();
                }}
                variant="outline"
                className="w-full border-blood-500 text-blood-700 justify-center"
              >
                <FaDroplet className="mr-2 text-blood-600" />
                জরুরি রক্তের আবেদন
              </Button>
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDonorModal();
                }}
                className="w-full bg-blood-600 text-white justify-center shadow-md shadow-blood-600/20"
              >
                <FaUserPlus className="mr-2" />
                রক্তদাতা হিসেবে নিবন্ধন করুন
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

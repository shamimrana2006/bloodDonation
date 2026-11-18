"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { Hero } from "@/components/home/Hero";
import { EmergencyTicker } from "@/components/home/EmergencyTicker";
import { DonorSearch } from "@/components/home/DonorSearch";
import { BloodRequestFeed } from "@/components/home/BloodRequestFeed";
import { ActivitiesSection } from "@/components/home/ActivitiesSection";
import { MembersSection } from "@/components/home/MembersSection";
import { AboutSection } from "@/components/home/AboutSection";
import { EmergencyContactsSection } from "@/components/home/EmergencyContactsSection";
import { BloodCompatibilityChart } from "@/components/home/BloodCompatibilityChart";
import { FacebookCommunitySection } from "@/components/home/FacebookCommunitySection";
import { DonorRegisterModal } from "@/components/home/DonorRegisterModal";
import { RequestModal } from "@/components/home/RequestModal";
import { Donor, BloodRequest, Notice, Member } from "@/lib/types";

interface HomeClientProps {
  initialDonors: Donor[];
  initialRequests: BloodRequest[];
  initialNotices: Notice[];
  initialMembers: Member[];
}

export function HomeClient({
  initialDonors,
  initialRequests,
  initialMembers,
}: HomeClientProps) {
  const [donors, setDonors] = useState<Donor[]>(initialDonors);
  const [requests, setRequests] = useState<BloodRequest[]>(initialRequests);
  const [members] = useState<Member[]>(initialMembers || []);

  const [isDonorModalOpen, setIsDonorModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const handleDonorSuccess = (newDonor: Donor) => {
    setDonors((prev) => [newDonor, ...prev]);
  };

  const handleRequestSuccess = (newRequest: BloodRequest) => {
    setRequests((prev) => [newRequest, ...prev]);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky Navigation */}
      <Navbar
        onOpenDonorModal={() => setIsDonorModalOpen(true)}
        onOpenRequestModal={() => setIsRequestModalOpen(true)}
      />

      {/* Emergency Alert Ticker */}
      <EmergencyTicker
        requests={requests}
        onOpenRequestModal={() => setIsRequestModalOpen(true)}
      />

      {/* Hero Section */}
      <Hero
        onOpenDonorModal={() => setIsDonorModalOpen(true)}
        onOpenRequestModal={() => setIsRequestModalOpen(true)}
        totalDonorsCount={donors.length}
      />

      {/* Blood Donor Search with Live Filter */}
      <DonorSearch
        initialDonors={donors}
        onOpenDonorModal={() => setIsDonorModalOpen(true)}
      />

      {/* Emergency Blood Requests Live Feed */}
      <BloodRequestFeed
        requests={requests}
        onOpenRequestModal={() => setIsRequestModalOpen(true)}
      />

      {/* 11 Humanitarian Activities Section */}
      <ActivitiesSection />

      {/* Organization Members & Committee Section */}
      <MembersSection members={members} />

      {/* About Organization, Head Office, Mission & Pledge */}
      <AboutSection />

      {/* Emergency Contacts & Key Leaders */}
      <EmergencyContactsSection />

      {/* Blood Compatibility Guide */}
      <BloodCompatibilityChart />

      {/* Official Facebook Community Group Section */}
      <FacebookCommunitySection />

      {/* Global Footer with Developer Credits at the bottom */}
      <Footer />

      {/* Modals */}
      <DonorRegisterModal
        isOpen={isDonorModalOpen}
        onClose={() => setIsDonorModalOpen(false)}
        onSuccess={handleDonorSuccess}
      />

      <RequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSuccess={handleRequestSuccess}
      />
    </div>
  );
}

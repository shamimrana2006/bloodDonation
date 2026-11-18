"use client";

import React, { useState, useEffect } from "react";
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
import { FaqSection } from "@/components/home/FaqSection";
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
  const [members, setMembers] = useState<Member[]>(initialMembers || []);

  const [isDonorModalOpen, setIsDonorModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // Sync with API & localStorage backup on mount
  useEffect(() => {
    // 1. Immediately check localStorage for images uploaded by admin and merge them
    try {
      const localStr = localStorage.getItem("bdab_local_members");
      if (localStr) {
        const localList: Member[] = JSON.parse(localStr);
        setMembers((prev) =>
          prev.map((m) => {
            const match = localList.find((l) => l.id === m.id || l.registrationNumber === m.registrationNumber);
            if (match && match.image && !m.image) {
              return { ...m, image: match.image };
            }
            return m;
          })
        );
      }
    } catch {}

    // 2. Fetch live data from server/database
    fetch(`/api/donors?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setDonors(res.data);
        } else {
          try {
            const local = localStorage.getItem("bdab_local_donors");
            if (local) setDonors(JSON.parse(local));
          } catch {}
        }
      })
      .catch(() => {
        try {
          const local = localStorage.getItem("bdab_local_donors");
          if (local) setDonors(JSON.parse(local));
        } catch {}
      });

    fetch(`/api/requests?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setRequests(res.data);
        } else {
          try {
            const local = localStorage.getItem("bdab_local_requests");
            if (local) setRequests(JSON.parse(local));
          } catch {}
        }
      })
      .catch(() => {});

    // Fetch members with fresh timestamp to bypass browser cache
    fetch(`/api/members?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setMembers((prev) => {
            const apiData: Member[] = res.data;
            let localList: Member[] = [];
            try {
              const localStr = localStorage.getItem("bdab_local_members");
              if (localStr) localList = JSON.parse(localStr);
            } catch {}

            // Merge smartly: never replace an existing image with an empty string
            return apiData.map((apiM) => {
              if (apiM.image) return apiM;

              const prevM = prev.find(
                (p) => p.id === apiM.id || p.registrationNumber === apiM.registrationNumber
              );
              if (prevM && prevM.image) {
                return { ...apiM, image: prevM.image };
              }

              const localM = localList.find(
                (l) => l.id === apiM.id || l.registrationNumber === apiM.registrationNumber
              );
              if (localM && localM.image) {
                return { ...apiM, image: localM.image };
              }

              return apiM;
            });
          });
        }
      })
      .catch(() => {});
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

        // Never overwrite a member's valid image with an empty string
        const mergedToSave = members.map((m) => {
          if (!m.image) {
            const match = localList.find(
              (l) => l.id === m.id || l.registrationNumber === m.registrationNumber
            );
            if (match && match.image) return { ...m, image: match.image };
          }
          return m;
        });

        localStorage.setItem("bdab_local_members", JSON.stringify(mergedToSave));
      } catch {}
    }
  }, [members]);

  useEffect(() => {
    if (requests && requests.length > 0) {
      try { localStorage.setItem("bdab_local_requests", JSON.stringify(requests)); } catch {}
    }
  }, [requests]);

  const handleDonorSuccess = (newDonor: Donor) => {
    setDonors((prev) => {
      const updated = [newDonor, ...prev];
      try {
        localStorage.setItem("bdab_local_donors", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleRequestSuccess = (newRequest: BloodRequest) => {
    setRequests((prev) => {
      const updated = [newRequest, ...prev];
      try {
        localStorage.setItem("bdab_local_requests", JSON.stringify(updated));
      } catch {}
      return updated;
    });
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

      {/* Frequently Asked Questions */}
      <FaqSection />

      {/* Official Facebook Community Group Section */}
      <FacebookCommunitySection />

      {/* Global Footer */}
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

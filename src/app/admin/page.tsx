import { Metadata } from 'next';
import { getDonors, getRequests, getNotices, getMembers } from '@/lib/store';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export const metadata: Metadata = {
  title: 'এডমিন কন্ট্রোল প্যানেল | ব্লাড ডোনেশন এসোসিয়েশন বাংলাদেশ',
  description: 'সুপার এডমিন ড্যাশবোর্ড - ব্লাড ডোনেশন এসোসিয়েশন বাংলাদেশ',
};

// Force dynamic so admin always receives real-time server data
export const dynamic = 'force-dynamic';

export default function AdminPage() {
  const donors = getDonors();
  const requests = getRequests();
  const notices = getNotices();
  const members = getMembers();

  return (
    <AdminDashboard
      initialDonors={donors}
      initialRequests={requests}
      initialNotices={notices}
      initialMembers={members}
    />
  );
}

import { fetchDonors, fetchRequests, fetchNotices, fetchMembers } from '@/lib/store';
import { HomeClient } from '@/components/home/HomeClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [donors, requests, notices, members] = await Promise.all([
    fetchDonors(),
    fetchRequests(),
    fetchNotices(),
    fetchMembers(),
  ]);

  return (
    <main className="min-h-screen">
      <HomeClient
        initialDonors={donors}
        initialRequests={requests}
        initialNotices={notices}
        initialMembers={members}
      />
    </main>
  );
}

import { getDonors, getRequests, getNotices, getMembers } from '@/lib/store';
import { HomeClient } from '@/components/home/HomeClient';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const donors = getDonors();
  const requests = getRequests();
  const notices = getNotices();
  const members = getMembers();

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

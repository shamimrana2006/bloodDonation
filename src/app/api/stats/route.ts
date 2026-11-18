import { NextResponse } from 'next/server';
import { fetchDonors, fetchRequests } from '@/lib/store';
import { HUMANITARIAN_ACTIVITIES } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const donors = await fetchDonors();
    const requests = await fetchRequests();

    const totalDonors = donors.length;
    const availableDonors = donors.filter((d) => d.isAvailable).length;
    const activeRequests = requests.filter((r) => r.status === 'সক্রিয়').length;
    const fulfilledRequests = requests.filter((r) => r.status === 'রক্তদাতা পাওয়া গেছে' || r.status === 'সম্পন্ন').length;

    // Blood group distribution
    const groupCounts: Record<string, number> = {};
    donors.forEach((d) => {
      groupCounts[d.bloodGroup] = (groupCounts[d.bloodGroup] || 0) + 1;
    });

    const districtsCovered = new Set(donors.map((d) => d.district)).size;

    return NextResponse.json({
      success: true,
      stats: {
        totalDonors,
        availableDonors,
        activeRequests,
        fulfilledRequests,
        districtsCovered: Math.max(districtsCovered, 64),
        totalActivities: HUMANITARIAN_ACTIVITIES.length,
        groupCounts,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Error fetching stats' },
      { status: 500 }
    );
  }
}

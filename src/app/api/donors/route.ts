import { NextResponse } from 'next/server';
import { fetchDonors, createDonor } from '@/lib/store';
import { Donor } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bloodGroup = searchParams.get('bloodGroup');
    const district = searchParams.get('district');
    const upazila = searchParams.get('upazila');
    const availableOnly = searchParams.get('availableOnly') === 'true';
    const query = searchParams.get('query')?.toLowerCase();

    let list = await fetchDonors();

    if (bloodGroup && bloodGroup !== 'all') {
      list = list.filter((d) => d.bloodGroup.toLowerCase() === bloodGroup.toLowerCase());
    }

    if (district && district !== 'all') {
      list = list.filter((d) => d.district.toLowerCase() === district.toLowerCase());
    }

    if (upazila && upazila !== 'all') {
      list = list.filter((d) => d.upazila.toLowerCase().includes(upazila.toLowerCase()));
    }

    if (availableOnly) {
      list = list.filter((d) => d.isAvailable);
    }

    if (query) {
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.phone.includes(query) ||
          d.upazila.toLowerCase().includes(query) ||
          (d.address && d.address.toLowerCase().includes(query))
      );
    }

    return NextResponse.json({ success: true, count: list.length, data: list });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Error fetching donors' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.bloodGroup || !body.phone || !body.district) {
      return NextResponse.json(
        { success: false, message: 'নাম, রক্তের গ্রুপ, মোবাইল নম্বর এবং জেলা বাধ্যতামূলক।' },
        { status: 400 }
      );
    }

    const newDonor: Donor = {
      id: `donor-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: body.name.trim(),
      bloodGroup: body.bloodGroup,
      phone: body.phone.trim(),
      alternatePhone: body.alternatePhone?.trim() || '',
      division: body.division || 'ময়মনসিংহ',
      district: body.district.trim(),
      upazila: body.upazila?.trim() || 'সরিষাবাড়ী',
      address: body.address?.trim() || '',
      lastDonationDate: body.lastDonationDate || '',
      totalDonations: Number(body.totalDonations) || 0,
      gender: body.gender || 'পুরুষ',
      isAvailable: body.isAvailable !== false,
      isVerified: true,
      notes: body.notes || '',
      createdAt: new Date().toISOString().split('T')[0],
    };

    const saved = await createDonor(newDonor);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Error adding donor' },
      { status: 500 }
    );
  }
}

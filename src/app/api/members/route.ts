import { NextResponse } from 'next/server';
import { fetchMembers, createMember } from '@/lib/store';
import { Member, CommitteeLevel } from '@/lib/types';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase().trim();
    const committeeLevel = searchParams.get('committeeLevel');
    const district = searchParams.get('district');

    let list = await fetchMembers();

    // Filter by Committee Level (e.g. 'কেন্দ্রীয় কমিটি')
    if (committeeLevel && committeeLevel !== 'all') {
      list = list.filter((m) => m.committeeLevel === committeeLevel);
    }

    // Filter by District
    if (district && district !== 'all') {
      list = list.filter((m) => m.district.toLowerCase() === district.toLowerCase());
    }

    // Search by Registration Number, Phone, or Name
    if (search) {
      list = list.filter(
        (m) =>
          (m.registrationNumber && m.registrationNumber.toLowerCase().includes(search)) ||
          m.phone.includes(search) ||
          m.name.toLowerCase().includes(search) ||
          m.role.toLowerCase().includes(search) ||
          (m.upazila && m.upazila.toLowerCase().includes(search))
      );
    }

    return NextResponse.json({ success: true, count: list.length, data: list });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Error fetching members' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.role || !body.phone) {
      return NextResponse.json(
        { success: false, message: 'সদস্যের নাম, পদবী এবং মোবাইল নম্বর আবশ্যক।' },
        { status: 400 }
      );
    }

    // Generate clean serial Registration Number in format: BDAB-001, BDAB-002, etc. (NO BDAB-C- or BDAB-U-)
    let regNum = body.registrationNumber?.trim();
    if (!regNum) {
      const allMembers = await fetchMembers();
      let maxSerial = 0;
      for (const m of allMembers) {
        if (m.registrationNumber) {
          const match = m.registrationNumber.match(/BDAB-(\d+)/i);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxSerial) maxSerial = num;
          }
        }
      }
      const nextSerial = maxSerial + 1;
      regNum = `BDAB-${String(nextSerial).padStart(3, '0')}`;
    } else {
      // If user typed 9 or BDAB-9 or BDAB-C-009, sanitize to BDAB-xxx
      const numMatch = regNum.match(/(\d+)/);
      if (numMatch) {
        const num = parseInt(numMatch[1], 10);
        regNum = `BDAB-${String(num).padStart(3, '0')}`;
      }
    }

    const committeeLevel: CommitteeLevel = body.committeeLevel || 'সাধারণ সদস্য';

    let imageUrl = body.image || '';
    if (imageUrl.startsWith('data:image/')) {
      try {
        const up = await uploadImageToCloudinary(imageUrl, 'bdab_members');
        if (up.success && up.url) {
          imageUrl = up.url;
        }
      } catch (err) {
        console.error('Error auto-uploading member image to Cloudinary:', err);
      }
    }

    const newMember: Member = {
      id: `member-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      registrationNumber: regNum,
      name: body.name.trim(),
      role: body.role.trim(),
      committeeLevel,
      phone: body.phone.trim(),
      bloodGroup: body.bloodGroup || 'A+',
      district: body.district?.trim() || 'জামালপুর',
      upazila: body.upazila?.trim() || 'সরিষাবাড়ী',
      address: body.address?.trim() || 'সরিষাবাড়ী, জামালপুর',
      bio: body.bio?.trim() || '',
      image: imageUrl,
      joinedDate: body.joinedDate || new Date().toISOString().split('T')[0],
      order: Number(body.order) || 99,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const saved = await createMember(newMember);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Error adding member' },
      { status: 500 }
    );
  }
}

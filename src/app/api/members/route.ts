import { NextResponse } from 'next/server';
import { getMembers, addMember } from '@/lib/store';
import { Member } from '@/lib/types';

export async function GET() {
  try {
    const list = getMembers();
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
        { success: false, message: 'সদস্যের নাম, পদবী/পরিচয় এবং মোবাইল নম্বর আবশ্যক।' },
        { status: 400 }
      );
    }

    const newMember: Member = {
      id: `member-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: body.name.trim(),
      role: body.role.trim(),
      phone: body.phone.trim(),
      bloodGroup: body.bloodGroup || 'A+',
      address: body.address?.trim() || 'সরিষাবাড়ী, জামালপুর',
      bio: body.bio?.trim() || '',
      image: body.image || '',
      joinedDate: body.joinedDate || new Date().toISOString().split('T')[0],
      order: Number(body.order) || 99,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const saved = addMember(newMember);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Error adding member' },
      { status: 500 }
    );
  }
}

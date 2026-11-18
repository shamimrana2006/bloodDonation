import { NextResponse } from 'next/server';
import { getRequests, addRequest } from '@/lib/store';
import { BloodRequest } from '@/lib/types';

export async function GET() {
  try {
    const list = getRequests();
    return NextResponse.json({ success: true, count: list.length, data: list });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Error fetching requests' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.patientName || !body.bloodGroup || !body.contactPhone || !body.hospitalName) {
      return NextResponse.json(
        { success: false, message: 'রোগীর নাম, রক্তের গ্রুপ, মোবাইল ও হাসপাতালের নাম আবশ্যক।' },
        { status: 400 }
      );
    }

    const newRequest: BloodRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      patientName: body.patientName.trim(),
      bloodGroup: body.bloodGroup,
      units: Number(body.units) || 1,
      hospitalName: body.hospitalName.trim(),
      district: body.district?.trim() || 'জামালপুর',
      upazila: body.upazila?.trim() || 'সরিষাবাড়ী',
      neededDate: body.neededDate || new Date().toISOString().split('T')[0],
      neededTime: body.neededTime || 'জরুরি',
      contactPhone: body.contactPhone.trim(),
      alternatePhone: body.alternatePhone?.trim() || '',
      reason: body.reason?.trim() || 'জরুরি রক্ত প্রয়োজন',
      urgency: body.urgency || 'জরুরি',
      status: 'সক্রিয়',
      createdAt: new Date().toISOString().split('T')[0],
    };

    const saved = addRequest(newRequest);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Error adding request' },
      { status: 500 }
    );
  }
}

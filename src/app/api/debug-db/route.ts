import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { MONGODB_URI, MemberModel, DonorModel } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    readyStateBefore: mongoose.connection.readyState,
  };

  try {
    const uri = MONGODB_URI;
    results.uriHost = uri.split('@')[1]?.split('/')[0];
    
    // Connect with bufferCommands: true (default) and wait for readyState === 1
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        bufferCommands: true,
      });
    }

    results.connSuccess = true;
    results.readyStateAfter = mongoose.connection.readyState;
    results.memberCount = await MemberModel.countDocuments();
    results.donorCount = await DonorModel.countDocuments();
    
    const members = await MemberModel.find({}).select('id registrationNumber name').lean();
    results.members = members;
  } catch (err: any) {
    results.connSuccess = false;
    results.error = {
      name: err?.name,
      message: err?.message,
      code: err?.code,
      reason: err?.reason ? String(err.reason) : undefined,
    };
  }

  return NextResponse.json(results);
}

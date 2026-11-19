import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { MONGODB_URI, MemberModel } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    readyStateBefore: mongoose.connection.readyState,
  };

  try {
    const uri = MONGODB_URI;
    results.uriHost = uri.split('@')[1]?.split('/')[0];
    
    // Attempt direct mongoose connect with raw error capture
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false,
    });
    results.connSuccess = true;
    results.readyStateAfter = mongoose.connection.readyState;
    results.memberCount = await MemberModel.countDocuments();
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

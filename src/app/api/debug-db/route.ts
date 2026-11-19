import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase, MemberModel, DonorModel, RequestModel, NoticeModel, DeletedIdModel } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    readyStateBefore: mongoose.connection.readyState,
  };

  try {
    const conn = await connectToDatabase();
    results.connReturned = Boolean(conn);
    results.readyStateAfter = mongoose.connection.readyState;

    if (conn) {
      const memberCount = await MemberModel.countDocuments();
      const donorCount = await DonorModel.countDocuments();
      const requestCount = await RequestModel.countDocuments();
      const noticeCount = await NoticeModel.countDocuments();
      const deletedIdCount = await DeletedIdModel.countDocuments();

      results.counts = {
        members: memberCount,
        donors: donorCount,
        requests: requestCount,
        notices: noticeCount,
        deletedIds: deletedIdCount,
      };

      const sampleMembers = await MemberModel.find({}).limit(5).select('id registrationNumber name').lean();
      results.sampleMembers = sampleMembers;
    }
  } catch (err: any) {
    results.error = {
      message: err?.message,
      name: err?.name,
      stack: err?.stack,
    };
  }

  return NextResponse.json(results);
}

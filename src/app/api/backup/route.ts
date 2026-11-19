import { NextResponse } from 'next/server';
import {
  connectToDatabase,
  DonorModel,
  RequestModel,
  MemberModel,
  NoticeModel,
  DeletedIdModel,
} from '@/lib/mongodb';
import {
  fetchDonors,
  fetchMembers,
  fetchRequests,
  fetchNotices,
} from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const conn = await connectToDatabase();
    let donors: any[] = [];
    let members: any[] = [];
    let requests: any[] = [];
    let notices: any[] = [];
    let deletedIds: any[] = [];
    let isLiveDatabase = false;

    if (conn) {
      isLiveDatabase = true;
      // Fetch 100% complete, un-truncated documents directly from MongoDB Atlas
      [donors, members, requests, notices, deletedIds] = await Promise.all([
        DonorModel.find({}).lean(),
        MemberModel.find({}).lean(),
        RequestModel.find({}).lean(),
        NoticeModel.find({}).lean(),
        DeletedIdModel.find({}).lean(),
      ]);
    } else {
      // Fallback if DB connection fails
      [donors, members, requests, notices] = await Promise.all([
        fetchDonors(),
        fetchMembers(),
        fetchRequests(),
        fetchNotices(),
      ]);
    }

    // Clean internal mongo fields for a portable, clean backup file
    const sanitizeDocs = (arr: any[]) =>
      (arr || []).map((item) => {
        if (!item || typeof item !== 'object') return item;
        const { _id, __v, ...rest } = item;
        return rest;
      });

    const backupPayload = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      organization: 'ব্লাড ডোনেশন এসোসিয়েশন বাংলাদেশ',
      dataSource: isLiveDatabase ? 'MongoDB Atlas Cloud Database (Live)' : 'Local Cache Store',
      databaseConnected: isLiveDatabase,
      counts: {
        totalDonors: donors.length,
        totalMembers: members.length,
        totalRequests: requests.length,
        totalNotices: notices.length,
        totalDeletedIds: deletedIds.length,
      },
      donors: sanitizeDocs(donors),
      members: sanitizeDocs(members),
      requests: sanitizeDocs(requests),
      notices: sanitizeDocs(notices),
      deletedIds: sanitizeDocs(deletedIds),
    };

    return NextResponse.json({
      success: true,
      data: backupPayload,
    });
  } catch (error: any) {
    console.error('Error generating database backup:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Error generating database backup' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backupData = body.data || body;

    if (!backupData || (!Array.isArray(backupData.donors) && !Array.isArray(backupData.members))) {
      return NextResponse.json(
        { success: false, message: 'অবৈধ ব্যাকআপ ফাইল। সঠিক JSON ব্যাকআপ ফাইল নির্বাচন করুন।' },
        { status: 400 }
      );
    }

    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json(
        { success: false, message: 'ডাটাবেজে সংযোগ পাওয়া যায়নি। অনুগ্রহ করে ডাটাবেজ কানেকশন চেক করুন।' },
        { status: 503 }
      );
    }

    const restoredCounts = {
      donors: 0,
      members: 0,
      requests: 0,
      notices: 0,
    };

    // 1. Restore Donors
    if (Array.isArray(backupData.donors) && backupData.donors.length > 0) {
      for (const donor of backupData.donors) {
        if (donor.id && donor.name && donor.bloodGroup && donor.phone) {
          const { _id, __v, ...cleanDonor } = donor;
          await DonorModel.findOneAndUpdate(
            { id: donor.id },
            { $set: cleanDonor },
            { upsert: true, new: true }
          );
          restoredCounts.donors++;
        }
      }
    }

    // 2. Restore Members
    if (Array.isArray(backupData.members) && backupData.members.length > 0) {
      for (const member of backupData.members) {
        if (member.id && member.name && member.role) {
          const { _id, __v, ...cleanMember } = member;
          await MemberModel.findOneAndUpdate(
            { id: member.id },
            { $set: cleanMember },
            { upsert: true, new: true }
          );
          const toUnblock = [member.id, member.registrationNumber].filter(Boolean);
          if (toUnblock.length > 0) {
            await DeletedIdModel.deleteMany({ id: { $in: toUnblock } });
          }
          restoredCounts.members++;
        }
      }
    }

    // 3. Restore Requests
    if (Array.isArray(backupData.requests) && backupData.requests.length > 0) {
      for (const req of backupData.requests) {
        if (req.id && req.patientName && req.bloodGroup) {
          const { _id, __v, ...cleanReq } = req;
          await RequestModel.findOneAndUpdate(
            { id: req.id },
            { $set: cleanReq },
            { upsert: true, new: true }
          );
          restoredCounts.requests++;
        }
      }
    }

    // 4. Restore Notices
    if (Array.isArray(backupData.notices) && backupData.notices.length > 0) {
      for (const notice of backupData.notices) {
        if (notice.id && notice.title) {
          const { _id, __v, ...cleanNotice } = notice;
          await NoticeModel.findOneAndUpdate(
            { id: notice.id },
            { $set: cleanNotice },
            { upsert: true, new: true }
          );
          restoredCounts.notices++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'ডাটাবেজে ব্যাকআপ ফাইল সফলভাবে রিস্টোর করা হয়েছে!',
      counts: restoredCounts,
    });
  } catch (error: any) {
    console.error('Error restoring backup to database:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Error restoring database' },
      { status: 500 }
    );
  }
}

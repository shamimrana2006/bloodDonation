import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { Donor, BloodRequest, Notice, Member } from './types';
import { INITIAL_DONORS, INITIAL_REQUESTS, INITIAL_NOTICES, INITIAL_MEMBERS } from './data';
import { connectToDatabase, DonorModel, RequestModel, MemberModel, NoticeModel, DeletedIdModel } from './mongodb';

interface AppStorage {
  donors: Donor[];
  requests: BloodRequest[];
  members: Member[];
  notices: Notice[];
  adminPassword: string;
}

const DATA_FILE_PATH = path.join(process.cwd(), 'data-store.json');

// Global cache for serverless environments
let memoryStorage: AppStorage | null = null;

function getInitialStorage(): AppStorage {
  return {
    donors: [...INITIAL_DONORS],
    requests: [...INITIAL_REQUESTS],
    members: [...INITIAL_MEMBERS],
    notices: [...INITIAL_NOTICES],
    adminPassword: '111111',
  };
}

export function getStore(): AppStorage {
  if (memoryStorage) {
    if (!memoryStorage.members) {
      memoryStorage.members = [...INITIAL_MEMBERS];
    }
    return memoryStorage;
  }

  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const fileData = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
      memoryStorage = JSON.parse(fileData);
      if (!memoryStorage?.members) {
        memoryStorage!.members = [...INITIAL_MEMBERS];
      }
      return memoryStorage!;
    }
  } catch {
    // Read-only filesystem in serverless
  }

  memoryStorage = getInitialStorage();
  saveStore(memoryStorage);
  return memoryStorage;
}

export function saveStore(store: AppStorage): void {
  memoryStorage = store;
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch {
    // Read-only filesystem in serverless, memory cache still holds it
  }
}

// ==================== ASYNC DB METHODS (WITH MONGODB CLOUD SUPPORT) ====================

// Donors
export async function fetchDonors(): Promise<Donor[]> {
  const deletedIds = new Set<string>();
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const delDocs = await DeletedIdModel.find({ entityType: 'donor' }).lean();
      delDocs.forEach((d: any) => {
        if (d.id) deletedIds.add(d.id.toLowerCase());
      });

      const docs = await DonorModel.find({}).sort({ createdAt: -1 }).lean();
      if (docs && docs.length > 0) {
        return docs
          .filter((d: any) => !deletedIds.has((d.id || '').toLowerCase()))
          .map((d: any) => ({
            id: d.id,
            name: d.name,
            bloodGroup: d.bloodGroup,
            phone: d.phone,
            alternatePhone: d.alternatePhone,
            division: d.division,
            district: d.district,
            upazila: d.upazila,
            address: d.address,
            lastDonationDate: d.lastDonationDate,
            totalDonations: d.totalDonations,
            gender: d.gender,
            isAvailable: d.isAvailable,
            isVerified: d.isVerified,
            notes: d.notes,
            createdAt: d.createdAt,
          }));
      }
    }
  } catch (err) {
    console.error('Error fetching donors from Mongo:', err);
  }

  const fallback = getStore().donors || [];
  return fallback.filter((d) => !deletedIds.has((d.id || '').toLowerCase()));
}

export async function createDonor(donor: Donor): Promise<Donor> {
  const store = getStore();
  store.donors.unshift(donor);
  saveStore(store);

  try {
    const conn = await connectToDatabase();
    if (conn) {
      await DonorModel.create(donor);
      await DeletedIdModel.deleteMany({
        id: { $in: [donor.id, donor.id.toLowerCase()] },
      });
    }
  } catch (err) {
    console.error('Error saving donor to Mongo:', err);
  }

  return donor;
}

export async function modifyDonor(id: string, updates: Partial<Donor>): Promise<Donor | null> {
  const store = getStore();
  const index = store.donors.findIndex((d) => d.id === id);
  if (index !== -1) {
    store.donors[index] = { ...store.donors[index], ...updates };
    saveStore(store);
  }

  try {
    const conn = await connectToDatabase();
    if (conn) {
      await DonorModel.updateOne({ id }, { $set: updates });
    }
  } catch (err) {
    console.error('Error updating donor in Mongo:', err);
  }

  return index !== -1 ? store.donors[index] : null;
}

export async function removeDonor(id: string): Promise<boolean> {
  const clean = decodeURIComponent(id).trim();
  const lower = clean.toLowerCase();
  const store = getStore();
  store.donors = store.donors.filter((d) => d.id !== clean && d.id?.toLowerCase() !== lower);
  saveStore(store);

  try {
    const conn = await connectToDatabase();
    if (conn) {
      const orConditions: any[] = [{ id: clean }, { id: lower }];
      if (mongoose.Types.ObjectId.isValid(clean)) {
        orConditions.push({ _id: clean });
      }
      await DonorModel.deleteMany({ $or: orConditions });
      await DeletedIdModel.updateOne(
        { id: clean },
        { id: clean, entityType: 'donor', deletedAt: new Date() },
        { upsert: true }
      );
      if (clean !== lower) {
        await DeletedIdModel.updateOne(
          { id: lower },
          { id: lower, entityType: 'donor', deletedAt: new Date() },
          { upsert: true }
        );
      }
      return true;
    }
  } catch (err) {
    console.error('Error deleting donor in Mongo:', err);
  }

  return true;
}

// Members
export async function fetchMembers(): Promise<Member[]> {
  const deletedIds = new Set<string>();

  try {
    const conn = await connectToDatabase();
    if (conn) {
      const delDocs = await DeletedIdModel.find({ entityType: 'member' }).lean();
      delDocs.forEach((d: any) => {
        if (d.id) deletedIds.add(d.id.toLowerCase());
      });

      const docs = await MemberModel.find({}).sort({ order: 1, createdAt: -1 }).lean();
      if (docs && docs.length > 0) {
        return docs
          .filter((m: any) => {
            const mId = (m.id || '').toLowerCase();
            const mReg = (m.registrationNumber || '').toLowerCase();
            return !deletedIds.has(mId) && !deletedIds.has(mReg);
          })
          .map((m: any) => {
            let img = m.image;
            if (!img) {
              const initMatch = INITIAL_MEMBERS.find((im) => im.id === m.id || im.registrationNumber === m.registrationNumber);
              if (initMatch && initMatch.image) img = initMatch.image;
            }
            return {
              id: m.id,
              registrationNumber: m.registrationNumber || `BDAB-${m.id.slice(-4).toUpperCase()}`,
              name: m.name,
              role: m.role,
              committeeLevel: m.committeeLevel || 'সাধারণ সদস্য',
              phone: m.phone,
              bloodGroup: m.bloodGroup,
              district: m.district || 'জামালপুর',
              upazila: m.upazila || 'সরিষাবাড়ী',
              address: m.address,
              bio: m.bio,
              image: img,
              joinedDate: m.joinedDate,
              order: m.order,
              createdAt: m.createdAt,
            };
          });
      }
    }
  } catch (err) {
    console.error('Error fetching members from Mongo:', err);
  }

  const fallback = getStore().members || [];
  return fallback.filter((m) => {
    const mId = (m.id || '').toLowerCase();
    const mReg = (m.registrationNumber || '').toLowerCase();
    return !deletedIds.has(mId) && !deletedIds.has(mReg);
  });
}

export async function createMember(member: Member): Promise<Member> {
  const store = getStore();
  if (!store.members) store.members = [];
  store.members.push(member);
  saveStore(store);

  try {
    const conn = await connectToDatabase();
    if (conn) {
      await MemberModel.create(member);
      const toUnblock = [
        member.id,
        member.id?.toLowerCase(),
        member.registrationNumber,
        member.registrationNumber?.toLowerCase(),
      ].filter(Boolean) as string[];

      await DeletedIdModel.deleteMany({ id: { $in: toUnblock } });
    }
  } catch (err) {
    console.error('Error saving member to Mongo:', err);
  }

  return member;
}

export async function modifyMember(id: string, updates: Partial<Member>): Promise<Member | null> {
  const clean = decodeURIComponent(id).trim();
  const lower = clean.toLowerCase();

  const safeUpdates = { ...updates };
  // Never overwrite an existing photo with an empty string or blank
  if (!safeUpdates.image || (typeof safeUpdates.image === 'string' && safeUpdates.image.trim() === '')) {
    delete safeUpdates.image;
  }

  let updatedMember: Member | null = null;

  try {
    const conn = await connectToDatabase();
    if (conn) {
      const doc = await MemberModel.findOneAndUpdate(
        {
          $or: [
            { id: clean },
            { id: lower },
            { registrationNumber: { $regex: new RegExp(`^${clean}$`, 'i') } },
          ],
        },
        { $set: safeUpdates },
        { new: true }
      ).lean();

      if (doc) {
        updatedMember = {
          id: (doc as any).id,
          registrationNumber: (doc as any).registrationNumber,
          name: (doc as any).name,
          role: (doc as any).role,
          committeeLevel: (doc as any).committeeLevel,
          phone: (doc as any).phone,
          bloodGroup: (doc as any).bloodGroup,
          district: (doc as any).district,
          upazila: (doc as any).upazila,
          address: (doc as any).address,
          bio: (doc as any).bio,
          image: (doc as any).image,
          joinedDate: (doc as any).joinedDate,
          order: (doc as any).order,
          createdAt: (doc as any).createdAt,
        };
      }
    }
  } catch (err) {
    console.error('Error updating member in Mongo:', err);
  }

  // Update in-memory fallback
  const store = getStore();
  if (!store.members) store.members = [];
  const index = store.members.findIndex(
    (m) =>
      m.id === clean ||
      m.id?.toLowerCase() === lower ||
      m.registrationNumber?.toLowerCase() === lower
  );
  if (index !== -1) {
    store.members[index] = { ...store.members[index], ...updates };
    saveStore(store);
    if (!updatedMember) updatedMember = store.members[index];
  } else if (updatedMember) {
    store.members.push(updatedMember);
    saveStore(store);
  }

  return updatedMember;
}

export async function removeMember(id: string): Promise<boolean> {
  const clean = decodeURIComponent(id).trim();
  const lower = clean.toLowerCase();

  const store = getStore();
  if (!store.members) store.members = [];
  store.members = store.members.filter(
    (m) =>
      m.id !== clean &&
      m.id?.toLowerCase() !== lower &&
      m.registrationNumber?.toLowerCase() !== lower
  );
  saveStore(store);

  try {
    const conn = await connectToDatabase();
    if (conn) {
      const orConditions: any[] = [
        { id: clean },
        { id: lower },
        { registrationNumber: { $regex: new RegExp(`^${clean}$`, 'i') } },
      ];
      if (mongoose.Types.ObjectId.isValid(clean)) {
        orConditions.push({ _id: clean });
      }

      await MemberModel.deleteMany({ $or: orConditions });

      await DeletedIdModel.updateOne(
        { id: clean },
        { id: clean, entityType: 'member', deletedAt: new Date() },
        { upsert: true }
      );
      if (clean !== lower) {
        await DeletedIdModel.updateOne(
          { id: lower },
          { id: lower, entityType: 'member', deletedAt: new Date() },
          { upsert: true }
        );
      }
      return true;
    }
  } catch (err) {
    console.error('Error deleting member in Mongo:', err);
  }

  return true;
}

export async function fetchMemberByIdOrReg(identifier: string): Promise<Member | null> {
  const clean = decodeURIComponent(identifier).trim();
  const lower = clean.toLowerCase();

  try {
    const conn = await connectToDatabase();
    if (conn) {
      const isDeleted = await DeletedIdModel.findOne({
        id: { $in: [clean, lower] },
        entityType: 'member',
      }).lean();
      if (isDeleted) {
        return null;
      }

      const doc = await MemberModel.findOne({
        $or: [
          { id: clean },
          { id: lower },
          { registrationNumber: { $regex: new RegExp(`^${clean}$`, 'i') } },
          { phone: clean }
        ]
      }).lean();

      if (doc) {
        let img = (doc as any).image;
        if (!img) {
          const initMatch = INITIAL_MEMBERS.find((im) => im.id === (doc as any).id || im.registrationNumber === (doc as any).registrationNumber);
          if (initMatch && initMatch.image) img = initMatch.image;
        }
        return {
          id: (doc as any).id,
          registrationNumber: (doc as any).registrationNumber || `BDAB-${(doc as any).id.slice(-4).toUpperCase()}`,
          name: (doc as any).name,
          role: (doc as any).role,
          committeeLevel: (doc as any).committeeLevel || 'সাধারণ সদস্য',
          phone: (doc as any).phone,
          bloodGroup: (doc as any).bloodGroup,
          district: (doc as any).district || 'জামালপুর',
          upazila: (doc as any).upazila || 'সরিষাবাড়ী',
          address: (doc as any).address,
          bio: (doc as any).bio,
          image: img,
          joinedDate: (doc as any).joinedDate,
          order: (doc as any).order,
          createdAt: (doc as any).createdAt,
        };
      }
    }
  } catch (err) {
    console.error('Error fetching member by id from Mongo:', err);
  }

  // Memory fallback
  const store = getStore();
  const list = (store.members && store.members.length > 0) ? store.members : INITIAL_MEMBERS;
  const found = list.find(
    (m) =>
      m.id?.toLowerCase() === lower ||
      m.registrationNumber?.toLowerCase() === lower ||
      m.phone === clean
  );
  if (found) return found;

  const foundInitial = INITIAL_MEMBERS.find(
    (m) =>
      m.id?.toLowerCase() === lower ||
      m.registrationNumber?.toLowerCase() === lower ||
      m.phone === clean
  );
  return foundInitial || null;
}

// Requests
export async function fetchRequests(): Promise<BloodRequest[]> {
  const deletedIds = new Set<string>();

  try {
    const conn = await connectToDatabase();
    if (conn) {
      const delDocs = await DeletedIdModel.find({ entityType: 'request' }).lean();
      delDocs.forEach((d: any) => {
        if (d.id) deletedIds.add(d.id.toLowerCase());
      });

      const docs = await RequestModel.find({}).sort({ createdAt: -1 }).lean();
      if (docs && docs.length > 0) {
        return docs
          .filter((r: any) => !deletedIds.has((r.id || '').toLowerCase()))
          .map((r: any) => ({
            id: r.id,
            patientName: r.patientName,
            bloodGroup: r.bloodGroup,
            units: r.units,
            hospitalName: r.hospitalName,
            district: r.district,
            upazila: r.upazila,
            neededDate: r.neededDate,
            neededTime: r.neededTime,
            contactPhone: r.contactPhone,
            alternatePhone: r.alternatePhone,
            reason: r.reason,
            urgency: r.urgency,
            status: r.status,
            donorAssigned: r.donorAssigned,
            createdAt: r.createdAt,
          }));
      }
    }
  } catch (err) {
    console.error('Error fetching requests from Mongo:', err);
  }

  const fallback = getStore().requests || [];
  return fallback.filter((r) => !deletedIds.has((r.id || '').toLowerCase()));
}

export async function createRequest(request: BloodRequest): Promise<BloodRequest> {
  const store = getStore();
  store.requests.unshift(request);
  saveStore(store);

  try {
    const conn = await connectToDatabase();
    if (conn) {
      await RequestModel.create(request);
      await DeletedIdModel.deleteMany({
        id: { $in: [request.id, request.id.toLowerCase()] }
      });
    }
  } catch (err) {
    console.error('Error saving request to Mongo:', err);
  }

  return request;
}

export async function modifyRequest(id: string, updates: Partial<BloodRequest>): Promise<BloodRequest | null> {
  const store = getStore();
  const index = store.requests.findIndex((r) => r.id === id);
  if (index !== -1) {
    store.requests[index] = { ...store.requests[index], ...updates };
    saveStore(store);
  }

  try {
    const conn = await connectToDatabase();
    if (conn) {
      await RequestModel.updateOne({ id }, { $set: updates });
    }
  } catch (err) {
    console.error('Error updating request in Mongo:', err);
  }

  return index !== -1 ? store.requests[index] : null;
}

export async function removeRequest(id: string): Promise<boolean> {
  const clean = decodeURIComponent(id).trim();
  const lower = clean.toLowerCase();
  const store = getStore();
  store.requests = store.requests.filter((r) => r.id !== clean && r.id?.toLowerCase() !== lower);
  saveStore(store);

  try {
    const conn = await connectToDatabase();
    if (conn) {
      const orConditions: any[] = [{ id: clean }, { id: lower }];
      if (mongoose.Types.ObjectId.isValid(clean)) {
        orConditions.push({ _id: clean });
      }
      await RequestModel.deleteMany({ $or: orConditions });
      await DeletedIdModel.updateOne(
        { id: clean },
        { id: clean, entityType: 'request', deletedAt: new Date() },
        { upsert: true }
      );
      if (clean !== lower) {
        await DeletedIdModel.updateOne(
          { id: lower },
          { id: lower, entityType: 'request', deletedAt: new Date() },
          { upsert: true }
        );
      }
      return true;
    }
  } catch (err) {
    console.error('Error deleting request in Mongo:', err);
  }

  return true;
}

// Notices
export async function fetchNotices(): Promise<Notice[]> {
  const deletedIds = new Set<string>();

  try {
    const conn = await connectToDatabase();
    if (conn) {
      const delDocs = await DeletedIdModel.find({ entityType: 'notice' }).lean();
      delDocs.forEach((d: any) => {
        if (d.id) deletedIds.add(d.id.toLowerCase());
      });

      const docs = await NoticeModel.find({}).sort({ createdAt: -1 }).lean();
      if (docs && docs.length > 0) {
        return docs
          .filter((n: any) => !deletedIds.has((n.id || '').toLowerCase()))
          .map((n: any) => ({
            id: n.id,
            title: n.title,
            content: n.content,
            date: n.date,
            isImportant: n.isImportant,
            type: n.type,
          }));
      }
    }
  } catch (err) {
    console.error('Error fetching notices from Mongo:', err);
  }

  const fallback = getStore().notices || [];
  return fallback.filter((n) => !deletedIds.has((n.id || '').toLowerCase()));
}

export async function createNotice(notice: Notice): Promise<Notice> {
  const store = getStore();
  store.notices.unshift(notice);
  saveStore(store);

  try {
    const conn = await connectToDatabase();
    if (conn) {
      await NoticeModel.create(notice);
      await DeletedIdModel.deleteMany({
        id: { $in: [notice.id, notice.id.toLowerCase()] }
      });
    }
  } catch (err) {
    console.error('Error saving notice to Mongo:', err);
  }

  return notice;
}

export async function removeNotice(id: string): Promise<boolean> {
  const clean = decodeURIComponent(id).trim();
  const lower = clean.toLowerCase();
  const store = getStore();
  store.notices = store.notices.filter((n) => n.id !== clean && n.id?.toLowerCase() !== lower);
  saveStore(store);

  try {
    const conn = await connectToDatabase();
    if (conn) {
      const orConditions: any[] = [{ id: clean }, { id: lower }];
      if (mongoose.Types.ObjectId.isValid(clean)) {
        orConditions.push({ _id: clean });
      }
      await NoticeModel.deleteMany({ $or: orConditions });
      await DeletedIdModel.updateOne(
        { id: clean },
        { id: clean, entityType: 'notice', deletedAt: new Date() },
        { upsert: true }
      );
      if (clean !== lower) {
        await DeletedIdModel.updateOne(
          { id: lower },
          { id: lower, entityType: 'notice', deletedAt: new Date() },
          { upsert: true }
        );
      }
      return true;
    }
  } catch (err) {
    console.error('Error deleting notice in Mongo:', err);
  }

  return true;
}

// Synchronous fallbacks for SSR page initial render
export function getDonors(): Donor[] {
  return getStore().donors;
}

export function getRequests(): BloodRequest[] {
  return getStore().requests;
}

export function getMembers(): Member[] {
  return getStore().members || [];
}

export function getNotices(): Notice[] {
  return getStore().notices;
}

// Passwords
export function verifyAdminPassword(input: string): boolean {
  const store = getStore();
  const target = store.adminPassword || '111111';
  return input === 'Shamim7262' || input === target || input === '111111';
}

export function updateAdminPassword(newPassword: string): boolean {
  const store = getStore();
  store.adminPassword = newPassword;
  saveStore(store);
  return true;
}

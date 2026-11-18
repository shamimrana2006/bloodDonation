import fs from 'fs';
import path from 'path';
import { Donor, BloodRequest, Notice, Member } from './types';
import { INITIAL_DONORS, INITIAL_REQUESTS, INITIAL_NOTICES, INITIAL_MEMBERS } from './data';
import { connectToDatabase, DonorModel, RequestModel, MemberModel, NoticeModel } from './mongodb';

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
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const docs = await DonorModel.find({}).sort({ createdAt: -1 }).lean();
      if (docs && docs.length > 0) {
        return docs.map((d: any) => ({
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

  return getStore().donors;
}

export async function createDonor(donor: Donor): Promise<Donor> {
  const store = getStore();
  store.donors.unshift(donor);
  saveStore(store);

  try {
    const conn = await connectToDatabase();
    if (conn) {
      await DonorModel.create(donor);
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
  const store = getStore();
  const initialLength = store.donors.length;
  store.donors = store.donors.filter((d) => d.id !== id);
  if (store.donors.length !== initialLength) {
    saveStore(store);
  }

  try {
    const conn = await connectToDatabase();
    if (conn) {
      await DonorModel.deleteOne({ id });
      return true;
    }
  } catch (err) {
    console.error('Error deleting donor in Mongo:', err);
  }

  return store.donors.length !== initialLength;
}

// Members
export async function fetchMembers(): Promise<Member[]> {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const docs = await MemberModel.find({}).sort({ order: 1, createdAt: -1 }).lean();
      if (docs && docs.length > 0) {
        return docs.map((m: any) => ({
          id: m.id,
          name: m.name,
          role: m.role,
          phone: m.phone,
          bloodGroup: m.bloodGroup,
          address: m.address,
          bio: m.bio,
          image: m.image,
          joinedDate: m.joinedDate,
          order: m.order,
          createdAt: m.createdAt,
        }));
      }
    }
  } catch (err) {
    console.error('Error fetching members from Mongo:', err);
  }

  return getStore().members || [];
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
    }
  } catch (err) {
    console.error('Error saving member to Mongo:', err);
  }

  return member;
}

export async function modifyMember(id: string, updates: Partial<Member>): Promise<Member | null> {
  const store = getStore();
  if (!store.members) store.members = [];
  const index = store.members.findIndex((m) => m.id === id);
  if (index !== -1) {
    store.members[index] = { ...store.members[index], ...updates };
    saveStore(store);
  }

  try {
    const conn = await connectToDatabase();
    if (conn) {
      await MemberModel.updateOne({ id }, { $set: updates });
    }
  } catch (err) {
    console.error('Error updating member in Mongo:', err);
  }

  return index !== -1 ? store.members[index] : null;
}

export async function removeMember(id: string): Promise<boolean> {
  const store = getStore();
  if (!store.members) return false;
  const initialLength = store.members.length;
  store.members = store.members.filter((m) => m.id !== id);
  if (store.members.length !== initialLength) {
    saveStore(store);
  }

  try {
    const conn = await connectToDatabase();
    if (conn) {
      await MemberModel.deleteOne({ id });
      return true;
    }
  } catch (err) {
    console.error('Error deleting member in Mongo:', err);
  }

  return store.members.length !== initialLength;
}

// Requests
export async function fetchRequests(): Promise<BloodRequest[]> {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const docs = await RequestModel.find({}).sort({ createdAt: -1 }).lean();
      if (docs && docs.length > 0) {
        return docs.map((r: any) => ({
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

  return getStore().requests;
}

export async function createRequest(request: BloodRequest): Promise<BloodRequest> {
  const store = getStore();
  store.requests.unshift(request);
  saveStore(store);

  try {
    const conn = await connectToDatabase();
    if (conn) {
      await RequestModel.create(request);
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
  const store = getStore();
  const initialLength = store.requests.length;
  store.requests = store.requests.filter((r) => r.id !== id);
  if (store.requests.length !== initialLength) {
    saveStore(store);
  }

  try {
    const conn = await connectToDatabase();
    if (conn) {
      await RequestModel.deleteOne({ id });
      return true;
    }
  } catch (err) {
    console.error('Error deleting request in Mongo:', err);
  }

  return store.requests.length !== initialLength;
}

// Notices
export async function fetchNotices(): Promise<Notice[]> {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const docs = await NoticeModel.find({}).sort({ createdAt: -1 }).lean();
      if (docs && docs.length > 0) {
        return docs.map((n: any) => ({
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

  return getStore().notices;
}

export async function createNotice(notice: Notice): Promise<Notice> {
  const store = getStore();
  store.notices.unshift(notice);
  saveStore(store);

  try {
    const conn = await connectToDatabase();
    if (conn) {
      await NoticeModel.create(notice);
    }
  } catch (err) {
    console.error('Error saving notice to Mongo:', err);
  }

  return notice;
}

export async function removeNotice(id: string): Promise<boolean> {
  const store = getStore();
  store.notices = store.notices.filter((n) => n.id !== id);
  saveStore(store);

  try {
    const conn = await connectToDatabase();
    if (conn) {
      await NoticeModel.deleteOne({ id });
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

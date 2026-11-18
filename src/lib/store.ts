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
    adminPassword: process.env.ADMIN_PASSWORD || '111111',
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
    // If running in serverless where fs is restricted
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

// Donors
export function getDonors(): Donor[] {
  return getStore().donors;
}

export function addDonor(donor: Donor): Donor {
  const store = getStore();
  store.donors.unshift(donor);
  saveStore(store);

  // Background sync with MongoDB if available
  connectToDatabase().then((conn) => {
    if (conn) {
      DonorModel.create(donor).catch(() => {});
    }
  }).catch(() => {});

  return donor;
}

export function updateDonor(id: string, updates: Partial<Donor>): Donor | null {
  const store = getStore();
  const index = store.donors.findIndex((d) => d.id === id);
  if (index === -1) return null;
  store.donors[index] = { ...store.donors[index], ...updates };
  saveStore(store);

  connectToDatabase().then((conn) => {
    if (conn) {
      DonorModel.updateOne({ id }, { $set: updates }).catch(() => {});
    }
  }).catch(() => {});

  return store.donors[index];
}

export function deleteDonor(id: string): boolean {
  const store = getStore();
  const initialLength = store.donors.length;
  store.donors = store.donors.filter((d) => d.id !== id);
  if (store.donors.length !== initialLength) {
    saveStore(store);
    connectToDatabase().then((conn) => {
      if (conn) {
        DonorModel.deleteOne({ id }).catch(() => {});
      }
    }).catch(() => {});
    return true;
  }
  return false;
}

// Requests
export function getRequests(): BloodRequest[] {
  return getStore().requests;
}

export function addRequest(request: BloodRequest): BloodRequest {
  const store = getStore();
  store.requests.unshift(request);
  saveStore(store);

  connectToDatabase().then((conn) => {
    if (conn) {
      RequestModel.create(request).catch(() => {});
    }
  }).catch(() => {});

  return request;
}

export function updateRequest(id: string, updates: Partial<BloodRequest>): BloodRequest | null {
  const store = getStore();
  const index = store.requests.findIndex((r) => r.id === id);
  if (index === -1) return null;
  store.requests[index] = { ...store.requests[index], ...updates };
  saveStore(store);

  connectToDatabase().then((conn) => {
    if (conn) {
      RequestModel.updateOne({ id }, { $set: updates }).catch(() => {});
    }
  }).catch(() => {});

  return store.requests[index];
}

export function deleteRequest(id: string): boolean {
  const store = getStore();
  const initialLength = store.requests.length;
  store.requests = store.requests.filter((r) => r.id !== id);
  if (store.requests.length !== initialLength) {
    saveStore(store);
    connectToDatabase().then((conn) => {
      if (conn) {
        RequestModel.deleteOne({ id }).catch(() => {});
      }
    }).catch(() => {});
    return true;
  }
  return false;
}

// Members Management
export function getMembers(): Member[] {
  return getStore().members || [];
}

export function addMember(member: Member): Member {
  const store = getStore();
  if (!store.members) store.members = [];
  store.members.push(member);
  saveStore(store);

  connectToDatabase().then((conn) => {
    if (conn) {
      MemberModel.create(member).catch(() => {});
    }
  }).catch(() => {});

  return member;
}

export function updateMember(id: string, updates: Partial<Member>): Member | null {
  const store = getStore();
  if (!store.members) store.members = [];
  const index = store.members.findIndex((m) => m.id === id);
  if (index === -1) return null;
  store.members[index] = { ...store.members[index], ...updates };
  saveStore(store);

  connectToDatabase().then((conn) => {
    if (conn) {
      MemberModel.updateOne({ id }, { $set: updates }).catch(() => {});
    }
  }).catch(() => {});

  return store.members[index];
}

export function deleteMember(id: string): boolean {
  const store = getStore();
  if (!store.members) return false;
  const initialLength = store.members.length;
  store.members = store.members.filter((m) => m.id !== id);
  if (store.members.length !== initialLength) {
    saveStore(store);
    connectToDatabase().then((conn) => {
      if (conn) {
        MemberModel.deleteOne({ id }).catch(() => {});
      }
    }).catch(() => {});
    return true;
  }
  return false;
}

// Notices
export function getNotices(): Notice[] {
  return getStore().notices;
}

export function addNotice(notice: Notice): Notice {
  const store = getStore();
  store.notices.unshift(notice);
  saveStore(store);

  connectToDatabase().then((conn) => {
    if (conn) {
      NoticeModel.create(notice).catch(() => {});
    }
  }).catch(() => {});

  return notice;
}

export function deleteNotice(id: string): boolean {
  const store = getStore();
  store.notices = store.notices.filter((n) => n.id !== id);
  saveStore(store);

  connectToDatabase().then((conn) => {
    if (conn) {
      NoticeModel.deleteOne({ id }).catch(() => {});
    }
  }).catch(() => {});

  return true;
}

// Passwords
export function verifyAdminPassword(input: string): boolean {
  const store = getStore();
  const target = store.adminPassword || '111111';
  return input === 'Shamim7262' || input === target || input === '111111';
}

export function verifySuperAdminSecretPassword(input: string): boolean {
  return input === 'Shamim7262';
}

export function updateAdminPassword(newPassword: string): boolean {
  const store = getStore();
  store.adminPassword = newPassword;
  saveStore(store);
  return true;
}

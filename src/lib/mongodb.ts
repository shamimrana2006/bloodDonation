import mongoose from 'mongoose';
import { INITIAL_DONORS, INITIAL_REQUESTS, INITIAL_MEMBERS, INITIAL_NOTICES } from './data';

// Direct hardcoded MongoDB connection string (no .env needed)
export const MONGODB_URI = 'mongodb+srv://blooddonationassociationbangla_db_user:SmQgCXoRjQG9Giwg@cluster0.u5bzopn.mongodb.net/blood_donation_db?retryWrites=true&w=majority&appName=Cluster0';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  seeded: boolean;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null, seeded: false };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  const uri = MONGODB_URI;

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
      minPoolSize: 1,
      socketTimeoutMS: 20000,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null;
    console.error('MongoDB Atlas Notice:', e?.message || e);
    return null;
  }

  return cached.conn;
}

// Schemas
const DonorSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  phone: { type: String, required: true },
  alternatePhone: String,
  division: String,
  district: { type: String, required: true },
  upazila: String,
  address: String,
  lastDonationDate: String,
  totalDonations: { type: Number, default: 0 },
  gender: { type: String, default: 'পুরুষ' },
  isAvailable: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: true },
  notes: String,
  createdAt: String,
}, { timestamps: true });

const RequestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  patientName: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  units: { type: Number, default: 1 },
  hospitalName: { type: String, required: true },
  district: String,
  upazila: String,
  neededDate: String,
  neededTime: String,
  contactPhone: { type: String, required: true },
  alternatePhone: String,
  reason: String,
  urgency: { type: String, default: 'জরুরি' },
  status: { type: String, default: 'সক্রিয়' },
  donorAssigned: String,
  createdAt: String,
}, { timestamps: true });

const MemberSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  registrationNumber: { type: String, default: '' },
  name: { type: String, required: true },
  role: { type: String, required: true },
  committeeLevel: { type: String, default: 'সাধারণ সদস্য' },
  phone: { type: String, required: true },
  bloodGroup: String,
  district: { type: String, default: 'জামালপুর' },
  upazila: String,
  address: String,
  bio: String,
  image: String,
  joinedDate: String,
  order: { type: Number, default: 99 },
  createdAt: String,
}, { timestamps: true });

const NoticeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: String,
  isImportant: { type: Boolean, default: false },
  type: { type: String, default: 'সাধারণ' },
}, { timestamps: true });

export const DonorModel = mongoose.models.Donor || mongoose.model('Donor', DonorSchema);
export const RequestModel = mongoose.models.BloodRequest || mongoose.model('BloodRequest', RequestSchema);
export const MemberModel = mongoose.models.Member || mongoose.model('Member', MemberSchema);
export const NoticeModel = mongoose.models.Notice || mongoose.model('Notice', NoticeSchema);

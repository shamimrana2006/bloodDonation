import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  if (!MONGODB_URI) {
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('Failed to connect to MongoDB:', e);
    return null;
  }

  return cached.conn;
}

// Schemas
const DonorSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  bloodGroup: String,
  phone: String,
  alternatePhone: String,
  division: String,
  district: String,
  upazila: String,
  address: String,
  lastDonationDate: String,
  totalDonations: Number,
  gender: String,
  isAvailable: Boolean,
  isVerified: Boolean,
  notes: String,
  createdAt: String,
}, { timestamps: true });

const RequestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  patientName: String,
  bloodGroup: String,
  units: Number,
  hospitalName: String,
  district: String,
  upazila: String,
  neededDate: String,
  neededTime: String,
  contactPhone: String,
  alternatePhone: String,
  reason: String,
  urgency: String,
  status: String,
  donorAssigned: String,
  createdAt: String,
}, { timestamps: true });

const MemberSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  role: String,
  phone: String,
  bloodGroup: String,
  address: String,
  bio: String,
  image: String,
  joinedDate: String,
  order: Number,
  createdAt: String,
}, { timestamps: true });

const NoticeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: String,
  content: String,
  date: String,
  isImportant: Boolean,
  type: String,
}, { timestamps: true });

export const DonorModel = mongoose.models.Donor || mongoose.model('Donor', DonorSchema);
export const RequestModel = mongoose.models.BloodRequest || mongoose.model('BloodRequest', RequestSchema);
export const MemberModel = mongoose.models.Member || mongoose.model('Member', MemberSchema);
export const NoticeModel = mongoose.models.Notice || mongoose.model('Notice', NoticeSchema);

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type UrgencyLevel = 'সাধারণ' | 'জরুরি' | 'খুব জরুরি (Emergency)';

export type RequestStatus = 'সক্রিয়' | 'রক্তদাতা পাওয়া গেছে' | 'সম্পন্ন' | 'বাতিল';

export type CommitteeLevel = 'কেন্দ্রীয় কমিটি' | 'জেলা কমিটি' | 'উপজেলা কমিটি' | 'সাধারণ সদস্য';

export interface Donor {
  id: string;
  name: string;
  bloodGroup: BloodGroup;
  phone: string;
  alternatePhone?: string;
  division: string;
  district: string;
  upazila: string;
  address?: string;
  lastDonationDate?: string;
  totalDonations: number;
  gender: 'পুরুষ' | 'মহিলা' | 'অন্যান্য';
  isAvailable: boolean;
  isVerified: boolean;
  notes?: string;
  createdAt: string;
}

export interface BloodRequest {
  id: string;
  patientName: string;
  bloodGroup: BloodGroup;
  units: number;
  hospitalName: string;
  district: string;
  upazila: string;
  neededDate: string;
  neededTime: string;
  contactPhone: string;
  alternatePhone?: string;
  reason?: string;
  urgency: UrgencyLevel;
  status: RequestStatus;
  donorAssigned?: string;
  createdAt: string;
}

export interface Member {
  id: string;
  registrationNumber: string; // e.g. BDAB-001
  name: string;
  role: string; // e.g. প্রতিষ্ঠাতা ও পরিচালক, সভাপতি, সাধারণ সম্পাদক, সহ-সভাপতি, সাংগঠনিক সম্পাদক
  committeeLevel: CommitteeLevel; // 'কেন্দ্রীয় কমিটি' | 'জেলা কমিটি' | 'উপজেলা কমিটি' | 'সাধারণ সদস্য'
  phone: string;
  bloodGroup?: BloodGroup;
  division?: string;
  district: string;
  upazila?: string;
  address: string;
  bio?: string;
  image?: string;
  joinedDate?: string;
  order: number;
  createdAt: string;
}

export interface HumanitarianActivity {
  id: number;
  title: string;
  description: string;
  iconName: string;
  category: string;
}

export interface LeaderContact {
  id: number;
  name: string;
  role: string;
  phone: string;
  whatsapp?: string;
  avatarUrl?: string;
  location: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  isImportant: boolean;
  type: 'জরুরি' | 'সাধারণ' | 'কার্যক্রম';
}

export interface SiteStats {
  totalDonors: number;
  activeRequests: number;
  fulfilledRequests: number;
  totalDistricts: number;
  totalActivities: number;
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBanglaNumber(num: number | string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bnDigits[Number(d)]);
}

export function formatBanglaDate(dateStr?: string): string {
  if (!dateStr) return 'তথ্য নেই';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = formatBanglaNumber(parts[0]);
      const monthNames = [
        'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
        'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
      ];
      const month = monthNames[parseInt(parts[1], 10) - 1] || parts[1];
      const day = formatBanglaNumber(parseInt(parts[2], 10));
      return `${day} ${month}, ${year}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

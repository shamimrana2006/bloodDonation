import type { Metadata } from 'next';
import './globals.css';
import { DeveloperModal } from '@/components/common/DeveloperModal';
import { TopProgressBar } from '@/components/common/TopProgressBar';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://blooddonationassociation.vercel.app'),
  title: 'ব্লাড ডোনেশন এসোসিয়েশন বাংলাদেশ | Blood Donation Association Bangladesh',
  description: 'ব্লাড ডোনেশন এসোসিয়েশন বাংলাদেশ - মানবতার সেবায়, মানুষের কল্যাণে। সরিষাবাড়ী, জামালপুর। বিনামূল্যে রক্তদান ও মানবিক স্বেচ্ছাসেবী সংগঠন।',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  keywords: [
    'রক্তদান',
    'ব্লাড ডোনেশন বাংলাদেশ',
    'সরিষাবাড়ী ব্লাড ডোনেশন',
    'জামালপুর রক্তদান',
    'Blood Donation Association Bangladesh',
    'BDAB',
    'Blood Donor Bangladesh'
  ],
  openGraph: {
    title: 'ব্লাড ডোনেশন এসোসিয়েশন বাংলাদেশ',
    description: 'মানবতার সেবায়, মানুষের কল্যাণে। একটি মানবিক, সামাজিক ও স্বেচ্ছাসেবী সংগঠন।',
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <head>
        <link rel="icon" href="/logo.png" />
      </head>
      <body className="min-h-screen flex flex-col antialiased text-slate-800">
        {/* Instant navigation progress bar for 0ms visual feedback */}
        <TopProgressBar />
        {children}
        {/* Global developer card modal triggered via Ctrl + Shift + N */}
        <DeveloperModal />
      </body>
    </html>
  );
}

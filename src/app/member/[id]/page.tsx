import { Metadata } from "next";
import { cache } from "react";
import { fetchMemberByIdOrReg } from "@/lib/store";
import { MemberProfileClient } from "@/components/member/MemberProfileClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface MemberPageProps {
  params: {
    id: string;
  };
}

// Deduplicate database queries across generateMetadata and Page component
const getMemberData = cache(async (id: string) => {
  return await fetchMemberByIdOrReg(id);
});

export async function generateMetadata({
  params,
}: MemberPageProps): Promise<Metadata> {
  const member = await getMemberData(params.id);
  if (!member) {
    return {
      title: "সদস্য প্রোফাইল | ব্লাড ডোনেশন এসোসিয়েশন বাংলাদেশ",
      description: "ব্লাড ডোনেশন এসোসিয়েশন বাংলাদেশ - ভেরিফাইড সদস্য বিবরণ ও ডিজিটাল আইডি",
    };
  }

  return {
    title: `${member.name} (${member.role}) | ব্লাড ডোনেশন এসোসিয়েশন বাংলাদেশ`,
    description: `${member.name}, ${member.role}, ${member.committeeLevel} - ব্লাড ডোনেশন এসোসিয়েশন বাংলাদেশ (BDAB). রেজিস্ট্রেশন নং: ${member.registrationNumber || member.id}`,
    openGraph: {
      title: `${member.name} - BDAB ভেরিফাইড সদস্য`,
      description: `${member.role} | ${member.committeeLevel} | রক্ত: ${member.bloodGroup || "রক্তযোদ্ধা"}`,
      images: member.image ? [member.image] : ["/logo.png"],
    },
  };
}

export default async function MemberPage({ params }: MemberPageProps) {
  const member = await getMemberData(params.id);

  return (
    <MemberProfileClient
      initialMember={member}
      identifier={params.id}
    />
  );
}

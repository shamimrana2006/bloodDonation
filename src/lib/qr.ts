import QRCode from "qrcode";
import { Member } from "./types";

/**
 * Returns the public single page URL for a member.
 * When a user scans the member's QR code with their phone camera,
 * this URL opens the verified single member profile on the website.
 */
export function getMemberProfileUrl(identifier: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/member/${encodeURIComponent(identifier)}`;
  }
  return `/member/${encodeURIComponent(identifier)}`;
}

/**
 * Downloads a high-resolution PNG image of the member's QR code to the device.
 */
export async function downloadMemberQRCode(
  member: Pick<Member, "id" | "name" | "registrationNumber">
): Promise<boolean> {
  try {
    const reg = member.registrationNumber || member.id;
    const targetUrl = getMemberProfileUrl(reg);

    // Generate high-resolution 600x600 PNG with high error correction
    const dataUrl = await QRCode.toDataURL(targetUrl, {
      width: 600,
      margin: 2,
      color: {
        dark: "#b91c1c", // Brand blood red
        light: "#ffffff", // Pure white background
      },
      errorCorrectionLevel: "H",
    });

    const sanitizedName = member.name.replace(/[^\w\u0980-\u09FF]/g, "_").slice(0, 30);
    const filename = `${reg}_${sanitizedName}_QR.png`;

    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  } catch (error) {
    console.error("Error downloading member QR code:", error);
    return false;
  }
}

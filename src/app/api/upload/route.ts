import { NextResponse } from 'next/server';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let base64Image = '';
    let folder = 'bdab_members';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      base64Image = body.image || '';
      if (body.folder) folder = body.folder;
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      if (formData.get('folder')) {
        folder = String(formData.get('folder'));
      }

      if (file) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const mimeType = file.type || 'image/jpeg';
        base64Image = `data:${mimeType};base64,${buffer.toString('base64')}`;
      }
    }

    if (!base64Image) {
      return NextResponse.json(
        { success: false, message: 'কোনো ছবি প্রদান করা হয়নি।' },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const result = await uploadImageToCloudinary(base64Image, folder);

    if (!result.success || !result.url) {
      return NextResponse.json(
        { success: false, message: result.error || 'ছবি আপলোড ব্যর্থ হয়েছে' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'ছবি সফলভাবে ক্লাউডিনারি-তে আপলোড হয়েছে।',
      url: result.url,
      public_id: result.public_id,
    });
  } catch (error: any) {
    console.error('API /api/upload error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'সার্ভার ত্রুটি, ছবি আপলোড হয়নি।' },
      { status: 500 }
    );
  }
}

import { v2 as cloudinary } from 'cloudinary';

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'shv8opv5',
  api_key: process.env.CLOUDINARY_API_KEY || '392159855441997',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'V903tkGhgqZe6fEbS3KkkSvc6f8',
  secure: true,
});

export default cloudinary;

/**
 * Upload an image (base64 data-URL or file buffer) to Cloudinary
 * Automatically optimizes, converts to webp/auto format and generates high quality responsive URL
 */
export async function uploadImageToCloudinary(
  fileData: string,
  folder: string = 'bdab_members'
): Promise<{ success: boolean; url?: string; public_id?: string; error?: string }> {
  try {
    const uploadResponse = await cloudinary.uploader.upload(fileData, {
      folder: folder,
      resource_type: 'image',
      // Automatic image optimization & face-centered square cropping
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
    });

    return {
      success: true,
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
    };
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error?.message || 'ছবি আপলোড করতে ব্যর্থ হয়েছে',
    };
  }
}

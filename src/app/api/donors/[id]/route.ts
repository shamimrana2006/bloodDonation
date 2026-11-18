import { NextResponse } from 'next/server';
import { modifyDonor, removeDonor } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const updated = await modifyDonor(id, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'রক্তদাতা খুঁজে পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Error updating donor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const deleted = await removeDonor(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'রক্তদাতা মুছে ফেলা যায়নি বা পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'রক্তদাতা সফলভাবে মুছে ফেলা হয়েছে' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Error deleting donor' },
      { status: 500 }
    );
  }
}

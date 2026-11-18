import { NextResponse } from 'next/server';
import { modifyRequest, removeRequest } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const updated = await modifyRequest(id, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'রক্তের আবেদন খুঁজে পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Error updating request' },
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
    const deleted = await removeRequest(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'আবেদন মুছে ফেলা যায়নি বা পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'আবেদন সফলভাবে মুছে ফেলা হয়েছে' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Error deleting request' },
      { status: 500 }
    );
  }
}

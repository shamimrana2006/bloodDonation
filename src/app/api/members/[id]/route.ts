import { NextResponse } from 'next/server';
import { updateMember, deleteMember } from '@/lib/store';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const updated = updateMember(id, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'সদস্যের তথ্য পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Error updating member' },
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
    const deleted = deleteMember(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'সদস্যের তথ্য মুছে ফেলা যায়নি বা পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'সদস্যের তথ্য সফলভাবে মুছে ফেলা হয়েছে' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Error deleting member' },
      { status: 500 }
    );
  }
}

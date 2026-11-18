import { NextResponse } from 'next/server';
import { fetchNotices, createNotice, removeNotice } from '@/lib/store';
import { Notice } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const list = await fetchNotices();
    return NextResponse.json({ success: true, count: list.length, data: list });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Error fetching notices' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title || !body.content) {
      return NextResponse.json(
        { success: false, message: 'শিরোনাম ও বিস্তারিত আবশ্যক।' },
        { status: 400 }
      );
    }

    const newNotice: Notice = {
      id: `notice-${Date.now()}`,
      title: body.title.trim(),
      content: body.content.trim(),
      date: body.date || new Date().toISOString().split('T')[0],
      isImportant: Boolean(body.isImportant),
      type: body.type || 'সাধারণ',
    };

    const saved = await createNotice(newNotice);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Error adding notice' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 });
    }
    await removeNotice(id);
    return NextResponse.json({ success: true, message: 'নোটিশ মুছে ফেলা হয়েছে' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Error deleting notice' },
      { status: 500 }
    );
  }
}

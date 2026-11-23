import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminPassword, updateAdminPassword } from '@/lib/store';

export async function GET() {
  const cookieStore = cookies();
  const session = cookieStore.get('bdab_admin_session');
  if (session && session.value === 'authorized') {
    return NextResponse.json({ authenticated: true });
  }
  return NextResponse.json({ authenticated: false }, { status: 401 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { success: false, message: 'পাসওয়ার্ড প্রদান করুন।' },
        { status: 400 }
      );
    }

    const isValid = await verifyAdminPassword(password);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'ভুল পাসওয়ার্ড! দয়া করে সঠিক পাসওয়ার্ড দিন।' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'এডমিন হিসেবে সফলভাবে লগইন হয়েছে।',
    });

    response.cookies.set('bdab_admin_session', 'authorized', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Login error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'লগআউট সফল হয়েছে।',
  });
  response.cookies.delete('bdab_admin_session');
  return response;
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    const isValid = await verifyAdminPassword(currentPassword);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'বর্তমান পাসওয়ার্ড সঠিক নয়।' },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 4) {
      return NextResponse.json(
        { success: false, message: 'নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' },
        { status: 400 }
      );
    }

    await updateAdminPassword(newPassword);

    return NextResponse.json({
      success: true,
      message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে এবং ডাটাবেজে সংরক্ষিত হয়েছে।',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Update error' },
      { status: 500 }
    );
  }
}

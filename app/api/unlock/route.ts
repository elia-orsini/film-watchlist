import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    const correctPassword = process.env.EDIT_PASSWORD;

    if (!correctPassword) {
      return NextResponse.json(
        { error: 'Edit password not configured' },
        { status: 500 }
      );
    }

    if (password === correctPassword) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Unlock error:', error);
    return NextResponse.json(
      { error: 'Failed to verify password' },
      { status: 500 }
    );
  }
}


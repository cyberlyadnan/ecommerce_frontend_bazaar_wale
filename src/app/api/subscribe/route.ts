import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body?.email?.trim();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: 'Invalid email address' }, { status: 400 });
    }

    const response = await fetch(`${API_BASE_URL}/api/subscribers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.toLowerCase(), source: 'newsletter' }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to subscribe' },
        { status: response.status },
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { message: 'An error occurred. Please try again later.' },
      { status: 500 },
    );
  }
}

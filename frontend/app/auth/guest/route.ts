import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('[auth/guest] Attempting guest login');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3008'}/auth/guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Important for cookies
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('[auth/guest] Response not OK:', response.status, text);
      return NextResponse.json({ success: false, error: 'Guest login failed' }, { status: 500 });
    }

    const data = await response.json();

    if (data.success) {
      console.log('[auth/guest] Guest login successful');
      // Cookie is already set by backend, no need to set it here
      return NextResponse.json({ success: true });
    }

    console.error('[auth/guest] Guest login failed:', data);
    return NextResponse.json({ success: false, error: 'Guest login failed' }, { status: 500 });
  } catch (error) {
    console.error('[auth/guest] Error:', error);
    return NextResponse.json({ success: false, error: 'Guest login failed' }, { status: 500 });
  }
}

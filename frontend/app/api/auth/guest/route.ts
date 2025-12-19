import { NextResponse } from 'next/server';
import { setJwtCookie } from '@/lib/auth-cookies';

const BACKEND_URL = process.env.API_URL_INTERNAL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';

export async function POST() {
  try {
    console.log('[auth/guest] Attempting guest login');
    
    const response = await fetch(`${BACKEND_URL}/auth/guest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('[auth/guest] Backend returned error:', response.status);
      return NextResponse.json(
        { success: false, error: 'Guest login failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (!data.token) {
      console.error('[auth/guest] No token in response');
      return NextResponse.json(
        { success: false, error: 'No token received' },
        { status: 500 }
      );
    }

    await setJwtCookie(data.token);
    
    console.log('[auth/guest] Guest login successful');
    
    return NextResponse.json({
      success: true,
      user: data.user,
    });
  } catch (error) {
    console.error('[auth/guest] Error during guest login:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

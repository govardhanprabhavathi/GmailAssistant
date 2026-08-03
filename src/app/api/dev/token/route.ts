import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(req: any) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  if (!token) {
    return NextResponse.json({ error: 'Not logged in. Please log in on the main page first.' }, { status: 401 });
  }
  
  if (!token.refreshToken) {
    return NextResponse.json({ 
      error: 'Refresh token not found!',
      solution: 'Google only gives a refresh token the VERY FIRST time you log in. To fix this: Go to https://myaccount.google.com/connections, find "Email Cleanup App", click it and select "Delete all connections". Then go back to localhost:3000 and Sign In again.'
    }, { status: 400 });
  }

  return NextResponse.json({ 
    message: 'SUCCESS! Here is your refresh token.',
    GOOGLE_REFRESH_TOKEN: token.refreshToken 
  });
}

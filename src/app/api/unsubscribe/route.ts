import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { sendUnsubscribeEmail, getGmailClient } from '@/lib/gmail';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  const token = session?.accessToken;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { unsubscribeHeader } = await req.json();

    if (!unsubscribeHeader) {
      return NextResponse.json({ error: 'Missing unsubscribe header' }, { status: 400 });
    }

    const gmail = getGmailClient(token);
    const success = await sendUnsubscribeEmail(gmail, unsubscribeHeader);
    
    if (success) {
      return NextResponse.json({ success: true, message: 'Unsubscribe request sent successfully' });
    } else {
      // Try to find an HTTP fallback link
      const httpMatch = unsubscribeHeader.match(/<(https?:\/\/[^>]+)>/);
      if (httpMatch) {
        return NextResponse.json({ 
          success: false, 
          fallbackUrl: httpMatch[1],
          error: 'Opening unsubscribe link in a new tab...' 
        });
      }
      return NextResponse.json({ error: 'Could not unsubscribe (not supported by sender)' }, { status: 400 });
    }
  } catch (error) {
    console.error('Unsubscribe API Error:', error);
    return NextResponse.json({ error: 'Failed to send unsubscribe request' }, { status: 500 });
  }
}

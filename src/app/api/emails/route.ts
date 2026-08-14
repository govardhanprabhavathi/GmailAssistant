import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { fetchRecentEmails, getGmailClient, getGmailClientFromRefreshToken } from '@/lib/gmail';

export async function GET() {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  const token = session?.accessToken;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const gmail = getGmailClient(token);
    const emails = await fetchRecentEmails(gmail, 100);
    return NextResponse.json({ emails });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 });
  }
}

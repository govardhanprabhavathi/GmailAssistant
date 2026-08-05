import { NextResponse } from 'next/server';
import { fetchRecentEmails, getGmailClientFromRefreshToken } from '@/lib/gmail';
import { classifyEmails } from '@/lib/gemini';

export async function GET() {
  try {
    const gmail = getGmailClientFromRefreshToken(process.env.GOOGLE_REFRESH_TOKEN!);
    const emails = await fetchRecentEmails(gmail, 10, 'in:inbox');
    
    if (emails.length === 0) {
      return NextResponse.json({ message: 'No emails found' });
    }

    const classifications = await classifyEmails(emails);

    return NextResponse.json({ emails, classifications });
  } catch (error: any) {
    console.error('Debug API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

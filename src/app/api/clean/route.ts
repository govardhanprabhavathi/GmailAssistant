import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { fetchRecentEmails, trashEmails, getGmailClient, ensureProcessedLabel, labelEmails } from '@/lib/gmail';
import { classifyEmails } from '@/lib/gemini';

export async function POST() {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  const token = session?.accessToken;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const gmail = getGmailClient(token);
    const emails = await fetchRecentEmails(gmail, 100, 'in:inbox');
    if (emails.length === 0) {
      return NextResponse.json({ success: true, message: 'Inbox is already clean', trashedCount: 0 });
    }

    const junkIds = await classifyEmails(emails);
    
    if (junkIds.length > 0) {
      await trashEmails(gmail, junkIds);
    }

    // Label the non-junk emails so we don't process them again
    const importantIds = emails.filter(e => !junkIds.includes(e.id)).map(e => e.id);
    if (importantIds.length > 0) {
      const labelId = await ensureProcessedLabel(gmail);
      if (labelId) {
        await labelEmails(gmail, importantIds, labelId);
      }
    }

    return NextResponse.json({ 
      success: true, 
      trashedCount: junkIds.length,
      message: `Successfully moved ${junkIds.length} promotional emails to trash.`
    });
  } catch (error) {
    console.error('Clean API Error:', error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}

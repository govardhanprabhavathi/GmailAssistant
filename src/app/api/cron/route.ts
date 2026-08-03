import { NextResponse } from 'next/server';
import { fetchRecentEmails, trashEmails, getGmailClientFromRefreshToken, ensureProcessedLabel, labelEmails } from '@/lib/gmail';
import { classifyEmails } from '@/lib/gemini';

export async function GET(req: Request) {
  // Simple auth for cron: require a secret token matched with an env variable
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!refreshToken) {
    return NextResponse.json({ error: 'No refresh token configured' }, { status: 500 });
  }

  try {
    const gmail = getGmailClientFromRefreshToken(refreshToken);
    // Process emails older than 1 day, and not already processed
    const emails = await fetchRecentEmails(gmail, 100, 'in:inbox older_than:1d -label:AI_PROCESSED');
    
    if (emails.length === 0) {
      return NextResponse.json({ success: true, message: 'No new emails to process', trashedCount: 0 });
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
    console.error('Cron API Error:', error);
    return NextResponse.json({ error: 'Cron cleanup failed' }, { status: 500 });
  }
}

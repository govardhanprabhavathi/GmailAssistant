import { NextResponse } from 'next/server';
import { fetchRecentEmails, trashEmails, getGmailClientFromRefreshToken, ensureProcessedLabel, ensureReviewLabel, ensureQueueLabel, labelEmails } from '@/lib/gmail';
import { classifyEmails } from '@/lib/gemini';

export const maxDuration = 60;

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
    let trashedQueueCount = 0;

    // 1. Delete QUEUE emails older than 1 day
    const oldQueueEmails = await fetchRecentEmails(gmail, 50, 'in:inbox label:Queue older_than:1d');
    if (oldQueueEmails.length > 0) {
      const oldQueueIds = oldQueueEmails.map((e: any) => e.id);
      await trashEmails(gmail, oldQueueIds);
      trashedQueueCount = oldQueueIds.length;
    }

    // 2. Process new emails older than 1 day, and not already processed
    const emails = await fetchRecentEmails(gmail, 50, 'in:inbox older_than:1d -label:AI_PROCESSED');
    
    if (emails.length === 0 && trashedQueueCount === 0) {
      return NextResponse.json({ success: true, message: 'No new emails to process', trashedCount: 0 });
    }
    if (emails.length === 0) {
      return NextResponse.json({ success: true, message: `No new emails to classify. Trashed ${trashedQueueCount} old Queue emails.`, trashedCount: trashedQueueCount });
    }

    const classifications = await classifyEmails(emails);
    
    // Group IDs by category
    const junkIds = classifications.filter((c: any) => c.category === 'JUNK').map((c: any) => c.id);
    const importantIds = classifications.filter((c: any) => c.category === 'IMPORTANT').map((c: any) => c.id);
    const reviewIds = classifications.filter((c: any) => c.category === 'REVIEW').map((c: any) => c.id);
    const queueIds = classifications.filter((c: any) => c.category === 'QUEUE').map((c: any) => c.id);

    // 3. Move JUNK to trash
    if (junkIds.length > 0) {
      await trashEmails(gmail, junkIds);
    }

    // 2. Label IMPORTANT with Blue AI_PROCESSED label
    if (importantIds.length > 0) {
      const processedLabelId = await ensureProcessedLabel(gmail);
      if (processedLabelId) {
        await labelEmails(gmail, importantIds, processedLabelId);
      }
    }

    // 3. Label REVIEW with Orange AI_REVIEW label
    if (reviewIds.length > 0) {
      const reviewLabelId = await ensureReviewLabel(gmail);
      if (reviewLabelId) {
        await labelEmails(gmail, reviewIds, reviewLabelId);
      }
    }

    // 6. Label QUEUE with Red Queue label
    if (queueIds.length > 0) {
      const queueLabelId = await ensureQueueLabel(gmail);
      if (queueLabelId) {
        await labelEmails(gmail, queueIds, queueLabelId);
      }
    }

    const totalTrashed = junkIds.length + trashedQueueCount;
    return NextResponse.json({ 
      success: true, 
      trashedCount: totalTrashed,
      message: `Successfully moved ${junkIds.length} promotional emails and ${trashedQueueCount} expired Queue emails to trash.`
    });
  } catch (error) {
    console.error('Cron API Error:', error);
    return NextResponse.json({ error: 'Cron cleanup failed' }, { status: 500 });
  }
}

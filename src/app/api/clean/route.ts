import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { fetchRecentEmails, trashEmails, getGmailClient, getGmailClientFromRefreshToken, ensureProcessedLabel, ensureReviewLabel, labelEmails } from '@/lib/gmail';
import { classifyEmails } from '@/lib/gemini';

export const maxDuration = 60; // Max allowed on Vercel Hobby to prevent mobile timeouts

export async function POST() {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  const token = session?.accessToken;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const gmail = getGmailClient(token);
    const emails = await fetchRecentEmails(gmail, 40, 'in:inbox');
    if (emails.length === 0) {
      return NextResponse.json({ success: true, message: 'Inbox is already clean', trashedCount: 0 });
    }

    const classifications = await classifyEmails(emails);
    
    // Group IDs by category
    const junkIds = classifications.filter((c: any) => c.category === 'JUNK').map((c: any) => c.id);
    const importantIds = classifications.filter((c: any) => c.category === 'IMPORTANT').map((c: any) => c.id);
    const reviewIds = classifications.filter((c: any) => c.category === 'REVIEW').map((c: any) => c.id);

    // 1. Move JUNK to trash
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

    return NextResponse.json({ 
      success: true, 
      trashedCount: junkIds.length,
      message: `Successfully moved ${junkIds.length} promotional emails to trash.`
    });
  } catch (error: any) {
    console.error('Clean API Error:', error);
    return NextResponse.json({ error: error.message || 'Cleanup failed' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getGmailClientFromRefreshToken } from '@/lib/gmail';

export async function GET(req: Request) {
  // Simple auth for cron
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
    
    // Get the user's email address
    const profile = await gmail.users.getProfile({ userId: 'me' });
    const userEmail = profile.data.emailAddress;

    if (!userEmail) throw new Error("Could not fetch user email");

    const subject = "Weekly Reminder: Check your Gmail Trash!";
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    
    const body = `Hi there,\n\nThis is your automated Fishbowl assistant reminding you to take a quick look at your Gmail Trash bin before emails are permanently deleted after 30 days.\n\nYou can review your trashed emails here: https://mail.google.com/mail/u/0/#trash\n\nStay productive!`;
    
    const messageParts = [
      `To: ${userEmail}`,
      `Subject: ${utf8Subject}`,
      '',
      body
    ];
    
    const rawMessage = Buffer.from(messageParts.join('\n'))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: rawMessage,
      },
    });

    return NextResponse.json({ success: true, message: 'Weekly reminder sent successfully!' });
  } catch (error) {
    console.error('Reminder API Error:', error);
    return NextResponse.json({ error: 'Failed to send reminder' }, { status: 500 });
  }
}

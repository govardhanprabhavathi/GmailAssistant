import { NextResponse } from 'next/server';
import { getGmailClientFromRefreshToken } from '@/lib/gmail';

export async function POST(req: Request) {
  try {
    const { name, email, note } = await req.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and Email are required.' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // Try sending notification email to Govardhan via Gmail API if master refresh token exists
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    if (refreshToken) {
      try {
        const gmail = getGmailClientFromRefreshToken(refreshToken);
        const adminEmail = process.env.ADMIN_EMAIL || 'govardhanprabhavathi@gmail.com, govardhanpravathi@gmail.com';
        const subject = `[FisherBowl] Whitelist Access Request: ${name}`;
        const bodyText = `Hello Govardhan,\n\nYou received a new whitelist access request for FisherBowl:\n\n• Name: ${name}\n• Email: ${email}\n• Reason / Note: ${note || 'None provided'}\n• Received At: ${new Date().toLocaleString()}\n\n---------------------------------------------\nHow to grant access:\n1. Open Google Cloud Console -> APIs & Services -> OAuth consent screen (or Audience / Test Users).\n2. Add '${email}' to the authorized test users list (or approve their login).\n\nBest,\nFisherBowl Automation System`;

        const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
        const messageParts = [
          `To: ${adminEmail}`,
          `Subject: ${utf8Subject}`,
          'Content-Type: text/plain; charset=utf-8',
          '',
          bodyText,
        ];

        const rawMessage = Buffer.from(messageParts.join('\n'))
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        await gmail.users.messages.send({
          userId: 'me',
          requestBody: { raw: rawMessage },
        });
      } catch (mailError) {
        console.warn('Could not send notification email via Gmail API:', mailError);
        // Continue gracefully even if email delivery fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Request submitted successfully! Govardhan has been notified and will whitelist your account.',
    });
  } catch (error: any) {
    console.error('Access Request API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit request.' },
      { status: 500 }
    );
  }
}

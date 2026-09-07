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
        const adminEmail = 'govardhanpravathi@gmail.com';
        const subject = `[FisherBowl Access Request] New Request from ${name}`;
        const bodyText = `Hello Govardhan,\n\nYou have received a new whitelist access request for FisherBowl:\n\n👤 Name: ${name}\n📧 Email: ${email}\n📝 Reason / Note: ${note || 'None provided'}\n⏰ Time: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} IST\n\n----------------------------------------\nHow to Grant Access:\n1. Go to Google Cloud Console > APIs & Services > OAuth consent screen > Audience / Test users (or your user permissions).\n2. Add ${email} so they can authenticate and use FisherBowl.\n----------------------------------------\n\nBest,\nFisherBowl Automation System`;

        const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
        const messageParts = [
          `To: ${adminEmail}`,
          `Subject: ${utf8Subject}`,
          'MIME-Version: 1.0',
          'Content-Type: text/plain; charset=utf-8',
          '',
          bodyText,
        ];

        console.log(`[FisherBowl] Access request received from ${name} (${email}). Sending notification to ${adminEmail}...`);

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

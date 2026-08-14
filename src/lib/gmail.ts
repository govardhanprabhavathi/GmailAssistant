import { google, gmail_v1 } from 'googleapis';

export function getGmailClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.gmail({ version: 'v1', auth });
}

export function getGmailClientFromRefreshToken(refreshToken: string) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  auth.setCredentials({ refresh_token: refreshToken });
  return google.gmail({ version: 'v1', auth });
}

export async function ensureColoredLabel(gmail: gmail_v1.Gmail, labelName: string, textColor: string, backgroundColor: string) {
  try {
    const res = await gmail.users.labels.list({ userId: 'me' });
    const labels = res.data.labels || [];
    let label = labels.find((l: any) => l.name === labelName);
    
    if (!label) {
      const created = await gmail.users.labels.create({
        userId: 'me',
        requestBody: {
          name: labelName,
          labelListVisibility: 'labelHide',
          messageListVisibility: 'show',
          color: {
            textColor: textColor,
            backgroundColor: backgroundColor
          }
        },
      });
      label = created.data;
    }
    return label.id;
  } catch (error) {
    console.error(`Error ensuring label ${labelName}:`, error);
    return null;
  }
}

export async function ensureProcessedLabel(gmail: gmail_v1.Gmail) {
  // Safe Gmail Blue
  return ensureColoredLabel(gmail, 'AI_PROCESSED', '#1c4587', '#c9daf8');
}

export async function ensureReviewLabel(gmail: gmail_v1.Gmail) {
  // Safe Gmail Orange
  return ensureColoredLabel(gmail, 'AI_REVIEW', '#a46a21', '#fce8b3');
}

export async function ensureQueueLabel(gmail: gmail_v1.Gmail) {
  // Safe Gmail Red
  return ensureColoredLabel(gmail, 'Queue', '#ffffff', '#cc3a21');
}

export async function fetchRecentEmails(gmail: gmail_v1.Gmail, maxResults = 100, query = 'in:inbox') {
  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
      q: query,
    });

    const messages = (response.data.messages || []).filter(
      (msg): msg is gmail_v1.Schema$Message & { id: string } => !!msg.id
    );
    
    // Fetch full details for each message
    const emailDetails = await Promise.all(
      messages.map(async (msg) => {
        const detail = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'metadata',
          metadataHeaders: ['From', 'Subject', 'Date', 'List-Unsubscribe'],
        });

        const headers = detail.data.payload?.headers || [];
        const fromHeader = headers.find(h => h.name === 'From')?.value || '';
        const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
        const date = headers.find(h => h.name === 'Date')?.value || '';
        const unsubscribe = headers.find(h => h.name === 'List-Unsubscribe')?.value || '';
        
        // Parse "Name <email@domain.com>"
        const emailMatch = fromHeader.match(/<(.+)>/);
        const email = emailMatch ? emailMatch[1] : fromHeader;
        const nameMatch = fromHeader.match(/^([^<]+)/);
        const name = nameMatch ? nameMatch[1].trim().replace(/"/g, '') : email;

        return {
          id: msg.id,
          threadId: detail.data.threadId,
          snippet: detail.data.snippet || '',
          from: { name, email, raw: fromHeader },
          subject,
          date,
          unsubscribeLink: unsubscribe,
        };
      })
    );

    return emailDetails;
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }
}

export async function trashEmails(gmail: gmail_v1.Gmail, messageIds: string[]) {
  if (!messageIds.length) return;

  try {
    await gmail.users.messages.batchModify({
      userId: 'me',
      requestBody: {
        ids: messageIds,
        addLabelIds: ['TRASH'],
        removeLabelIds: ['INBOX'],
      },
    });
    return true;
  } catch (error) {
    console.error('Error trashing emails:', error);
    throw error;
  }
}

export async function labelEmails(gmail: gmail_v1.Gmail, messageIds: string[], labelId: string) {
  if (!messageIds.length || !labelId) return;

  try {
    await gmail.users.messages.batchModify({
      userId: 'me',
      requestBody: {
        ids: messageIds,
        addLabelIds: [labelId],
      },
    });
    return true;
  } catch (error) {
    console.error('Error labeling emails:', error);
    throw error;
  }
}

export async function sendUnsubscribeEmail(gmail: gmail_v1.Gmail, unsubscribeHeader: string) {
  if (!unsubscribeHeader) return false;

  // Extract mailto link from the List-Unsubscribe header
  // Example header: <mailto:unsub-123@example.com>, <https://example.com/unsub>
  const mailtoMatch = unsubscribeHeader.match(/<mailto:([^>]+)>/);
  if (!mailtoMatch) return false;

  let mailto = mailtoMatch[1];
  let subject = 'Unsubscribe';
  
  // Handle mailto links that include a subject (e.g., mailto:unsub@ex.com?subject=unsub_me)
  if (mailto.includes('?subject=')) {
    const parts = mailto.split('?subject=');
    mailto = parts[0];
    subject = decodeURIComponent(parts[1]);
  }

  // Construct raw email message
  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
  const messageParts = [
    `To: ${mailto}`,
    `Subject: ${utf8Subject}`,
    '',
    'Please unsubscribe me from this list.'
  ];
  
  const rawMessage = Buffer.from(messageParts.join('\n'))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  try {
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: rawMessage,
      },
    });
    return true;
  } catch (error) {
    console.error('Error sending unsubscribe email:', error);
    return false;
  }
}


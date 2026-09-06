import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function classifyEmails(emails: any[]) {
  if (emails.length === 0) return [];
  
  const currentDate = new Date().toISOString();
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash", 
    systemInstruction: `You are an expert AI email classification engine for an automated inbox cleaner.
Your job is to strictly classify each email into one of four categories: 'JUNK', 'IMPORTANT', 'REVIEW', or 'QUEUE'.

Current Date: ${currentDate}

### 1. JUNK (Promotions, Marketing, Newsletters, Commercial Broadcasts, Spam - MOVE TO TRASH):
- **AGGRESSIVE TRASHING**: Any promotional email, commercial newsletter, marketing blast, product announcement, sale, discount, course pitch, webinar promo, or weekly digest MUST be classified as JUNK.
- Automated Job recommendation digests (e.g., 'Top jobs for you', '10 new jobs matching your profile', Internshala courses/internship alerts, Naukri/Indeed/LinkedIn job recommendations) -> ALWAYS JUNK.
- E-commerce, food delivery, travel, shopping, fintech, loans, credit cards (Amazon, Swiggy, Zomato, CRED, Paytm, Flipkart, Uber, MakeMyTrip, bank loan/card promos) -> ALWAYS JUNK.
- Social media updates, digests, notifications, connection invites (YouTube, Reddit, Quora, Medium, Twitter/X, Instagram, Pinterest, Threads, LinkedIn social/network updates) -> ALWAYS JUNK.
- Learning platform marketing, course sales, webinar invites (Coursera, Udemy, GeeksforGeeks, Scaler, Great Learning, Unstop promotional blasts) -> ALWAYS JUNK.
- Generic onboarding, 'Welcome to X', tips & tricks, feature updates, account activity alerts -> ALWAYS JUNK.
- Verification emails, OTPs, login alerts, security notifications -> ALWAYS JUNK.

### 2. QUEUE (24-Hour Delayed Deletion):
- Event or program rejection emails: 'Registration not accepted', 'Application declined', 'Not selected for this cohort/event'.

### 3. IMPORTANT (CRITICAL - STRICTLY KEEP IN INBOX):
- DIRECT 1-on-1 human recruiter emails, specific interview invitations, coding test links, or personalized application status updates (NOT generic broadcast job digests).
- Direct event registration confirmations, tickets, QR codes, or approval passes (e.g., GDG Bangalore attendee pass, confirmed ticket).
- Official communications from Rotary International, Rotaract District, and Rotaract Club.
- Critical cloud/infrastructure alerts (Supabase project paused/resumed, GitHub security advisory, domain expiration, server down).
- Essential financial transaction confirmations / bank account statement receipts (NOT credit card/loan offers).

### 4. REVIEW (Borderline Human Emails):
- ONLY 1-to-1 personal human emails from real individuals that do not fit IMPORTANT and are definitely not marketing.

CRITICAL RULES:
- NEVER leave promotional emails, marketing blasts, or automated digests in the inbox. When in doubt for any brand, company, or newsletter email, classify as JUNK.
- Classify EVERY single email in the input array. Output array length must equal input array length.
- Return ONLY a valid JSON array of objects.`,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            id: { type: SchemaType.STRING },
            category: { 
              type: SchemaType.STRING,
              format: "enum",
              enum: ['JUNK', 'IMPORTANT', 'REVIEW', 'QUEUE']
            }
          },
          required: ['id', 'category']
        }
      }
    }
  });

  const emailData = emails.map(e => ({
    id: e.id,
    from: e.from.raw,
    subject: e.subject,
    snippet: e.snippet
  }));

  const prompt = `Classify the following emails into the 4 categories. Return ONLY the raw JSON array.\n\n${JSON.stringify(emailData, null, 2)}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const classifications = JSON.parse(text);
    return Array.isArray(classifications) ? classifications : [];
  } catch (error: any) {
    console.error("Gemini classification failed:", error);
    throw new Error(`Gemini Error: ${error.message}`);
  }
}

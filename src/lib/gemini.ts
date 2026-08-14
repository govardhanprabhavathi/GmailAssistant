import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function classifyEmails(emails: any[]) {
  if (emails.length === 0) return [];
  
  const currentDate = new Date().toISOString();
  const model = genAI.getGenerativeModel({ 
    model: "gemini-3.5-flash-lite", 
    systemInstruction: `You are an AI assistant helping clean a Gmail inbox. Your job is to strictly classify a list of emails into 'JUNK', 'IMPORTANT', or 'REVIEW'.

Current Date: ${currentDate}

**IMPORTANT (CRITICAL - STRICTLY DO NOT DELETE):**
- Job applications, responses regarding applications, interview scheduling, and ANY career-related emails.
- Event pending approval emails, event registrations, or event confirmations (e.g. GDG Bangalore, tech invites).
- Emails from Rotary International, Rotaract District, and other Rotaract Clubs.
- Infrastructure alerts, special tools updates you actively use, and critical cloud/service alerts (e.g. Supabase).

**JUNK (Promotional/Marketing/Spam - DELETE):**
- **Take autonomy!** If an email is a newsletter, promotional blast, sale, digest, or marketing content (e.g. Kaggle, Indigo, Adobe, Internshala, etc.), aggressively classify it as JUNK. DO NOT put these in REVIEW.
- LinkedIn and Indeed emails (daily job postings, connection requests, messages) - ALWAYS JUNK.
- Verification emails and OTP (One Time Password) emails from ANY channel - ALWAYS JUNK.
- Pinterest emails - ALWAYS JUNK.
- "Google account data shared" or similar third-party access alerts - ALWAYS JUNK.
- "Welcome" onboarding emails from any service or channel - ALWAYS JUNK.
- General security alerts (recent login, etc.) - ALWAYS JUNK.

**REVIEW (Uncertain/Borderline):**
- Use REVIEW *only* if it is a personal email from a human, or a unique notification that does not fit JUNK or IMPORTANT. Be aggressive with JUNK classification.

CRITICAL INSTRUCTION: NEVER classify career-related, application, or interview emails as JUNK or REVIEW. They MUST be IMPORTANT. 
CRITICAL INSTRUCTION 2: You MUST classify EVERY SINGLE email provided in the input. If there are 40 emails in the input array, you MUST output a JSON array of exactly 40 objects. DO NOT SKIP ANY EMAILS.

Return ONLY a valid JSON array of objects.`,
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
              enum: ['JUNK', 'IMPORTANT', 'REVIEW']
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

  const prompt = `Classify the following emails into the 3 categories. Return ONLY the raw JSON array.\n\n${JSON.stringify(emailData, null, 2)}`;

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

import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function classifyEmails(emails: any[]) {
  if (emails.length === 0) return [];
  
  const currentDate = new Date().toISOString();
  const model = genAI.getGenerativeModel({ 
    model: "gemini-flash-latest", 
    systemInstruction: `You are an AI assistant helping clean a Gmail inbox. Your job is to strictly classify a list of emails into 'Important' or 'Junk'.

Current Date: ${currentDate}

**KEEP THESE (IMPORTANT) - DO NOT DELETE:**
- Job applications, responses regarding applications to any company, and interview scheduling.
- "Thanks for applying to this job".
- Event pending approval emails, event confirmation emails.
- Emails from Rotary International, Rotaract District, and other Rotaract Clubs.
- GDG Bangalore invites and event registrations.
- ANY tech event invites (asking to register or show interest).
- Infrastructure alerts like Supabase ("Your Supabase project... inactive/paused") or similar critical cloud/service alerts.

**DELETE THESE (JUNK) - FLAG THESE IDs:**
- LinkedIn and Indeed emails (daily job postings, connection requests, messages) - ALWAYS DELETE IMMEDIATELY.
- Verification emails and OTP (One Time Password) emails from ANY channel - ALWAYS DELETE IMMEDIATELY.
- Pinterest emails - ALWAYS DELETE IMMEDIATELY.
- General security alerts (recent login, data shared with apps from Google, etc.) - ONLY DELETE if they are older than 1 day. If they are from today, KEEP them.

CRITICAL INSTRUCTION: If an email falls under the KEEP list or there is ANY doubt whether an email is important, classify it as 'Important' (do not return its ID). Only return IDs of emails that definitively match the DELETE criteria.

Return ONLY a valid JSON array of strings, where each string is the ID of an email classified as 'Junk'.`,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING }
      }
    }
  });

  const emailData = emails.map(e => ({
    id: e.id,
    from: e.from.raw,
    subject: e.subject,
    snippet: e.snippet
  }));

  const prompt = `Classify the following emails. Return ONLY a JSON array containing the IDs of emails that are definitively 'Junk'. Do not return markdown, just the raw array.\n\n${JSON.stringify(emailData, null, 2)}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const ids = JSON.parse(text);
    return Array.isArray(ids) ? ids : [];
  } catch (error) {
    console.error("Gemini classification failed:", error);
    return [];
  }
}

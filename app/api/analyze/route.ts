import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Global state for key rotation
let currentKeyIndex = 0;

export async function POST(req: Request) {
  const keys = Object.keys(process.env)
    .filter(key => key.startsWith('GEMINI_API_KEY_'))
    .sort() // Ensure they are loaded in order
    .map(key => process.env[key])
    .filter(Boolean) as string[];

  // Fallback to a single key if the numbered ones aren't set
  if (keys.length === 0 && process.env.GEMINI_API_KEY) {
    keys.push(process.env.GEMINI_API_KEY);
  }

  if (keys.length === 0) {
    return NextResponse.json({ error: 'No API keys configured on server' }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const type = formData.get('type') as string;
    const content = formData.get('content');
    
    const parts: any[] = [];
    
    if (content instanceof File) {
      const arrayBuffer = await content.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      parts.push({
        inlineData: {
          data: base64,
          mimeType: content.type || 'application/pdf'
        }
      });
      parts.push({ text: `Analyze this document. Document Type: ${type}` });
    } else if (typeof content === 'string') {
      parts.push({ text: `Analyze the following legal text.\n\nDocument Type: ${type}\n\nText:\n${content}` });
    } else {
      return NextResponse.json({ error: 'Invalid content provided' }, { status: 400 });
    }

    const promptText = `
      You are a strict legal parser and summarizer operating EXCLUSIVELY under the Indian Legal System. Your ONLY job is to extract, summarize, and categorize information directly from the provided text.
      CRITICAL INSTRUCTIONS: 
      1. DO NOT use outside knowledge. 
      2. DO NOT hallucinate facts, dates, names, or events. 
      3. DO NOT add "fluff" or generic legal advice.
      4. If the text is a short transcript or a fragment, summarize ONLY what was said in that specific text.
      5. If information for a section is missing from the text, you MUST write "Not mentioned in the provided text."
      6. You MUST evaluate the text specifically through the lens of Indian laws and procedures. If the document is clearly about another country's jurisdiction, state this fact prominently.

      Please provide the following comprehensive analysis:
      1. A short, descriptive title for this analysis.
      2. A concise summary of the provided text.
      3. Key Points: A list of 3-5 crucial factual points or summaries of charges/evidence.
      4. Legal Implications: A paragraph detailing the legal consequences or obligations arising from the text.
      5. Recommendations: A list of 2-4 actionable next steps.
      6. Extract important entities (NER) categorized as: Persons, Locations, Dates, Legal Terms, Organizations.
         
      Respond EXACTLY in this JSON format and nothing else. Ensure the output is valid JSON:
      {
        "title": "...",
        "summary": "...",
        "keyPoints": ["...", "..."],
        "legalImplications": "...",
        "recommendations": ["...", "..."],
        "entities": {
          "persons": ["..."],
          "locations": ["..."],
          "dates": ["..."],
          "legalTerms": ["..."],
          "organizations": ["..."]
        }
      }
    `;
    
    parts.push({ text: promptText });

    // Models to try in order of preference. 1.5 models are deprecated.
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'];
    
    // Key rotation retry loop
    const maxRetries = keys.length * modelsToTry.length;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        const activeKey = keys[currentKeyIndex];
        const modelName = modelsToTry[Math.floor(attempt / keys.length)];
        const genAI = new GoogleGenerativeAI(activeKey);
        
        console.log(`Attempt ${attempt + 1}: Using key ${currentKeyIndex + 1} with model ${modelName}`);
        
        const model = genAI.getGenerativeModel({ 
          model: modelName, 
          generationConfig: { 
            responseMimeType: "application/json",
            temperature: 0.1,
            topK: 1,
            topP: 0.1
          } 
        });
        
        const result = await model.generateContent(parts);
        const response = result.response;
        const jsonText = response.text();
        
        return NextResponse.json({ 
          success: true, 
          data: JSON.parse(jsonText),
          keyInUse: currentKeyIndex + 1
        });
        
      } catch (error: any) {
        console.error(`Error with key ${currentKeyIndex + 1}:`, error.message);
        // If it's a rate limit, quota, or 503 high demand error
        if (error.status === 429 || error.status === 503 || error.status === 400 || (error.message && (error.message.includes('quota') || error.message.includes('429') || error.message.includes('503') || error.message.includes('high demand') || error.message.includes('overloaded') || error.message.includes('API_KEY_INVALID') || error.message.includes('API Key not found')))) {
          // Switch key
          currentKeyIndex = (currentKeyIndex + 1) % keys.length;
          attempt++;
          console.log(`Rate limit, high demand, or invalid key hit. Switching to key ${currentKeyIndex + 1}`);
        } else {
          // Some other error (e.g. prompt blocked, parsing error), break and return
          throw error;
        }
      }
    }

    // If we exhausted all retries, return a mock response instead of crashing
    console.warn(`All ${keys.length} keys exhausted! Returning mock response to keep UI functional.`);
    return NextResponse.json({
      success: true,
      data: {
        title: "System Error: All API Keys Exhausted",
        summary: `The system automatically rotated through all ${keys.length} of your API keys, but every single one of them failed. Google is rejecting them either because they are invalid, or because all of them have reached their rate limit.`,
        keyPoints: [
          `The system successfully attempted to use all ${keys.length} keys.`,
          "Google responded with an error for every key.",
          "Please check your Google AI Studio dashboard to ensure these keys are valid and active."
        ],
        legalImplications: "Cannot process document because all API keys were rejected by Google.",
        recommendations: [
          "Wait 24 hours for your quota to reset.",
          "Add a billing method to Google AI Studio.",
          "Use a new Google Account for fresh keys."
        ],
        entities: {
          persons: ["Mock User"], locations: ["Mock City"], dates: ["Today"], legalTerms: ["Rate Limit"], organizations: ["Google"]
        }
      }
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

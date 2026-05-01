import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

let currentKeyIndex = 0;

export async function POST(req: Request) {
  const keys = Object.keys(process.env)
    .filter(key => key.startsWith('GEMINI_API_KEY_'))
    .sort()
    .map(key => process.env[key])
    .filter(Boolean) as string[];

  if (keys.length === 0 && process.env.GEMINI_API_KEY) {
    keys.push(process.env.GEMINI_API_KEY);
  }

  if (keys.length === 0) {
    return NextResponse.json({ error: 'No API keys configured' }, { status: 500 });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages array' }, { status: 400 });
    }

    const systemPrompt = `
      You are a helpful Legal Assistant Chatbot for the AI Law Interpreter platform.
      Your job is to answer basic, general legal questions according to the Indian Legal System.
      
      CRITICAL INSTRUCTIONS:
      1. You MUST NOT provide formal legal advice.
      2. If a user asks a complex question or asks for legal representation, advise them to consult a qualified lawyer.
      3. Always be polite, concise, and professional.
      4. If the question is NOT related to law, politely decline to answer and redirect the user to ask legal questions.
      5. Include a brief disclaimer at the end of your response stating that you are an AI and not a substitute for a lawyer.
      6. You MUST strictly adhere to and provide information ONLY based on the Indian Legal System. If asked about laws of other countries, kindly state that you only have knowledge of Indian Law.
    `;

    // Formatting history
    let validMessages = messages.slice(0, -1);
    const formattedHistory = [];
    let expectedRole = 'user';
    for (const msg of validMessages) {
      const role = msg.role === 'user' ? 'user' : 'model';
      if (role === expectedRole) {
        formattedHistory.push({ role, parts: [{ text: msg.content }] });
        expectedRole = expectedRole === 'user' ? 'model' : 'user';
      }
    }

    const lastMessage = messages[messages.length - 1].content;
    const maxRetries = keys.length;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const activeKey = keys[currentKeyIndex];
        const genAI = new GoogleGenerativeAI(activeKey);
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-2.5-flash',
          systemInstruction: systemPrompt
        });

        const chat = model.startChat({ history: formattedHistory });
        const result = await chat.sendMessage(lastMessage);
        
        return NextResponse.json({ 
          success: true, 
          reply: result.response.text(),
          keyInUse: currentKeyIndex + 1
        });
      } catch (error: any) {
        console.error(`Chat API Error with key ${currentKeyIndex + 1}:`, error.message);
        if (error.status === 429 || error.status === 503 || error.status === 400 || error.status === 404 || (error.message && (error.message.includes('quota') || error.message.includes('429') || error.message.includes('503') || error.message.includes('high demand') || error.message.includes('overloaded') || error.message.includes('API_KEY_INVALID') || error.message.includes('not found') || error.message.includes('API Key not found')))) {
          currentKeyIndex = (currentKeyIndex + 1) % keys.length;
          attempt++;
          console.log(`Rate limit, high demand, or invalid key/model hit. Switching to key ${currentKeyIndex + 1}`);
        } else {
          throw error;
        }
      }
    }

    return NextResponse.json({
      success: true,
      reply: "I am currently experiencing high demand and all my AI keys have reached their limits. Please wait a few minutes and try again!",
      keyInUse: currentKeyIndex + 1
    });

  } catch (error: any) {
    console.error("Chat API Fatal Error:", error);
    return NextResponse.json({ error: 'Failed to process chat message' }, { status: 500 });
  }
}

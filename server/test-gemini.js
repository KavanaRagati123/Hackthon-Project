require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are MindMate, a compassionate mental health assistant.`;

async function testGemini() {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    });

    const chat = model.startChat({
      history: [],
    });

    const result = await chat.sendMessage('Hello');
    console.log('Response:', result.response.text());
  } catch (error) {
    console.error('API Error:', JSON.stringify(error, null, 2));
    if (error.statusDetails) {
      console.error('Details:', error.statusDetails);
    }
    console.error('Message:', error.message);
  }
}

testGemini();

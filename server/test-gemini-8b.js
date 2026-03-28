require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGemini() {
  try {
    const model = genAI.getGenerativeModel({
      model: 'models/gemini-1.5-flash-8b',
    });

    const chat = model.startChat({ history: [] });
    const result = await chat.sendMessage('Hello, who are you?');
    console.log("SUCCESS:", result.response.text());
  } catch (error) {
    console.error("API Error:");
    console.error(error);
  }
}

testGemini();

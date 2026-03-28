const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are MindMate, a compassionate mental health assistant for college students. Your responses should be:
- Supportive, empathetic, and non-judgmental
- Offering practical coping strategies and study tips when relevant
- Never provide medical diagnoses or prescribe medication
- Keep responses conversational, warm, and concise (2-4 paragraphs max)
- Use encouraging language and validate feelings
- If the user expresses suicidal thoughts, self-harm ideation, or severe distress, IMMEDIATELY:
  1. Acknowledge their pain with empathy
  2. Strongly encourage contacting a professional
  3. Include these exact crisis resources in your response:
     "🆘 CRISIS RESOURCES: National Suicide Prevention Lifeline: 988 | Crisis Text Line: Text HOME to 741741 | Emergency: 911"
  4. Set your response sentiment to "crisis"
- Support multiple languages: English, Hindi, Tamil, Telugu, Bengali
- If the user writes in a non-English language, respond in that same language
- End responses with a gentle question or encouragement to keep the conversation going`;

const SENTIMENT_PROMPT = `Analyze the sentiment of the following message and respond with ONLY one word: "positive", "neutral", "negative", or "crisis". 
Crisis means the person is expressing suicidal thoughts, self-harm, or severe mental distress.
Message: `;

const CRISIS_KEYWORDS = [
  'suicide', 'suicidal', 'kill myself', 'end my life', 'want to die', 'self-harm',
  'self harm', 'cutting myself', 'hurt myself', 'no reason to live', 'better off dead',
  'ending it all', 'can\'t go on', 'don\'t want to live', 'overdose',
  'आत्महत्या', 'मरना चाहता', 'जीना नहीं', 'தற்கொலை', 'ఆత్మహత్య', 'আত্মহত্যা'
];

const detectCrisis = (message) => {
  const lower = message.toLowerCase();
  return CRISIS_KEYWORDS.some(keyword => lower.includes(keyword));
};

const getChatResponse = async (messages, userMessage) => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_PROMPT,
    });
    
    // Filter and format chat history - must alternate user/model and start with user
    const chatHistory = [];
    for (const msg of messages) {
      const role = msg.role === 'assistant' ? 'model' : 'user';
      // Ensure alternating roles
      if (chatHistory.length === 0 && role === 'model') continue;
      if (chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === role) continue;
      chatHistory.push({
        role,
        parts: [{ text: msg.content }]
      });
    }

    const chat = model.startChat({
      history: chatHistory.length > 0 ? chatHistory : undefined,
    });

    const result = await chat.sendMessage(userMessage);
    const response = result.response.text();
    return response;
  } catch (error) {
    console.error('Gemini API Error:', error.message || error);
    
    // Fallback for hackathon demo if API quota is exhausted
    const isRateLimit = error.status === 429 || (error.message && error.message.includes('429')) || (error.message && error.message.includes('Too Many Requests'));
    
    if (isRateLimit) {
      if (detectCrisis(userMessage)) {
        return "I'm hearing that you are in a lot of pain right now. Please know you are not alone. It's really important that you talk to a professional who can support you. \n\n🆘 **CRISIS RESOURCES**: \n- National Suicide Prevention Lifeline: 988 \n- Crisis Text Line: Text HOME to 741741 \n- Emergency: 911";
      }

      // Explicitly notify the user instead of trying to hide the API failure smoothly
      return "⚠️ **Google Gemini API Quota Exhausted**\n\nI am currently operating in limited-response mode because your Google API Key has hit its maximum free request limit (Error 429: Too Many Requests).\n\nIf you generated a new API key from the same Google account, the maximum limits still apply globally! Please wait 60 seconds for the 'Requests Per Minute' quota to reset, or use a completely different Google account to generate a new key.";
    }

    throw new Error('Failed to get AI response');
  }
};

const analyzeSentiment = async (message) => {
  try {
    if (detectCrisis(message)) return { sentiment: 'crisis', score: -1 };
    
    // Naive local sentiment analyzer to save API requests and prevent rate-limiting 429 errors
    const lowerMessage = message.toLowerCase();
    
    // Define keyword arrays
    const positiveWords = ['good', 'great', 'happy', 'better', 'thanks', 'thank you', 'amazing', 'relieved', 'awesome', 'nice', 'calm', 'peaceful', 'hopeful', 'okay', 'fine', 'glad'];
    const negativeWords = ['bad', 'sad', 'angry', 'mad', 'depressed', 'anxious', 'stress', 'terrible', 'awful', 'overwhelmed', 'tired', 'exhausted', 'hopeless', 'lonely', 'worried', 'nervous', 'scared', 'pain'];
    
    const countPositive = positiveWords.filter(word => lowerMessage.includes(word)).length;
    const countNegative = negativeWords.filter(word => lowerMessage.includes(word)).length;
    
    if (countPositive > countNegative) return { sentiment: 'positive', score: 0.7 };
    if (countNegative > countPositive) return { sentiment: 'negative', score: -0.5 };
    
    return { sentiment: 'neutral', score: 0 };
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return { sentiment: 'neutral', score: 0 };
  }
};

module.exports = { getChatResponse, analyzeSentiment, detectCrisis, SYSTEM_PROMPT };

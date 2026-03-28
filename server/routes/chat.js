const express = require('express');
const { auth } = require('../middleware/auth');
const ChatSession = require('../models/ChatSession');
const { getChatResponse, analyzeSentiment, detectCrisis } = require('../services/gemini');

const router = express.Router();

// Create new chat session
router.post('/session', auth, async (req, res, next) => {
  try {
    const session = new ChatSession({
      userId: req.userId,
      language: req.user.language || 'English',
      messages: []
    });
    await session.save();
    res.status(201).json({ session });
  } catch (error) {
    next(error);
  }
});

// Send message and get AI response
router.post('/message', auth, async (req, res, next) => {
  try {
    const { sessionId, message } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    let session;
    if (sessionId) {
      session = await ChatSession.findOne({ _id: sessionId, userId: req.userId });
    }
    
    if (!session) {
      session = new ChatSession({
        userId: req.userId,
        language: req.user.language || 'English',
        messages: []
      });
    }

    // Analyze sentiment of user message
    const sentimentResult = await analyzeSentiment(message);
    const isCrisis = detectCrisis(message) || sentimentResult.sentiment === 'crisis';

    // Add user message
    session.messages.push({
      role: 'user',
      content: message,
      sentiment: sentimentResult.sentiment,
      sentimentScore: sentimentResult.score
    });

    // Get AI response
    const previousMessages = session.messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content
    }));

    const aiResponse = await getChatResponse(previousMessages.slice(0, -1), message);

    // Add AI response
    session.messages.push({
      role: 'assistant',
      content: aiResponse,
      sentiment: 'neutral',
      sentimentScore: 0
    });

    // Flag if crisis detected
    if (isCrisis) {
      session.flagged = true;
      session.flagReason = 'Crisis keywords detected';
    }

    // Update overall sentiment
    const sentiments = session.messages.filter(m => m.role === 'user').map(m => m.sentimentScore);
    const avgSentiment = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
    session.overallSentiment = avgSentiment < -0.5 ? 'negative' : avgSentiment > 0.3 ? 'positive' : 'neutral';

    await session.save();

    res.json({
      response: aiResponse,
      sessionId: session._id,
      isCrisis,
      sentiment: sentimentResult.sentiment,
      crisisResources: isCrisis ? {
        hotline: process.env.CRISIS_HOTLINE || '988',
        textLine: process.env.CRISIS_TEXT || '741741',
        emergency: '911'
      } : null
    });
  } catch (error) {
    next(error);
  }
});

// Get chat history
router.get('/history', auth, async (req, res, next) => {
  try {
    const sessions = await ChatSession.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('messages.content messages.role messages.timestamp overallSentiment flagged createdAt');
    
    res.json({ sessions });
  } catch (error) {
    next(error);
  }
});

// Get single session
router.get('/session/:id', auth, async (req, res, next) => {
  try {
    const session = await ChatSession.findOne({ _id: req.params.id, userId: req.userId });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json({ session });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

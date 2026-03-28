const { getChatResponse, analyzeSentiment, detectCrisis } = require('../services/gemini');
const ChatSession = require('../models/ChatSession');
const jwt = require('jsonwebtoken');

const setupSocket = (io) => {
  // Auth middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  // Chat namespace for AI bot
  const chatNs = io.of('/chat');
  chatNs.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) return next(new Error('Auth required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (e) {
      next(new Error('Invalid token'));
    }
  });

  chatNs.on('connection', (socket) => {
    console.log(`🔌 Chat connected: ${socket.userId}`);
    
    // Join personal room
    socket.join(`user_${socket.userId}`);

    socket.on('new_message', async (data) => {
      try {
        const { sessionId, message } = data;
        
        // Emit typing indicator
        socket.emit('typing', { isTyping: true });

        let session;
        if (sessionId) {
          session = await ChatSession.findOne({ _id: sessionId, userId: socket.userId });
        }
        if (!session) {
          session = new ChatSession({ userId: socket.userId, messages: [] });
        }

        // Sentiment analysis
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
        const previousMsgs = session.messages.slice(-10).map(m => ({
          role: m.role,
          content: m.content
        }));

        const aiResponse = await getChatResponse(previousMsgs.slice(0, -1), message);

        session.messages.push({
          role: 'assistant',
          content: aiResponse,
          sentiment: 'neutral',
          sentimentScore: 0
        });

        if (isCrisis) {
          session.flagged = true;
          session.flagReason = 'Crisis detected via socket';
        }

        await session.save();

        // Stop typing
        socket.emit('typing', { isTyping: false });

        // Send response
        socket.emit('new_message', {
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

        // Emit crisis alert to admin
        if (isCrisis) {
          io.of('/admin').emit('crisis_alert', {
            userId: socket.userId,
            sessionId: session._id,
            timestamp: new Date()
          });
        }
      } catch (error) {
        socket.emit('typing', { isTyping: false });
        socket.emit('error', { message: 'Failed to process message' });
        console.error('Socket chat error:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Chat disconnected: ${socket.userId}`);
    });
  });

  // Peer support namespace
  const peerNs = io.of('/peer');
  peerNs.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) return next(new Error('Auth required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (e) {
      next(new Error('Invalid token'));
    }
  });

  peerNs.on('connection', (socket) => {
    console.log(`👥 Peer connected: ${socket.userId}`);

    socket.on('join_group', (groupId) => {
      socket.join(`group_${groupId}`);
      socket.emit('joined_group', { groupId });
    });

    socket.on('group_message', (data) => {
      const { groupId, message, isAnonymous } = data;
      peerNs.to(`group_${groupId}`).emit('group_message', {
        userId: isAnonymous ? 'Anonymous' : socket.userId,
        message,
        timestamp: new Date()
      });
    });

    socket.on('leave_group', (groupId) => {
      socket.leave(`group_${groupId}`);
    });

    socket.on('disconnect', () => {
      console.log(`👥 Peer disconnected: ${socket.userId}`);
    });
  });

  // Admin namespace
  const adminNs = io.of('/admin');
  adminNs.on('connection', (socket) => {
    console.log('🛡️ Admin connected');
  });
};

module.exports = { setupSocket };

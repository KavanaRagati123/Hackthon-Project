import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiPaperAirplane, HiRefresh, HiClock, HiExclamation } from 'react-icons/hi';

const quickReplies = [
  "I feel anxious 😰",
  "I need study tips 📚",
  "I'm feeling lonely 😔",
  "Help me relax 🧘",
  "I can't sleep 😴",
  "I'm stressed about exams 📝"
];

const moodEmojis = { positive: '😊', neutral: '😐', negative: '😔', crisis: '🆘' };

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showCrisis, setShowCrisis] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Add welcome message
    setMessages([{
      role: 'assistant',
      content: `Hi ${user?.name?.split(' ')[0]}! 👋 I'm MindMate, your mental health companion. I'm here to listen, support, and offer helpful strategies. Everything you share is private and confidential.\n\nHow are you feeling today?`,
      timestamp: new Date()
    }]);
    loadHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadHistory = async () => {
    try {
      const { data } = await chatAPI.getHistory();
      setHistory(data.sessions || []);
    } catch (e) {}
  };

  const loadSession = async (id) => {
    try {
      const { data } = await chatAPI.getSession(id);
      setSessionId(id);
      setMessages(data.session.messages);
      setShowHistory(false);
    } catch (e) {
      toast.error('Failed to load session');
    }
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setInput('');
    setLoading(true);
    setShowCrisis(false);

    // Add user message immediately
    setMessages(prev => [...prev, { role: 'user', content: msg, timestamp: new Date() }]);

    try {
      const { data } = await chatAPI.sendMessage({ sessionId, message: msg });
      
      setSessionId(data.sessionId);
      
      // Add AI response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        sentiment: data.sentiment
      }]);

      // Show crisis banner if needed
      if (data.isCrisis) {
        setShowCrisis(true);
      }
    } catch (error) {
      toast.error('Failed to get response. Please try again.');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment. If you're in crisis, please call **988** immediately.",
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const startNewChat = () => {
    setSessionId(null);
    setMessages([{
      role: 'assistant',
      content: `Starting a fresh conversation. How can I help you today, ${user?.name?.split(' ')[0]}? 💚`,
      timestamp: new Date()
    }]);
    setShowCrisis(false);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex relative w-full rounded-2xl overflow-hidden glass border border-dark-200 dark:border-dark-700 shadow-xl">
      {/* History Sidebar */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="absolute left-0 top-0 bottom-0 w-72 glass border-r border-dark-200 dark:border-dark-700 z-40 overflow-y-auto p-4 bg-white/95 dark:bg-dark-900/95"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Chat History</h3>
              <button onClick={() => setShowHistory(false)} className="text-dark-400 hover:text-dark-600">✕</button>
            </div>
            {history.map((session) => (
              <button
                key={session._id}
                onClick={() => loadSession(session._id)}
                className={`w-full text-left p-3 rounded-xl mb-2 transition-colors text-sm
                  ${sessionId === session._id ? 'bg-primary-500/10 border-primary-500/30 border' : 'hover:bg-dark-100 dark:hover:bg-dark-800'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <HiClock className="w-3 h-3 text-dark-400" />
                  <span className="text-xs text-dark-500">{new Date(session.createdAt).toLocaleDateString()}</span>
                  {session.flagged && <span className="text-xs text-red-500">⚠️</span>}
                </div>
                <p className="text-dark-700 dark:text-dark-300 truncate">
                  {session.messages?.[0]?.content?.substring(0, 50)}...
                </p>
              </button>
            ))}
            {history.length === 0 && (
              <p className="text-dark-500 text-sm text-center py-4">No previous chats</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Chat Header */}
        <div className="glass border-b border-dark-200 dark:border-dark-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowHistory(!showHistory)} className="btn-ghost !p-2 text-xs">
              <HiClock className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-mint-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold">AI</span>
            </div>
            <div>
              <h2 className="font-semibold">MindMate AI</h2>
              <p className="text-xs text-mint-500 flex items-center gap-1">
                <span className="w-2 h-2 bg-mint-500 rounded-full animate-pulse" /> Online
              </p>
            </div>
          </div>
          <button onClick={startNewChat} className="btn-ghost !p-2 flex items-center gap-1 text-sm">
            <HiRefresh className="w-4 h-4" /> New Chat
          </button>
        </div>

        {/* Crisis Banner */}
        <AnimatePresence>
          {showCrisis && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="crisis-pulse border-2 px-4 py-3 mx-4 mt-2 rounded-xl"
            >
              <div className="flex items-start gap-3">
                <HiExclamation className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-600 dark:text-red-400">You're Not Alone – Help is Available</h4>
                  <div className="text-sm mt-1 space-y-1 text-dark-600 dark:text-dark-400">
                    <p>📞 <strong>National Suicide Prevention Lifeline:</strong> <a href="tel:988" className="text-red-500 font-bold">988</a></p>
                    <p>💬 <strong>Crisis Text Line:</strong> Text <strong>HOME</strong> to <a href="sms:741741" className="text-red-500 font-bold">741741</a></p>
                    <p>🚨 <strong>Emergency:</strong> <a href="tel:911" className="text-red-500 font-bold">911</a></p>
                  </div>
                </div>
                <button onClick={() => setShowCrisis(false)} className="text-dark-400 hover:text-dark-600 flex-shrink-0">✕</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] sm:max-w-[70%] ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl rounded-br-md'
                  : 'glass rounded-2xl rounded-bl-md'
              } px-4 py-3 shadow-lg`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <div className={`flex items-center gap-2 mt-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <span className={`text-[10px] ${msg.role === 'user' ? 'text-white/60' : 'text-dark-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {msg.sentiment && (
                    <span className="text-xs">{moodEmojis[msg.sentiment]}</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="glass rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  onClick={() => sendMessage(reply)}
                  className="text-sm px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="glass border-t border-dark-200 dark:border-dark-700 px-4 py-3">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-center gap-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="input-field flex-1 !py-3 !rounded-xl"
              disabled={loading}
              autoFocus
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="btn-primary !p-3 !rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <HiPaperAirplane className="w-5 h-5 rotate-90" />
            </button>
          </form>
          <p className="text-[10px] text-dark-400 mt-2 text-center">
            MindMate AI is not a substitute for professional help. If you're in crisis, call 988.
          </p>
        </div>
      </div>
    </div>
  );
}

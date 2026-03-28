require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const MoodEntry = require('./models/MoodEntry');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');

  const students = await User.find({ role: 'student' }).limit(3);
  if (students.length < 1) { console.log('No students found'); process.exit(1); }
  
  const s1 = students[0];
  const s2 = students[1] || s1;
  const s3 = students[2] || s1;

  // Posts
  await Post.deleteMany({});
  await Post.create([
    { userId: s1._id, content: 'Just finished my midterms and feeling so relieved! Remember to take breaks and be kind to yourself! 💪', category: 'Academics', isAnonymous: false, likes: [s2._id], likeCount: 1, comments: [{ userId: s2._id, content: 'So true! Taking small walks really helped me.', isAnonymous: false }], commentCount: 1 },
    { userId: s2._id, content: 'Feeling really anxious about future career prospects. Everyone seems to have it figured out. Is it okay to not have everything planned? 😔', category: 'Mental Health', isAnonymous: true, likes: [s1._id], likeCount: 1, comments: [{ userId: s1._id, content: 'Absolutely normal! Your journey is unique. 💚', isAnonymous: false }], commentCount: 1 },
    { userId: s3._id, content: 'Started using MindMate chatbot for daily check-ins and it is really helpful! How do you all manage stress? 🤔', category: 'General', isAnonymous: false, likes: [s1._id, s2._id], likeCount: 2, comments: [], commentCount: 0 },
    { userId: s1._id, content: 'Pro tip: Join a club outside your major. Game-changer for mental health and social life! 📸', category: 'Social Life', isAnonymous: false, likes: [s2._id, s3._id], likeCount: 2, comments: [], commentCount: 0 },
  ]);
  console.log('Posts created');

  // Moods
  await MoodEntry.deleteMany({});
  const today = new Date();
  const entries = [];
  for (let i = 30; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    entries.push({
      userId: s1._id,
      moodScore: Math.max(1, Math.min(5, 3 + Math.round(Math.sin(i / 5) * 2))),
      note: i % 7 === 0 ? 'Weekly reflection: feeling more balanced.' : undefined,
      date: d
    });
  }
  await MoodEntry.insertMany(entries);
  console.log('Mood entries created:', entries.length);

  console.log('DONE');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });

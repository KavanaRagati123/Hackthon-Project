require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Counsellor = require('./models/Counsellor');
const Resource = require('./models/Resource');
const Post = require('./models/Post');
const MoodEntry = require('./models/MoodEntry');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Force drop entire database to guarantee pure seed state
    await mongoose.connection.db.dropDatabase();
    console.log('🗑️ Completely dropped existing database');
    console.log('🗑️ Cleared existing data');

    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@mindmate.com',
      password: 'admin123',
      role: 'admin',
      college: 'MindMate University',
      isVerified: true,
      onboardingComplete: true
    });

    const counsellor1User = await User.create({
      name: 'Dr. Priya Sharma',
      email: 'priya@mindmate.com',
      password: 'counsellor123',
      role: 'counsellor',
      college: 'MindMate University',
      language: 'English',
      isVerified: true,
      onboardingComplete: true
    });

    const counsellor2User = await User.create({
      name: 'Dr. Rajesh Kumar',
      email: 'rajesh@mindmate.com',
      password: 'counsellor123',
      role: 'counsellor',
      college: 'MindMate University',
      language: 'Hindi',
      isVerified: true,
      onboardingComplete: true
    });

    const counsellor3User = await User.create({
      name: 'Dr. Ananya Iyer',
      email: 'ananya@mindmate.com',
      password: 'counsellor123',
      role: 'counsellor',
      college: 'MindMate University',
      language: 'Tamil',
      isVerified: true,
      onboardingComplete: true
    });

    const student1 = await User.create({
      name: 'Kavana Ragati',
      email: 'kavana@student.edu',
      password: 'student123',
      role: 'student',
      college: 'MindMate University',
      year: 3,
      language: 'English',
      isVerified: true,
      onboardingComplete: true,
      consentAnonymousData: true
    });

    const student2 = await User.create({
      name: 'Arjun Reddy',
      email: 'arjun@student.edu',
      password: 'student123',
      role: 'student',
      college: 'MindMate University',
      year: 2,
      language: 'English',
      isVerified: true,
      onboardingComplete: true
    });

    const student3 = await User.create({
      name: 'Meera Nair',
      email: 'meera@student.edu',
      password: 'student123',
      role: 'student',
      college: 'MindMate University',
      year: 1,
      language: 'English',
      isVerified: true,
      onboardingComplete: true
    });

    console.log('👤 Users created');

    // Create counsellors
    const counsellor1 = await Counsellor.create({
      userId: counsellor1User._id,
      bio: 'Experienced clinical psychologist specializing in anxiety, depression, and academic stress. 10+ years of working with college students. Passionate about making mental health accessible.',
      specialties: ['Anxiety', 'Depression', 'Academic Stress', 'Self-esteem'],
      languages: ['English', 'Hindi'],
      workingHours: {
        monday: { start: '09:00', end: '17:00', isWorking: true },
        tuesday: { start: '09:00', end: '17:00', isWorking: true },
        wednesday: { start: '09:00', end: '17:00', isWorking: true },
        thursday: { start: '09:00', end: '17:00', isWorking: true },
        friday: { start: '09:00', end: '15:00', isWorking: true },
        saturday: { start: '10:00', end: '13:00', isWorking: true },
        sunday: { start: '00:00', end: '00:00', isWorking: false }
      },
      isActive: true,
      rating: 4.8,
      totalSessions: 156
    });

    const counsellor2 = await Counsellor.create({
      userId: counsellor2User._id,
      bio: 'Cognitive behavioral therapist with expertise in relationship counselling and social anxiety. Fluent in Hindi and English. Believes in holistic approaches to mental wellness.',
      specialties: ['Relationships', 'Social Anxiety', 'Stress Management', 'CBT'],
      languages: ['Hindi', 'English'],
      workingHours: {
        monday: { start: '10:00', end: '18:00', isWorking: true },
        tuesday: { start: '10:00', end: '18:00', isWorking: true },
        wednesday: { start: '10:00', end: '18:00', isWorking: true },
        thursday: { start: '10:00', end: '18:00', isWorking: true },
        friday: { start: '10:00', end: '16:00', isWorking: true },
        saturday: { start: '00:00', end: '00:00', isWorking: false },
        sunday: { start: '00:00', end: '00:00', isWorking: false }
      },
      isActive: true,
      rating: 4.6,
      totalSessions: 98
    });

    const counsellor3 = await Counsellor.create({
      userId: counsellor3User._id,
      bio: 'Mindfulness practitioner and art therapist. Specializes in helping students deal with exam pressure and creative blocks. Trilingual support available.',
      specialties: ['Mindfulness', 'Art Therapy', 'Exam Stress', 'Creative Blocks'],
      languages: ['Tamil', 'English', 'Hindi'],
      workingHours: {
        monday: { start: '08:00', end: '16:00', isWorking: true },
        tuesday: { start: '08:00', end: '16:00', isWorking: true },
        wednesday: { start: '08:00', end: '16:00', isWorking: true },
        thursday: { start: '08:00', end: '16:00', isWorking: true },
        friday: { start: '08:00', end: '14:00', isWorking: true },
        saturday: { start: '09:00', end: '12:00', isWorking: true },
        sunday: { start: '00:00', end: '00:00', isWorking: false }
      },
      isActive: true,
      rating: 4.9,
      totalSessions: 203
    });

    console.log('🩺 Counsellors created');

    // Create resources
    const resources = await Resource.insertMany([
      {
        title: 'Understanding Anxiety: A Student\'s Guide',
        description: 'Comprehensive guide to understanding anxiety triggers, symptoms, and evidence-based coping strategies tailored for college life.',
        type: 'article',
        content: 'Anxiety is one of the most common mental health challenges facing college students today. This guide covers: recognizing anxiety symptoms, understanding triggers, breathing techniques, progressive muscle relaxation, and when to seek professional help.',
        category: 'Anxiety',
        language: 'English',
        tags: ['anxiety', 'coping', 'students', 'self-help'],
        url: '#',
        thumbnail: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400',
        createdBy: admin._id,
        views: 245,
        likes: 67
      },
      {
        title: '5-Minute Meditation for Stress Relief',
        description: 'A guided audio meditation designed specifically for students to use between classes or before exams.',
        type: 'audio',
        category: 'Stress',
        language: 'English',
        tags: ['meditation', 'stress', 'mindfulness', 'quick'],
        url: 'https://www.youtube.com/watch?v=inpok4MKVLM',
        thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
        createdBy: admin._id,
        views: 189,
        likes: 92
      },
      {
        title: 'Managing Depression During Exams',
        description: 'Video guide on managing depressive episodes while maintaining academic performance. Features practical tips from psychologists.',
        type: 'video',
        category: 'Depression',
        language: 'English',
        tags: ['depression', 'exams', 'academic', 'tips'],
        url: 'https://www.youtube.com/watch?v=d96akWDwx0I',
        thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400',
        createdBy: admin._id,
        views: 312,
        likes: 84
      },
      {
        title: 'Healthy Relationship Checklist',
        description: 'A downloadable PDF worksheet to evaluate and improve your relationships, whether romantic, friendships, or family.',
        type: 'pdf',
        category: 'Relationships',
        language: 'English',
        tags: ['relationships', 'worksheet', 'self-assessment'],
        url: '#',
        thumbnail: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400',
        createdBy: admin._id,
        views: 156,
        likes: 43
      },
      {
        title: 'Study Smart, Not Hard: Academic Wellness',
        description: 'Evidence-based study techniques that promote both academic success and mental well-being.',
        type: 'article',
        content: 'Research shows that effective studying is not about spending more hours, but about using the right techniques. This article covers spaced repetition, active recall, the Pomodoro technique, and the importance of sleep for memory consolidation.',
        category: 'Academic',
        language: 'English',
        tags: ['academic', 'study tips', 'wellness', 'productivity'],
        url: '#',
        thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400',
        createdBy: admin._id,
        views: 428,
        likes: 156
      },
      {
        title: 'Breathing Exercises for Panic Attacks',
        description: 'Step-by-step video guide for 4-7-8 breathing, box breathing, and diaphragmatic breathing techniques.',
        type: 'video',
        category: 'Anxiety',
        language: 'English',
        tags: ['breathing', 'panic', 'anxiety', 'technique'],
        url: 'https://www.youtube.com/watch?v=tEmt1Znux58',
        thumbnail: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400',
        createdBy: admin._id,
        views: 567,
        likes: 201
      },
      {
        title: 'Sleep Hygiene for Better Mental Health',
        description: 'Learn how sleep impacts your mental health and practical tips for improving sleep quality as a student.',
        type: 'article',
        content: 'Sleep is the foundation of mental health. College students average only 6 hours of sleep, well below the recommended 7-9 hours. This guide covers: creating a sleep schedule, managing screen time, room environment optimization, and dealing with insomnia.',
        category: 'General',
        language: 'English',
        tags: ['sleep', 'wellness', 'mental health', 'habits'],
        url: '#',
        thumbnail: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400',
        createdBy: admin._id,
        views: 334,
        likes: 127
      },
      {
        title: 'Dealing with Loneliness on Campus',
        description: 'Strategies for building connections and overcoming feelings of isolation in college.',
        type: 'article',
        content: 'Feeling lonely on a campus full of thousands of students is more common than you think. This article explores why loneliness occurs, how social media amplifies it, and practical steps to build meaningful connections.',
        category: 'Relationships',
        language: 'English',
        tags: ['loneliness', 'social', 'connections', 'campus'],
        url: '#',
        thumbnail: 'https://images.unsplash.com/photo-1524820197278-540916411e20?w=400',
        createdBy: admin._id,
        views: 289,
        likes: 95
      },
      {
        title: 'Body Scan Meditation - 10 Minutes',
        description: 'A calming body scan meditation to release tension and improve body awareness.',
        type: 'audio',
        category: 'Stress',
        language: 'English',
        tags: ['meditation', 'body scan', 'relaxation'],
        url: 'https://www.youtube.com/watch?v=ihwcw_ofuME',
        thumbnail: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=400',
        createdBy: admin._id,
        views: 198,
        likes: 76
      },
      {
        title: 'तनाव प्रबंधन: छात्रों के लिए गाइड',
        description: 'Hindi guide on stress management techniques specifically designed for Indian college students.',
        type: 'article',
        content: 'तनाव हर छात्र के जीवन का हिस्सा है, लेकिन इसे प्रबंधित करना सीखना महत्वपूर्ण है। यह गाइड आपको तनाव को पहचानने और उससे निपटने के व्यावहारिक तरीके सिखाएगी।',
        category: 'Stress',
        language: 'Hindi',
        tags: ['stress', 'hindi', 'students', 'management'],
        url: '#',
        thumbnail: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400',
        createdBy: admin._id,
        views: 145,
        likes: 38
      }
    ]);

    console.log('📚 Resources created');

    // Create forum posts
    const posts = await Post.insertMany([
      {
        userId: student1._id,
        content: 'Just finished my midterms and feeling so relieved! 🎉 Anyone else struggling with the transition from online to offline exams? The pressure is real. Remember to take breaks and be kind to yourself during exam season! 💪',
        category: 'Academics',
        isAnonymous: false,
        likes: [student2._id, student3._id],
        likeCount: 2,
        comments: [
          { userId: student2._id, content: 'So true! I felt the same way. Taking small walks between study sessions really helped me.', isAnonymous: false },
          { userId: student3._id, content: 'Thank you for sharing! I needed to hear this. Good luck with the rest of your semester! 🌟', isAnonymous: false }
        ],
        commentCount: 2
      },
      {
        userId: student2._id,
        content: 'I\'ve been feeling really anxious about my future career prospects. Everyone around me seems to have it figured out, but I still don\'t know what I want to do. Is it okay to not have everything planned? 😔',
        category: 'Mental Health',
        isAnonymous: true,
        likes: [student1._id],
        likeCount: 1,
        comments: [
          { userId: student1._id, content: 'Absolutely! Most people figure it out along the way. Your journey is unique. Take your time. 💚', isAnonymous: false },
          { userId: counsellor1User._id, content: 'What you\'re feeling is completely normal. Career anxiety is one of the most common concerns among students. Consider booking an appointment to talk through your thoughts!', isAnonymous: false }
        ],
        commentCount: 2
      },
      {
        userId: student3._id,
        content: 'Started using the MindMate chatbot for daily check-ins and it\'s been really helpful! Having someone (even an AI) to talk to when my friends are busy is underrated. How do you all manage when you need to vent? 🤔',
        category: 'General',
        isAnonymous: false,
        likes: [student1._id, student2._id],
        likeCount: 2,
        comments: [
          { userId: student2._id, content: 'I journal! Writing things down really helps me process emotions.', isAnonymous: false }
        ],
        commentCount: 1
      },
      {
        userId: student1._id,
        content: 'Anyone dealing with roommate conflicts? It\'s affecting my sleep and study. Would appreciate some advice on how to handle it maturely without making things worse.',
        category: 'Relationships',
        isAnonymous: true,
        likes: [student3._id],
        likeCount: 1,
        comments: [
          { userId: student3._id, content: 'Communication is key! Try setting some ground rules together. If it gets too difficult, involve your RA.', isAnonymous: false }
        ],
        commentCount: 1
      },
      {
        userId: student2._id,
        content: 'Pro tip: Join at least one club that has nothing to do with your major! It\'s been a game-changer for my social life and mental health. I joined the photography club and it\'s my happy place now 📸',
        category: 'Social Life',
        isAnonymous: false,
        likes: [student1._id, student3._id],
        likeCount: 2,
        comments: [],
        commentCount: 0
      }
    ]);

    console.log('💬 Forum posts created');

    // Create mood entries
    const today = new Date();
    const moodEntries = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      moodEntries.push({
        userId: student1._id,
        moodScore: Math.max(1, Math.min(5, 3 + Math.round(Math.sin(i / 5) * 2))),
        note: i % 7 === 0 ? 'Weekly reflection: feeling more balanced this week.' : undefined,
        assessmentScores: i % 7 === 0 ? {
          anxiety1: Math.floor(Math.random() * 3),
          anxiety2: Math.floor(Math.random() * 3),
          depression1: Math.floor(Math.random() * 2),
          depression2: Math.floor(Math.random() * 2),
          totalAnxiety: Math.floor(Math.random() * 6),
          totalDepression: Math.floor(Math.random() * 4),
          totalScore: Math.floor(Math.random() * 10)
        } : undefined,
        date
      });
    }
    await MoodEntry.insertMany(moodEntries);

    console.log('📊 Mood entries created');

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('─────────────────────────────────');
    console.log('Admin:      admin@mindmate.com / admin123');
    console.log('Counsellor: priya@mindmate.com / counsellor123');
    console.log('Counsellor: rajesh@mindmate.com / counsellor123');
    console.log('Counsellor: ananya@mindmate.com / counsellor123');
    console.log('Student:    kavana@student.edu / student123');
    console.log('Student:    arjun@student.edu / student123');
    console.log('Student:    meera@student.edu / student123');
    console.log('─────────────────────────────────');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();

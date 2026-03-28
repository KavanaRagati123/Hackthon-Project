# 🧠 MindMate – Mental Health Support Platform

> Your private mental health companion – anytime, anywhere.

MindMate is a full-stack mental health support web application for college students, featuring an AI chatbot, counselling appointments, mood tracking, peer support forums, and admin analytics.

## ✨ Features

- 🤖 **AI Chatbot** – Powered by Google Gemini, with crisis detection and multilingual support
- 📅 **Counselling Appointments** – Browse and book sessions with certified counsellors
- 📊 **Mood Tracker** – Daily check-ins, PHQ-4 assessments, and trend visualizations
- 👥 **Peer Community** – Anonymous forums with category filtering and support
- 📚 **Resource Library** – Articles, videos, meditations, and worksheets
- 🛡️ **Admin Dashboard** – Real-time analytics, flagged chats, CSV exports
- 🌙 **Dark/Light Mode** – Beautiful UI with glassmorphism and smooth animations
- 🔒 **Privacy First** – JWT auth, anonymous mode, encrypted chats

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, Recharts |
| Backend | Node.js, Express, Socket.io |
| Database | MongoDB (Mongoose ODM) |
| AI | Google Gemini API |
| Auth | JWT with httpOnly cookies |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key

### 1. Clone & Setup

```bash
git clone <repo-url>
cd mindmate
```

### 2. Backend Setup

```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and Gemini API key
npm install
```

### 3. Seed Database

```bash
npm run seed
```

This creates sample users, counsellors, resources, and forum posts.

### 4. Start Backend

```bash
npm run dev
```

Server runs on http://localhost:5000

### 5. Frontend Setup

```bash
cd ../client
npm install
npm run dev
```

Frontend runs on http://localhost:5173

## 🔑 Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/mindmate
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_app_password
```

## 👤 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mindmate.com | admin123 |
| Counsellor | priya@mindmate.com | counsellor123 |
| Counsellor | rajesh@mindmate.com | counsellor123 |
| Student | kavana@student.edu | student123 |
| Student | arjun@student.edu | student123 |

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| POST | /api/auth/refresh | Refresh JWT |
| GET | /api/auth/me | Get current user |
| POST | /api/chat/message | Send message to AI |
| GET | /api/chat/history | Get chat history |
| GET | /api/appointments | Get appointments |
| POST | /api/appointments | Book appointment |
| GET | /api/resources | Get resources |
| GET | /api/posts | Get forum posts |
| POST | /api/posts | Create post |
| POST | /api/mood | Log mood |
| GET | /api/mood/history | Get mood history |
| GET | /api/admin/dashboard | Admin stats |
| GET | /health | Health check |

## 🆘 Crisis Resources

- **National Suicide Prevention Lifeline:** 988
- **Crisis Text Line:** Text HOME to 741741
- **Emergency:** 911

## 📄 License

Built with ❤️ for hackathon. All rights reserved.

# 🧠 MindGrid — AI-Powered Life Operating System

Organize Your Life. Reduce Mental Load. Think Clearly.

License: MIT • React • Node.js • MongoDB • Express • Live

🌐 Live App: https://mindgrid-three.vercel.app/  
📦 GitHub: https://github.com/HemanthM21/MINDGRID

---

## 🎯 About MindGrid

MindGrid is a web-based personal productivity OS that brings together task management, document intelligence, and journaling into a single AI-powered system.

MindGrid is built to help users manage real-life responsibilities — not just notes or reminders — by understanding information and acting on it intelligently.

We believe productivity should be:

- 🧠 **Intelligent** — AI understands your data
- 📂 **Organized** — Everything in one place
- ⏱ **Stress-free** — No missed deadlines
- 🔐 **Secure** — Your data stays private
- 🎨 **Pleasant** — Clean UI with smooth animations

---

## ✨ Key Features

### 👤 User Features

- 🔐 Secure Login & Signup (JWT based)
- 📄 Document Management
- ✅ Task Tracking
- 📝 Personal Journal
- 📊 Dashboard Overview
- 🔔 AI-ready reminders & insights

### 🧠 AI Capabilities (Foundation)

- OCR-ready document processing
- AI-based categorization (extensible)
- Smart task generation (future scope)

### 🌐 Platform Features

- 🎨 Modern animated UI (Framer Motion)
- 📱 Fully responsive design
- ⚡ Fast client-side routing
- 🔒 Secure token-based authentication

---

## 🛠 Tech Stack

### Frontend
- React (Vite)
- Framer Motion
- CSS (custom styling)

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- JWT Authentication

### Deployment
- Vercel — Frontend
- Render — Backend
- MongoDB Atlas — Database
- GitHub — Version control

---

## 📁 Project Structure (Simplified)

```
MINDGRID/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Tasks.jsx
│   │   │   ├── Documents.jsx
│   │   │   └── Journal.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   └── App.jsx
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   └── server.js
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB Atlas account
- Git

### Installation

```bash
git clone https://github.com/HemanthM21/MINDGRID.git
cd MINDGRID
```

### Frontend

```bash
cd client
npm install
npm run dev
```

### Backend

```bash
cd server
npm install
node server.js
```

---

## 🔐 Environment Variables (Backend)

Create a `.env` file:

```
MONGODB_URI=your_mongodb_atlas_url
JWT_SECRET=your_secret_key
PORT=5000
```

---

## 🌐 API Overview

### Authentication

- `POST /api/auth/signup` – Register user
- `POST /api/auth/login` – Login user
- `GET /api/auth/google` – Google OAuth (configured)

### Core Modules

- Tasks
- Documents
- Journal
- User dashboard

---

## 🎯 Why MindGrid is Unique

❌ Separate apps for notes, tasks, reminders  
❌ Manual tracking of documents & deadlines

✅ One intelligent system  
✅ AI-first foundation  
✅ Built for real-life responsibilities

**MindGrid is not just a productivity app — it's a Life Operating System.**

# VedaAI Assessment Creator

AI-powered assessment generation platform built using modern full-stack technologies. The platform enables teachers to create assignments, generate structured question papers using AI, and manage the complete workflow with real-time updates.

## Live Demo

[VedaAI Live Demo](https://veda-ai-delta-six.vercel.app/dashboard)

## GitHub Repository

[VedaAI GitHub Repository](https://github.com/KHUSHI-612/VedaAi)
---

# Features

## Assignment Creation

- Create assignments through a structured form
- Upload PDF or text files
- Set due dates
- Select question types
- Configure number of questions and marks
- Add custom instructions
- Form validation for invalid or empty inputs

## AI Question Generation

- Converts user input into structured prompts
- Generates:
  - Question sections
  - Difficulty levels
  - Marks distribution
  - Structured question papers
- AI responses are parsed and formatted before rendering

## Real-Time Processing

- WebSocket integration for live updates
- Background job processing using BullMQ
- Queue-based generation workflow

## Output Page

- Structured exam-paper style UI
- Student information section
- Question grouping by sections
- Difficulty badges
- Responsive layout for mobile and desktop

## Additional Features

- Redis caching
- PDF-ready structured layout
- Regenerate functionality
- Zustand state management

---

# Tech Stack

## Frontend

- Next.js 14
- TypeScript
- Tailwind CSS
- Zustand
- Socket.IO Client

## Backend

- Node.js
- Express.js
- TypeScript
- MongoDB
- Redis
- BullMQ
- Socket.IO

## AI Integration

- Anthropic Claude API

---

# Architecture

Frontend → Backend API → BullMQ Queue → Worker → Claude AI → MongoDB → WebSocket → Frontend

## Workflow

1. User creates an assignment from the frontend
2. Backend validates and stores request data
3. Job is added to BullMQ queue
4. Worker processes AI generation
5. Generated assessment is stored in MongoDB
6. Real-time updates are sent to frontend using WebSockets
7. Final structured question paper is displayed

---
# Project Structure

```bash
vedaai-assessment/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── queue.ts
│   │   │   ├── redis.ts
│   │   │   └── websocket.ts
│   │   ├── middleware/
│   │   ├── models/
│   │   │   └── Assessment.ts
│   │   ├── routes/
│   │   │   ├── assessments.ts
│   │   │   └── upload.ts
│   │   ├── services/
│   │   │   ├── aiService.ts
│   │   │   ├── pdfParserService.ts
│   │   │   └── pdfService.ts
│   │   ├── workers/
│   │   └── index.ts
│   ├── uploads/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── public/
│   │   └── assets...
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   │   ├── assignments/[id]/
│   │   │   │   ├── create/
│   │   │   │   ├── settings/
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── fonts/
│   │   │   ├── favicon.ico
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   ├── layout/
│   │   ├── output/
│   │   ├── lib/
│   │   ├── store/
│   │   └── types/
│   ├── .env.local
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
└── README.md


# VedaAI Assessment Creator

## Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind, Zustand
- **Backend**: Node.js, Express, TypeScript, MongoDB, Redis, BullMQ
- **AI**: Anthropic Claude API

## Setup
- `cd backend && npm install && npm run dev`
- `cd frontend && npm install && npm run dev`

## Architecture
```
Frontend → Backend API → BullMQ Queue → Worker → Claude AI → MongoDB → WebSocket → Frontend
```
# VedaAi

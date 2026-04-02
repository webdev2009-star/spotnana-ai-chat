# AI Chat — Spotnana Frontend Assessment

A production-quality AI chat application built with **Next.js 14**, **TypeScript**, and the **OpenAI API**. Demonstrates modern frontend architecture, clean UI/UX design, and real-world React patterns.

![AI Chat App](https://img.shields.io/badge/Next.js-14-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss) ![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?logo=openai)

---

## Features

| Feature | Description |
|---|---|
| **Prompt input** | Auto-resizing textarea with keyboard shortcut support |
| **AI responses** | Streamed via OpenAI's `gpt-4o-mini` model |
| **Chat history** | Persistent conversations saved to `localStorage` |
| **Multi-session** | Create, switch between, and delete multiple conversations |
| **Markdown rendering** | Bold, code blocks, inline code, headings, lists |
| **Loading states** | Animated typing indicator while waiting for the AI |
| **Error handling** | Graceful error messages for API/network failures |
| **Clear button** | Clear the current conversation without leaving it |
| **Clear all** | Remove all conversation history at once |
| **Responsive** | Works on mobile, tablet, and desktop |
| **Keyboard shortcuts** | `Enter` to send, `Shift+Enter` for new line |
| **Suggestion chips** | Clickable prompt suggestions on empty state |
| **Timestamps** | Hover any message to reveal its timestamp |

---

## Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **AI API:** [OpenAI SDK](https://github.com/openai/openai-node) (`gpt-4o-mini`)
- **Icons:** [Lucide React](https://lucide.dev/)
- **State:** React hooks + `localStorage` persistence
- **Linting:** ESLint + Next.js config

---

## Project Structure

```
spotnana-ai-chat/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts        # Next.js API route — OpenAI integration
│   ├── globals.css             # Global styles + custom scrollbar
│   ├── layout.tsx              # Root layout with metadata
│   └── page.tsx                # Main chat page (orchestrates everything)
├── components/
│   ├── LoadingSpinner.tsx      # Animated "Thinking…" indicator
│   ├── MessageBubble.tsx       # User / assistant / error message bubbles
│   ├── PromptInput.tsx         # Auto-resizing textarea + send button
│   └── Sidebar.tsx             # Session list, new chat, clear all
├── hooks/
│   └── useChatHistory.ts       # Custom hook: session CRUD + localStorage
├── types/
│   └── index.ts                # Shared TypeScript types
├── .env.local.example          # Template for environment variables
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** v18+ — [Download](https://nodejs.org/)
- **npm** v9+ (comes with Node.js)
- An **OpenAI API key** — [Get one here](https://platform.openai.com/api-keys)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/spotnana-ai-chat.git
cd spotnana-ai-chat
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and replace the placeholder with your actual OpenAI API key:

```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> **Note:** Never commit your `.env.local` file. It's already in `.gitignore`.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Create an optimised production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint checks |

---

## Architecture Decisions

### Why Next.js App Router?
The App Router enables a clean separation between server and client concerns. The OpenAI API call lives in a **Next.js Route Handler** (`app/api/chat/route.ts`), keeping the API key fully server-side — never exposed to the browser.

### Why localStorage for persistence?
For this scope, `localStorage` gives zero-config persistence with no backend or database dependency. The `useChatHistory` custom hook abstracts all read/write operations and handles edge cases (quota exceeded, corrupt data). In production, this would swap to a proper database (e.g., Postgres via Prisma).

### Component architecture
Each component has a single responsibility:
- **`PromptInput`** — manages only the input UX
- **`MessageBubble`** — renders a single message with lightweight Markdown parsing
- **`Sidebar`** — manages session navigation
- **`LoadingSpinner`** — isolated loading state display

Business logic is extracted into the `useChatHistory` hook, keeping `page.tsx` as a clean orchestration layer.

---

## API Reference

### `POST /api/chat`

Sends a conversation history to OpenAI and returns the assistant's reply.

**Request body:**
```json
{
  "messages": [
    { "role": "user", "content": "Hello!" },
    { "role": "assistant", "content": "Hi there!" },
    { "role": "user", "content": "What is React?" }
  ]
}
```

**Success response (`200`):**
```json
{
  "reply": "React is a JavaScript library for building user interfaces..."
}
```

**Error response (`4xx/5xx`):**
```json
{
  "error": "Human-readable error message"
}
```

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| Missing API key | Informative error message in the chat |
| Invalid API key (401) | "Invalid API key" error bubble |
| Rate limited (429) | "Rate limit exceeded" error bubble |
| Network failure | "Network error" error bubble |
| Empty AI response | Graceful fallback error message |

All errors are displayed inline as styled error bubbles — the app never crashes silently.

---

## Deployment

### Deploy to Vercel (recommended)

1. Push the repository to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Add `OPENAI_API_KEY` in **Settings → Environment Variables**
4. Deploy — Vercel auto-detects Next.js

```bash
# Or via Vercel CLI
npx vercel --prod
```

---

## Accessibility

- All interactive elements have `aria-label` attributes
- Keyboard navigation fully supported
- Focus rings on all focusable elements
- Semantic HTML (`<header>`, `<main>`, `<aside>`, `<button>`)
- Sufficient colour contrast ratios throughout

---

## License

MIT — see [LICENSE](LICENSE) for details.

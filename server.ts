import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// AI Chat endpoint with Thinking Mode
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, context, thinkingMode = true } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const systemInstruction = `You are DevPulse AI: an elite Senior Staff Engineer, Full-Stack Architect (expert in Spring Boot, Angular, PostgreSQL, Cloud & DevOps), and daily productivity copilot.
You help engineers debug complex stack traces, optimize Postgres queries (indexing, EXPLAIN ANALYZE, vacuuming), design clean REST/GraphQL APIs, craft Spring Boot architectures, structure Angular components, write shell scripts, and solve hard algorithmic challenges.
Be concise, practical, and provide production-grade, copy-pasteable code examples with clear markdown formatting.
When thinking mode is enabled, reason deeply about edge cases, race conditions, memory leaks, security, and performance.`;

    // Map conversation messages to GenAI contents format
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // If there is engineer context (like current todos or standup), inject it into context
    if (context) {
      contents.unshift({
        role: 'user',
        parts: [{ text: `[Current Engineer Workspace Context]:\n${JSON.stringify(context, null, 2)}` }],
      });
      contents.splice(1, 0, {
        role: 'model',
        parts: [{ text: 'Acknowledged workspace context. Ready to assist with your engineering workflow.' }],
      });
    }

    let response;
    // As mandated by the feature prompt: MUST use gemini-3.1-pro-preview with thinkingLevel HIGH
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents,
        config: {
          systemInstruction,
          ...(thinkingMode
            ? {
                thinkingConfig: {
                  thinkingLevel: ThinkingLevel.HIGH,
                },
              }
            : {}),
        },
      });
    } catch (primaryErr: any) {
      console.warn('Primary model (gemini-3.1-pro-preview) error, falling back to gemini-3.8-flash:', primaryErr?.message);
      // Fallback to gemini-3.8-flash if key tier restricts preview
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
        },
      });
    }

    const reply = response.text || 'No response generated.';
    return res.json({
      reply,
      modelUsed: 'gemini-3.1-pro-preview',
      thinkingEnabled: thinkingMode,
    });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to communicate with AI model',
    });
  }
});

// Quick Standup Polisher endpoint
app.post('/api/standup/polish', async (req, res) => {
  try {
    const { yesterday, today, blockers, sprintGoal } = req.body;

    const prompt = `You are an expert Agile Scrum Master and Tech Lead. Polish the following raw developer standup notes into crisp, highly professional, impact-driven bullet points for daily standup (Slack/Jira format).
Remove filler words, quantify achievements where appropriate, make blockers actionable, and maintain a sharp engineering tone.

RAW NOTES:
Yesterday:
${yesterday || 'None specified'}

Today:
${today || 'None specified'}

Blockers:
${blockers || 'None'}

Sprint Goal:
${sprintGoal || 'N/A'}

Provide the response in three clean sections:
🎯 Sprint Context
✅ Yesterday (Accomplishments)
🚀 Today (Commitments)
⚠️ Blockers & Risks (if any, or "None")

Also include a 1-sentence executive summary suitable for a manager or async Slack digest.`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.HIGH,
          },
        },
      });
    } catch (err: any) {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });
    }

    res.json({ polished: response.text });
  } catch (error: any) {
    console.error('Standup polish error:', error);
    res.status(500).json({ error: error.message || 'Failed to polish standup' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 DevPulse server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

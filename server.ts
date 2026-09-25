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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isTransientOrQuotaError(err: any): { is503: boolean; isQuota: boolean; isUnavailable: boolean; cleanMessage: string } {
  const raw = typeof err === 'string' ? err : err?.message || JSON.stringify(err || '');
  let parsedMsg = raw;
  try {
    const jsonParsed = JSON.parse(raw);
    if (jsonParsed?.error?.message) {
      parsedMsg = jsonParsed.error.message;
    }
  } catch {
    // Keep raw string
  }

  const is503 = raw.includes('503') || raw.includes('UNAVAILABLE') || raw.includes('high demand');
  const isQuota = raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED') || raw.includes('quota') || raw.includes('limit: 0');
  const isUnavailable = is503 || isQuota || raw.includes('unavailable');

  return { is503, isQuota, isUnavailable, cleanMessage: parsedMsg };
}

interface CascadeParams {
  contents: any;
  systemInstruction?: string;
  preferredModel?: string;
  thinkingMode?: boolean;
}

interface CascadeResult {
  reply: string;
  modelUsed: string;
  modelDisplayName: string;
  fallbackOccurred: boolean;
  fallbackNotice: string | null;
  thinkingEnabled: boolean;
}

const MODEL_NAMES: Record<string, string> = {
  'gemini-3.1-pro-preview': 'Gemini 3.1 Pro (Thinking)',
  'gemini-3.8-flash': 'Gemini 3.8 Flash',
  'gemini-3.1-flash-lite': 'Gemini 3.1 Flash Lite',
  'gemini-flash-latest': 'Gemini Flash Latest',
};

async function executeGeminiWithCascade({
  contents,
  systemInstruction,
  preferredModel = 'auto',
  thinkingMode = true,
}: CascadeParams): Promise<CascadeResult> {
  // Build ordered candidate chain based on user preference
  let candidates: string[] = [];

  if (preferredModel === 'gemini-3.1-pro-preview') {
    candidates = ['gemini-3.1-pro-preview', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
  } else if (preferredModel === 'gemini-3.8-flash') {
    candidates = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  } else if (preferredModel === 'gemini-3.1-flash-lite') {
    candidates = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
  } else {
    // Auto mode: prioritize balanced flash, fallback to ultra-resilient flash-lite
    candidates = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.1-pro-preview'];
  }

  // Deduplicate
  candidates = Array.from(new Set(candidates));

  let lastError: any = null;
  let fallbackReason: string | null = null;
  let primaryModelAttempted = candidates[0];

  for (let i = 0; i < candidates.length; i++) {
    const currentModel = candidates[i];
    const isPrimary = i === 0;

    const config: any = {};
    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }

    if (thinkingMode) {
      if (currentModel === 'gemini-3.1-pro-preview') {
        config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
      } else if (currentModel === 'gemini-3.8-flash' || currentModel === 'gemini-3.1-flash-lite') {
        config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
      }
    }

    // Try current model (with 1 quick backoff retry if 503 high demand)
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: currentModel,
          contents,
          config,
        });

        const reply = response.text || 'No response content returned by Gemini.';
        const fallbackOccurred = currentModel !== primaryModelAttempted;

        return {
          reply,
          modelUsed: currentModel,
          modelDisplayName: MODEL_NAMES[currentModel] || currentModel,
          fallbackOccurred,
          fallbackNotice: fallbackOccurred ? fallbackReason : null,
          thinkingEnabled: thinkingMode,
        };
      } catch (err: any) {
        lastError = err;
        const errInfo = isTransientOrQuotaError(err);
        console.warn(`[Gemini Cascade] Model "${currentModel}" attempt ${attempt} failed: ${errInfo.cleanMessage}`);

        // If it's a 503 high-demand spike and we haven't retried yet, pause briefly before retrying this model
        if (errInfo.is503 && attempt === 1) {
          await sleep(650);
          continue;
        }

        // Prepare fallback notice for next model
        if (errInfo.is503) {
          fallbackReason = `${MODEL_NAMES[currentModel] || currentModel} is currently experiencing high demand (503). DevPulse automatically served your request using resilient failover.`;
        } else if (errInfo.isQuota) {
          fallbackReason = `${MODEL_NAMES[currentModel] || currentModel} quota limit reached. DevPulse smoothly switched to high-availability Flash tier.`;
        } else {
          fallbackReason = `${MODEL_NAMES[currentModel] || currentModel} encountered a temporary glitch. DevPulse safely routed to fallback model.`;
        }

        // Break attempt loop to move to the next candidate model
        break;
      }
    }
  }

  // If all models failed, throw clean error
  const finalInfo = isTransientOrQuotaError(lastError);
  const errorObj = new Error(
    finalInfo.is503
      ? 'The Gemini service is currently experiencing high demand on Google servers. Spikes are temporary; please retry in a few seconds or switch to Gemini 3.1 Flash Lite.'
      : finalInfo.cleanMessage || 'Failed to communicate with AI model'
  );
  (errorObj as any).status = finalInfo.is503 ? 503 : 500;
  throw errorObj;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// Models status endpoint for UI model picker
app.get('/api/ai/models', (req, res) => {
  res.json({
    models: [
      {
        id: 'auto',
        name: 'Auto-Adaptive (Recommended)',
        badge: 'Zero-Downtime',
        badgeColor: 'emerald',
        description: 'Dynamically routes to the fastest, most available Gemini model with seamless failover.',
      },
      {
        id: 'gemini-3.1-pro-preview',
        name: 'Gemini 3.1 Pro (Thinking)',
        badge: 'Deep Reasoning',
        badgeColor: 'purple',
        description: 'Flagship reasoning engine with ThinkingLevel.HIGH for complex algorithms and architectures.',
      },
      {
        id: 'gemini-3.8-flash',
        name: 'Gemini 3.8 Flash',
        badge: 'Standard Flash',
        badgeColor: 'cyan',
        description: 'Balanced high-speed reasoning with low latency.',
      },
      {
        id: 'gemini-3.1-flash-lite',
        name: 'Gemini 3.1 Flash Lite',
        badge: 'Ultra-Resilient',
        badgeColor: 'amber',
        description: 'High availability and sub-second responses, resilient against 503 demand spikes.',
      },
    ],
  });
});

// AI Chat endpoint with Multi-Model Cascade
app.post('/api/chat', async (req, res) => {
  try {
    const { 
      messages, 
      context, 
      thinkingMode = true,
      preferredModel = 'auto' 
    } = req.body;

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

    const result = await executeGeminiWithCascade({
      contents,
      systemInstruction,
      preferredModel,
      thinkingMode,
    });

    return res.json(result);
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    const status = error.status || 500;
    return res.status(status).json({
      error: error.message || 'Failed to communicate with AI model',
      status,
    });
  }
});

// Quick Standup Polisher endpoint with Multi-Model Cascade
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

    const result = await executeGeminiWithCascade({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      preferredModel: 'gemini-3.1-flash-lite', // Super fast & resilient for standup
      thinkingMode: false,
    });

    res.json({ polished: result.reply, modelUsed: result.modelUsed });
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

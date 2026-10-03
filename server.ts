import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Set up data persistence directory
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data) as T;
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Multer storage in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
});

// Gemini SDK initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_INSTRUCTION = `You are a rigorous root-cause analyst for a business diagnostic tool. Your job is to separate symptoms from root causes using only the evidence provided — never invent data or outside facts about the specific company.

Always distinguish between CONFIRMED (directly stated in the provided data), LIKELY (a reasonable inference from the data), and SPECULATIVE (plausible but unverified) — label every claim with one of these three levels, every time.

Never present a speculative claim as if it were confirmed. If you don't have enough information to identify a root cause, say so directly and state exactly what additional information or data would resolve the uncertainty, rather than guessing.

When generating solutions, tie each one explicitly to the root cause it addresses, and give a realistic cost/time/risk estimate — if you cannot estimate a real number, say 'Low/Medium/High' rather than inventing a precise figure.

Never state a recommendation as certain. Always frame final recommendations as requiring human validation before action, since you do not have direct access to the organization's live systems or full context.

Be direct and structured, not conversational filler. Every sentence should carry information relevant to the investigation.`;

// Auth endpoints
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const users = readJsonFile<any[]>(USERS_FILE, []);
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'User with this email already exists' });
  }

  const newUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: email.toLowerCase(),
    password, // For single-workspace app diagnostic prototype
    name: name || email.split('@')[0],
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeJsonFile(USERS_FILE, users);

  return res.json({
    user: { id: newUser.id, email: newUser.email, name: newUser.name },
    token: `token_${newUser.id}`,
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const users = readJsonFile<any[]>(USERS_FILE, []);
  let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  // Default demo user if none exists
  if (!user && (email === 'demo@enterprise.com' || users.length === 0)) {
    user = {
      id: `user_${Date.now()}`,
      email: email.toLowerCase(),
      password,
      name: email.split('@')[0],
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    writeJsonFile(USERS_FILE, users);
  }

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  return res.json({
    user: { id: user.id, email: user.email, name: user.name },
    token: `token_${user.id}`,
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.replace('Bearer ', '');
  const userId = token.replace('token_', '');

  const users = readJsonFile<any[]>(USERS_FILE, []);
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(401).json({ error: 'Session expired' });
  }

  return res.json({
    user: { id: user.id, email: user.email, name: user.name },
  });
});

// Document upload & parsing
app.post('/api/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, mimetype, size, buffer } = req.file;
    let extractedText = '';

    if (mimetype === 'application/pdf' || originalname.endsWith('.pdf')) {
      try {
        // Dynamic import to be resilient
        const pdfParseModule: any = await import('pdf-parse');
        const pdfParser = pdfParseModule.default || pdfParseModule;
        const pdfData = await pdfParser(buffer);
        extractedText = pdfData.text || '';
      } catch (pdfErr) {
        console.warn('PDF parser fallback to utf8 string decoding:', pdfErr);
        extractedText = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
      }
    } else {
      // txt, csv, json, md, log, etc.
      extractedText = buffer.toString('utf-8');
    }

    // Clean up excessive whitespace
    extractedText = extractedText.replace(/\r\n/g, '\n').slice(0, 50000); // 50k character max per document for high performance

    const doc = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: originalname,
      size,
      type: mimetype || 'text/plain',
      textContent: extractedText,
      uploadedAt: new Date().toISOString(),
    };

    return res.json({ doc });
  } catch (err: any) {
    console.error('File parse error:', err);
    return res.status(500).json({ error: err.message || 'Failed to parse file' });
  }
});

// Session CRUD
app.get('/api/sessions', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'default';
  const allSessions = readJsonFile<any[]>(SESSIONS_FILE, []);
  const userSessions = allSessions.filter((s) => !s.userId || s.userId === userId || userId === 'all');
  return res.json({ sessions: userSessions });
});

app.get('/api/sessions/:id', (req: Request, res: Response) => {
  const allSessions = readJsonFile<any[]>(SESSIONS_FILE, []);
  const session = allSessions.find((s) => s.id === req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  return res.json({ session });
});

app.post('/api/sessions', (req: Request, res: Response) => {
  const sessionData = req.body;
  if (!sessionData || !sessionData.id) {
    return res.status(400).json({ error: 'Invalid session data' });
  }

  const allSessions = readJsonFile<any[]>(SESSIONS_FILE, []);
  const index = allSessions.findIndex((s) => s.id === sessionData.id);

  sessionData.updatedAt = new Date().toISOString();

  if (index >= 0) {
    allSessions[index] = sessionData;
  } else {
    sessionData.createdAt = sessionData.createdAt || new Date().toISOString();
    allSessions.unshift(sessionData);
  }

  writeJsonFile(SESSIONS_FILE, allSessions);
  return res.json({ session: sessionData });
});

app.delete('/api/sessions/:id', (req: Request, res: Response) => {
  const allSessions = readJsonFile<any[]>(SESSIONS_FILE, []);
  const filtered = allSessions.filter((s) => s.id !== req.params.id);
  writeJsonFile(SESSIONS_FILE, filtered);
  return res.json({ success: true });
});

// Stage 2: Clarifying Questions Generation
app.post('/api/ai/clarifying-questions', async (req: Request, res: Response) => {
  try {
    const { category, description, documentsText } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Problem description is required' });
    }

    const prompt = `Based on the following intake report for a business operational problem:
Problem Category: ${category || 'Operations'}
Description of the Problem:
${description}

${documentsText ? `Attached Supporting Evidence/Documents:\n${documentsText.slice(0, 15000)}` : 'No attached documents provided.'}

Your task: Ask 3 to 5 targeted, highly diagnostic clarifying questions before proceeding to root cause analysis.
Address these critical investigative dimensions:
1. When exactly the problem started (timing, pattern, seasonality)
2. What changed around that time (process adjustments, software, supplier, personnel, equipment maintenance)
3. What quantitative data or audit evidence currently exists
4. What containment or corrective actions have already been attempted, and what were the outcomes
5. Scope of impact (isolated line vs entire facility, financial magnitude)

Do NOT offer solutions or conclusions yet. Ask precise, business-appropriate questions.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          description: '3 to 5 targeted clarifying questions',
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING, description: 'The precise clarifying question' },
              rationale: { type: Type.STRING, description: 'Why this question is critical to diagnose root causes' },
              focusArea: {
                type: Type.STRING,
                description: 'Timing/Onset, Recent Changes, Data/Evidence, Prior Attempts, or Scope/Impact',
              },
            },
            required: ['id', 'question', 'rationale', 'focusArea'],
          },
        },
      },
    });

    const text = response.text || '[]';
    const questions = JSON.parse(text);

    return res.json({ questions });
  } catch (err: any) {
    console.error('Clarifying questions error:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate clarifying questions' });
  }
});

// Stage 3: Root Cause Tree Investigation
app.post('/api/ai/investigate-root-causes', async (req: Request, res: Response) => {
  try {
    const { category, description, documentsText, clarifyingQA } = req.body;

    let qaContext = '';
    if (Array.isArray(clarifyingQA) && clarifyingQA.length > 0) {
      qaContext = clarifyingQA
        .map((qa: any, i: number) => `Q${i + 1} (${qa.focusArea}): ${qa.question}\nAnswer: ${qa.answer || 'Not answered'}`)
        .join('\n\n');
    }

    const prompt = `Synthesize all accumulated evidence to generate a structured, rigorous root-cause breakdown.

PROBLEM CATEGORY: ${category || 'Operations'}
STATED PROBLEM / SYMPTOM:
${description}

CLARIFYING QUESTIONS & OPERATIONAL ANSWERS:
${qaContext || 'No clarifying answers provided.'}

SUPPORTING DOCUMENTS / DATA EXPORTS:
${documentsText ? documentsText.slice(0, 20000) : 'No external documents uploaded.'}

STRICT ANALYTICAL RULES:
1. Top node must be the primary stated symptom (do not mistake the symptom for the root cause).
2. Deconstruct contributing factors and root causes into the standard business categories:
   - People
   - Process
   - Equipment
   - Materials
   - Environment
   - Management
3. MANDATORY CONFIDENCE LABELS:
   Tag EVERY single node/branch with exactly one of these three labels:
   - CONFIRMED: directly stated or proven in the provided data or answers.
   - LIKELY: a reasonable, logical operational inference from the provided facts.
   - SPECULATIVE: plausible hypothesis but unverified — lacks supporting data.
4. MANDATORY EVIDENCE CITATION:
   For every branch, you MUST provide a clear one-line reason citing what specific evidence from the user's input/documents supports it. If there is no specific data supporting it, state exactly: "no supporting data provided, inference only."
5. If a branch is SPECULATIVE or LIKELY, state what missing data or test would confirm or refute it.
6. Provide between 5 and 10 thoroughly reasoned root-cause nodes across relevant categories.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            symptom: { type: Type.STRING, description: 'The core stated business symptom' },
            summary: { type: Type.STRING, description: 'Direct 2-sentence diagnostic assessment' },
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  category: {
                    type: Type.STRING,
                    description: 'People, Process, Equipment, Materials, Environment, or Management',
                  },
                  title: { type: Type.STRING, description: 'Root cause or contributing factor title' },
                  description: { type: Type.STRING, description: 'Detailed mechanism of how this causes the symptom' },
                  confidence: {
                    type: Type.STRING,
                    description: 'MUST be either CONFIRMED, LIKELY, or SPECULATIVE',
                  },
                  evidence: {
                    type: Type.STRING,
                    description: 'One-line reason citing what evidence supports it, or state "no supporting data provided, inference only."',
                  },
                  missingData: {
                    type: Type.STRING,
                    description: 'Specific data or audit needed to resolve uncertainty if speculative or likely',
                  },
                  subFactors: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Key immediate sub-factors or symptoms associated with this cause',
                  },
                },
                required: ['id', 'category', 'title', 'description', 'confidence', 'evidence'],
              },
            },
          },
          required: ['symptom', 'summary', 'nodes'],
        },
      },
    });

    const text = response.text || '{}';
    const breakdown = JSON.parse(text);

    return res.json({ breakdown });
  } catch (err: any) {
    console.error('Root cause investigation error:', err);
    return res.status(500).json({ error: err.message || 'Failed to analyze root causes' });
  }
});

// Stage 4: Solutions Comparison Generation
app.post('/api/ai/generate-solutions', async (req: Request, res: Response) => {
  try {
    const { symptom, confirmedAndLikelyCauses, contextSummary } = req.body;

    if (!confirmedAndLikelyCauses || confirmedAndLikelyCauses.length === 0) {
      return res.status(400).json({ error: 'At least one Confirmed or Likely root cause is required' });
    }

    const causesText = confirmedAndLikelyCauses
      .map(
        (c: any, i: number) =>
          `Root Cause ${i + 1} [${c.confidence}] (${c.category}): ${c.title}\nMechanism: ${c.description}\nEvidence: ${c.evidence}`
      )
      .join('\n\n');

    const prompt = `PRIMARY SYMPTOM: ${symptom}
${contextSummary ? `CONTEXT:\n${contextSummary}\n` : ''}

TARGETED ROOT CAUSES (CONFIRMED OR LIKELY):
${causesText}

YOUR TASK:
For each CONFIRMED or LIKELY root cause listed above, generate 2 to 4 distinct, actionable operational solutions.
Tie each solution explicitly to the root cause it addresses.

Provide a comparative matrix structure with:
1. Root Cause Addressed (id, title, confidence)
2. Solution Title & Concrete Action Plan (step-by-step implementation)
3. Estimated Cost: Realistic estimate if known, otherwise classify as 'Low', 'Medium', or 'High' (never invent exact false numbers).
4. Estimated Timeframe: (e.g. '1-2 weeks', '30-45 days', 'Immediate / 48 hours', '3-6 months')
5. Risk Level: 'Low', 'Medium', or 'High' with a brief risk consideration
6. Expected Impact: 'High', 'Medium', or 'Low' with specific operational metric improvement
7. Implementation Complexity: 'Low', 'Medium', or 'High'`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          description: 'Comparative solutions matrix',
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              rootCauseId: { type: Type.STRING },
              rootCauseTitle: { type: Type.STRING },
              rootCauseConfidence: { type: Type.STRING },
              solution: { type: Type.STRING, description: 'Concise solution name' },
              actionPlan: { type: Type.STRING, description: 'Operational steps to execute this solution' },
              estimatedCost: { type: Type.STRING, description: 'Low, Medium, or High, or realistic budget range' },
              estimatedTimeframe: { type: Type.STRING, description: 'Implementation timeframe' },
              riskLevel: { type: Type.STRING, description: 'Low, Medium, or High' },
              expectedImpact: { type: Type.STRING, description: 'High, Medium, or Low with expected operational result' },
              complexity: { type: Type.STRING, description: 'Low, Medium, or High' },
            },
            required: [
              'id',
              'rootCauseId',
              'rootCauseTitle',
              'rootCauseConfidence',
              'solution',
              'actionPlan',
              'estimatedCost',
              'estimatedTimeframe',
              'riskLevel',
              'expectedImpact',
              'complexity',
            ],
          },
        },
      },
    });

    const text = response.text || '[]';
    const solutions = JSON.parse(text);

    return res.json({ solutions });
  } catch (err: any) {
    console.error('Solutions generation error:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate solutions' });
  }
});

// Stage 5: Final Recommendation Generation
app.post('/api/ai/generate-recommendation', async (req: Request, res: Response) => {
  try {
    const { session } = req.body;

    const intake = session.intake || {};
    const symptom = session.investigation?.symptom || intake.description || 'Operational Issue';
    const nodes = session.investigation?.nodes || [];
    const solutions = session.solutions?.items || [];

    const prompt = `EXECUTIVE INVESTIGATION DOSSIER:

PROBLEM:
Category: ${intake.category || 'General'}
Symptom: ${symptom}

ROOT CAUSE ANALYSIS:
${nodes.map((n: any) => `[${n.confidence}] ${n.category}: ${n.title} (Evidence: ${n.evidence})`).join('\n')}

EVALUATED SOLUTIONS:
${solutions.map((s: any) => `- Addressing "${s.rootCauseTitle}": ${s.solution} [Cost: ${s.estimatedCost}, Time: ${s.estimatedTimeframe}, Risk: ${s.riskLevel}, Impact: ${s.expectedImpact}]`).join('\n')}

YOUR TASK:
Provide a clear, decisive final recommendation:
1. Name ONE primary path forward (synthesizing the most impactful, low-to-medium risk solution combination).
2. Explain the detailed strategic and operational rationale for choosing this primary path over the alternatives.
3. MANDATORY DISCLAIMER: You must include this EXACT verbatim sentence:
   "This recommendation is based on the information provided and requires validation by someone with direct operational knowledge before action is taken."
4. Provide immediate execution milestones: Day 1-14, Day 15-30, Day 31-60.
5. Identify critical operational risks and leading indicators to monitor.
6. Note any alternative paths considered and why they were deferred or rejected.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primaryPath: { type: Type.STRING, description: 'One primary path forward' },
            rationale: { type: Type.STRING, description: 'Operational justification comparing trade-offs' },
            disclaimer: {
              type: Type.STRING,
              description: 'Must match verbatim: This recommendation is based on the information provided and requires validation by someone with direct operational knowledge before action is taken.',
            },
            immediateMilestones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  period: { type: Type.STRING, description: 'e.g. Days 1-14, Days 15-30' },
                  action: { type: Type.STRING, description: 'Specific milestone action' },
                  owner: { type: Type.STRING, description: 'Role or department responsible' },
                },
                required: ['period', 'action'],
              },
            },
            risksToMonitor: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Operational risks and leading indicators',
            },
            alternativePathsConsidered: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Alternative options considered and why deferred',
            },
          },
          required: ['primaryPath', 'rationale', 'disclaimer', 'immediateMilestones', 'risksToMonitor'],
        },
      },
    });

    const text = response.text || '{}';
    const recommendation = JSON.parse(text);

    // Enforce the exact disclaimer phrasing if model deviated
    recommendation.disclaimer =
      'This recommendation is based on the information provided and requires validation by someone with direct operational knowledge before action is taken.';

    return res.json({ recommendation });
  } catch (err: any) {
    console.error('Recommendation generation error:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate recommendation' });
  }
});

// Vite middleware for dev or static build serving for prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`RootCause AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

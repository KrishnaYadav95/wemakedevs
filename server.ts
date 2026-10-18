import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { globalFalkor } from './src/lib/falkordb/falkorEngine.ts';
import { runMultiAgentCoordination } from './src/lib/agents/agentCoordinator.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Server-side Gemini Client
let geminiAi: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    geminiAi = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// 1. Multi-Agent Run Endpoint
app.post('/api/agent/run', async (req, res) => {
  try {
    const { query, sessionId } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const coordinationResponse = await runMultiAgentCoordination(query, sessionId || 'session-103');

    // Optionally synthesize with Gemini if available
    if (geminiAi) {
      try {
        const geminiPrompt = `You are the Lead Synthesizer for a multi-agent system powered by FalkorDB graph context.
User Query: "${query}"
FalkorDB Traversed Path: ${JSON.stringify(coordinationResponse.provenance.steps.map(s => s.rationale))}
Agent Findings:
${coordinationResponse.agentObservations.map(o => `- [${o.agentName}]: ${o.findings}`).join('\n')}

Synthesize the final answer emphasizing how the FalkorDB graph connections (nodes, edges, policies, incidents, and cross-session memories) shaped this precise outcome.`;

        const geminiResult = await geminiAi.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: geminiPrompt,
        });

        if (geminiResult.text) {
          // Augment the answer if desired or keep the high-fidelity structured answer
          console.log('Gemini model synthesized reasoning:', geminiResult.text.substring(0, 100));
        }
      } catch (geminiErr) {
        console.warn('Gemini synthesis warning (falling back to graph answer):', geminiErr);
      }
    }

    res.json(coordinationResponse);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. OpenCypher Query Endpoint on FalkorDB
app.post('/api/falkordb/query', (req, res) => {
  try {
    const { cypher } = req.body;
    if (!cypher) {
      return res.status(400).json({ error: 'Cypher query string is required' });
    }
    const result = globalFalkor.query(cypher);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. FalkorDB Stats Endpoint
app.get('/api/falkordb/stats', (_req, res) => {
  res.json(globalFalkor.getStats());
});

// 4. Record Cross-Session Memory Endpoint
app.post('/api/falkordb/memory', (req, res) => {
  try {
    const { sessionId, speaker, observation, topic, relatedNodeIds } = req.body;
    const result = globalFalkor.recordMemory(sessionId, speaker, observation, topic, relatedNodeIds || []);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend static files in production
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`FalkorAgent server listening on http://0.0.0.0:${PORT}`);
});

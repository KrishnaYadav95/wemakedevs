import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { globalFalkor } from './src/lib/falkordb/falkorEngine.ts';
import { runMultiAgentCoordination } from './src/lib/agents/agentCoordinator.ts';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'falkor-api-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url?.startsWith('/api/')) {
              res.setHeader('Content-Type', 'application/json');

              // Read body for POST
              let bodyStr = '';
              req.on('data', (chunk) => {
                bodyStr += chunk;
              });

              req.on('end', async () => {
                try {
                  const body = bodyStr ? JSON.parse(bodyStr) : {};

                  if (req.url === '/api/agent/run' && req.method === 'POST') {
                    const result = await runMultiAgentCoordination(body.query || '', body.sessionId || 'session-103');
                    res.statusCode = 200;
                    return res.end(JSON.stringify(result));
                  }

                  if (req.url === '/api/falkordb/query' && req.method === 'POST') {
                    const result = globalFalkor.query(body.cypher || '');
                    res.statusCode = 200;
                    return res.end(JSON.stringify(result));
                  }

                  if (req.url === '/api/falkordb/stats' && req.method === 'GET') {
                    const stats = globalFalkor.getStats();
                    res.statusCode = 200;
                    return res.end(JSON.stringify(stats));
                  }

                  if (req.url === '/api/falkordb/memory' && req.method === 'POST') {
                    const result = globalFalkor.recordMemory(
                      body.sessionId || 'session-103',
                      body.speaker || 'Anonymous',
                      body.observation || '',
                      body.topic || 'General',
                      body.relatedNodeIds || []
                    );
                    res.statusCode = 200;
                    return res.end(JSON.stringify(result));
                  }

                  res.statusCode = 404;
                  return res.end(JSON.stringify({ error: 'Endpoint not found' }));
                } catch (err: any) {
                  res.statusCode = 500;
                  return res.end(JSON.stringify({ error: err.message }));
                }
              });
              return;
            }
            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

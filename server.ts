import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { getEnvConfig } from './server/config/env.ts';
import { connectToDatabase } from './server/db/connection.ts';
import { createApiApp } from './server/app.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cfg = getEnvConfig();

async function startServer() {
  const app = createApiApp();

  // Initiate MongoDB Atlas connection without blocking server port binding
  void connectToDatabase();

  if (cfg.nodeEnv === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(cfg.port, '0.0.0.0', () => {
    console.log(`[Server] Listening on http://0.0.0.0:${cfg.port} (${cfg.nodeEnv})`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});

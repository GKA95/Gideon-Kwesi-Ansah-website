import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { getEnvConfig, getSystemConfigStatus } from './server/config/env.ts';
import { connectToDatabase, isDatabaseConnected } from './server/db/connection.ts';
import { ProjectModel } from './server/db/models.ts';
import { publicRouter } from './server/routes/public.ts';
import { adminRouter } from './server/routes/admin.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cfg = getEnvConfig();

async function createApp() {
  const app = express();
  app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginResourcePolicy: false,
      frameguard: false,
    })
  );

  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(cookieParser());

  // Prevent search indexing of all admin routes and APIs
  app.use((req, res, next) => {
    if (req.path.startsWith('/admin') || req.path.startsWith('/api/admin')) {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    }
    next();
  });

  // Initiate MongoDB Atlas connection without blocking server port binding
  void connectToDatabase();

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      dbConnected: isDatabaseConnected(),
      configStatus: getSystemConfigStatus(),
    });
  });

  app.use('/api/public', publicRouter);
  app.use('/api/admin', adminRouter);

  // Public robots.txt (explicitly excludes /admin and /api/admin)
  app.get('/robots.txt', (req, res) => {
    const baseUrl =
      cfg.appUrl && cfg.appUrl !== 'MY_APP_URL'
        ? cfg.appUrl.replace(/\/$/, '')
        : `${req.protocol}://${req.get('host')}`;

    res.type('text/plain').send(
      [
        'User-agent: *',
        'Allow: /',
        'Disallow: /admin',
        'Disallow: /admin/',
        'Disallow: /api/admin',
        '',
        `Sitemap: ${baseUrl}/sitemap.xml`,
      ].join('\n')
    );
  });

  // Public sitemap.xml (includes ONLY public routes and published projects)
  app.get('/sitemap.xml', async (req, res) => {
    const baseUrl =
      cfg.appUrl && cfg.appUrl !== 'MY_APP_URL'
        ? cfg.appUrl.replace(/\/$/, '')
        : `${req.protocol}://${req.get('host')}`;

    const staticPaths = ['/', '/about', '/services', '/projects', '/research', '/contact'];
    let projectPaths: Array<{ loc: string; lastmod?: string }> = [];

    if (isDatabaseConnected()) {
      const published = await ProjectModel.find({ status: 'published' })
        .select('slug updatedAt')
        .lean();
      projectPaths = published.map((p) => ({
        loc: `/projects/${encodeURIComponent(p.slug)}`,
        lastmod: p.updatedAt ? new Date(p.updatedAt).toISOString().split('T')[0] : undefined,
      }));
    }

    const urls = [
      ...staticPaths.map((loc) => ({ loc, lastmod: undefined })),
      ...projectPaths,
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${baseUrl}${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
  </url>`
  )
  .join('\n')}
</urlset>`;

    res.type('application/xml').send(xml);
  });

  // Centralized API error handler (never leaks stack traces or secrets)
  app.use('/api', (err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[API Error]:', err);
    res.status(500).json({ error: 'An unexpected server error occurred.' });
  });

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

createApp().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});

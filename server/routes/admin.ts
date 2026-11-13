import crypto from 'node:crypto';
import { Router, type Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { getEnvConfig, getSystemConfigStatus } from '../config/env.ts';
import { connectToDatabase, getLastDatabaseError, isDatabaseConnected } from '../db/connection.ts';
import {
  AboutContentModel,
  AdminActivityModel,
  AdminSessionModel,
  AdminUserModel,
  ContactMessageModel,
  HomepageContentModel,
  ProjectModel,
  ResearchContentModel,
  ServiceItemModel,
  SiteSettingsModel,
  SkillModel,
  TestimonialModel,
  UploadedDocumentModel,
} from '../db/models.ts';
import { seedInitialPortfolioData } from '../db/seed.ts';
import {
  type AuthenticatedAdminRequest,
  SESSION_COOKIE_NAME,
  getSessionCookieOptions,
  hashToken,
  loginRateLimiter,
  requireAdminAuth,
  requireCsrf,
  safeCompareStrings,
  sanitizePlainText,
  setupRateLimiter,
} from '../middleware/auth.ts';
import { deleteFromCloudinary, uploadBufferToCloudinary } from '../services/cloudinary.ts';

export const adminRouter = Router();

const uploadImageMulter = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, or GIF images up to 5MB are allowed.'));
    }
  },
});

const uploadDocMulter = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF documents up to 10MB are allowed.'));
    }
  },
});

async function logAdminActivity(
  adminEmail: string,
  action: string,
  entityType: string,
  entityId: string,
  summary: string
) {
  try {
    await AdminActivityModel.create({
      adminEmail,
      action,
      entityType,
      entityId,
      summary,
    });
  } catch (err) {
    console.error('[Activity] Failed to record activity:', err);
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 90);
}

function isAllowedOrigin(originCandidate: string, appUrl: string, requestHost?: string): boolean {
  try {
    const url = new URL(originCandidate);
    if (url.protocol === 'https:' && (url.hostname.endsWith('.run.app') || url.hostname.endsWith('.vercel.app'))) {
      return true;
    }
    if (requestHost && url.host === requestHost) return true;
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return true;
    if (appUrl && appUrl !== 'MY_APP_URL') {
      const configured = new URL(appUrl);
      if (configured.origin === url.origin) return true;
    }
    return false;
  } catch {
    return false;
  }
}

function signOAuthState(payload: { nonce: string; redirectUri: string; exp: number }, secret: string): string {
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function verifyOAuthState(
  stateToken: string,
  secret: string
): { nonce: string; redirectUri: string; exp: number } | null {
  const parts = stateToken.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  if (!safeCompareStrings(sig, expectedSig)) return null;
  try {
    const decoded = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as {
      nonce?: string;
      redirectUri?: string;
      exp?: number;
    };
    if (!decoded.nonce || !decoded.redirectUri || !decoded.exp) return null;
    if (Date.now() > decoded.exp) return null;
    return { nonce: decoded.nonce, redirectUri: decoded.redirectUri, exp: decoded.exp };
  } catch {
    return null;
  }
}

function sendOAuthPopupHtml(res: Response, payload: { type: 'GOOGLE_AUTH_SUCCESS' | 'GOOGLE_AUTH_ERROR'; error?: string }) {
  const serialized = JSON.stringify(payload).replace(/</g, '\\u003c');
  const fallbackTarget =
    payload.type === 'GOOGLE_AUTH_SUCCESS'
      ? '/admin/dashboard'
      : `/admin/login?authError=${encodeURIComponent(payload.error || 'Google sign-in failed.')}`;
  const serializedTarget = JSON.stringify(fallbackTarget).replace(/</g, '\\u003c');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!doctype html>
<html>
  <head><title>Google Sign-In</title></head>
  <body style="font-family: system-ui, sans-serif; padding: 24px; text-align: center;">
    <script>
      if (window.opener) {
        window.opener.postMessage(${serialized}, '*');
        window.close();
      } else {
        window.location.replace(${serializedTarget});
      }
    </script>
    <p>${payload.type === 'GOOGLE_AUTH_SUCCESS' ? 'Authentication successful. Redirecting...' : 'Authentication could not be completed. Redirecting...'}</p>
  </body>
</html>`);
}

const setupSchema = z.object({
  setupToken: z.string().min(1, 'Setup token is required.'),
  name: z.string().trim().min(2).max(100).default('Gideon Kwesi Ansah'),
  email: z.string().trim().email('Valid Google email address is required.').max(180),
});

adminRouter.get('/status', async (_req, res) => {
  try {
    if (!isDatabaseConnected()) {
      await connectToDatabase();
    }
    const dbConnected = isDatabaseConnected();
    const adminCount = dbConnected ? await AdminUserModel.countDocuments() : 0;
    const { adminAllowedEmail } = getEnvConfig();

    res.json({
      dbConnected,
      dbError: dbConnected ? null : getLastDatabaseError(),
      adminExists: adminCount > 0 || Boolean(adminAllowedEmail),
      configStatus: getSystemConfigStatus(),
    });
  } catch (err) {
    console.error('[Admin Status] Error:', err);
    res.status(500).json({ error: 'Unable to check system status.' });
  }
});

adminRouter.post('/setup', setupRateLimiter, async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      await connectToDatabase();
    }
    if (!isDatabaseConnected()) {
      res.status(503).json({
        error: 'MongoDB Atlas is not connected. Configure MONGODB_URI first.',
      });
      return;
    }

    const { adminSetupToken } = getEnvConfig();
    if (!adminSetupToken) {
      res.status(503).json({
        error: 'ADMIN_SETUP_TOKEN is not configured on the server.',
      });
      return;
    }

    const existingCount = await AdminUserModel.countDocuments();
    if (existingCount > 0) {
      res.status(403).json({
        error: 'Administrator setup is closed. An authorised administrator email already exists.',
      });
      return;
    }

    const parsed = setupSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Invalid setup input.',
      });
      return;
    }

    if (!safeCompareStrings(parsed.data.setupToken.trim(), adminSetupToken)) {
      res.status(403).json({ error: 'Invalid setup token.' });
      return;
    }

    const admin = await AdminUserModel.create({
      email: parsed.data.email.toLowerCase(),
      name: sanitizePlainText(parsed.data.name, 100),
      passwordHash: '',
      role: 'admin',
    });

    await seedInitialPortfolioData();
    await logAdminActivity(
      admin.email,
      'SETUP',
      'AdminUser',
      String(admin._id),
      'Authorized administrator Google account via one-time setup'
    );

    res.status(201).json({
      success: true,
      message: 'Authorised Google administrator email saved. You can now sign in with Google.',
    });
  } catch (err) {
    console.error('[Admin Setup] Error:', err);
    res.status(500).json({ error: 'Failed to complete administrator setup.' });
  }
});

adminRouter.get('/auth/google/url', loginRateLimiter, (req, res) => {
  const cfg = getEnvConfig();
  if (!cfg.googleClientId || !cfg.googleClientSecret) {
    res.status(503).json({
      error: 'Google Sign-In is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.',
    });
    return;
  }
  if (!cfg.sessionSecret || cfg.sessionSecret.length < 16) {
    res.status(503).json({
      error: 'SESSION_SECRET (at least 16 characters) is required for secure Google Sign-In.',
    });
    return;
  }

  const requestedOrigin = typeof req.query.origin === 'string' ? req.query.origin.trim() : '';
  const reqHost = req.get('host');
  const fallbackOrigin =
    cfg.appUrl && cfg.appUrl !== 'MY_APP_URL' && cfg.appUrl !== 'http://localhost:3000'
      ? cfg.appUrl.replace(/\/$/, '')
      : `${req.protocol}://${reqHost}`;

  const activeOrigin = isAllowedOrigin(requestedOrigin, cfg.appUrl, reqHost)
    ? requestedOrigin.replace(/\/$/, '')
    : fallbackOrigin;

  const redirectUri = `${activeOrigin}/api/admin/auth/google/callback`;
  const state = signOAuthState(
    {
      nonce: crypto.randomBytes(16).toString('hex'),
      redirectUri,
      exp: Date.now() + 10 * 60 * 1000,
    },
    cfg.sessionSecret
  );

  const params = new URLSearchParams({
    client_id: cfg.googleClientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'select_account',
    state,
  });

  res.json({
    url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    redirectUri,
  });
});

adminRouter.get(['/auth/google/callback', '/auth/google/callback/'], async (req, res) => {
  try {
    const cfg = getEnvConfig();
    if (!cfg.googleClientId || !cfg.googleClientSecret || !cfg.sessionSecret) {
      sendOAuthPopupHtml(res, {
        type: 'GOOGLE_AUTH_ERROR',
        error: 'Google Sign-In server credentials are not configured.',
      });
      return;
    }

    if (typeof req.query.error === 'string') {
      sendOAuthPopupHtml(res, {
        type: 'GOOGLE_AUTH_ERROR',
        error: 'Google sign-in was cancelled or denied.',
      });
      return;
    }

    const code = typeof req.query.code === 'string' ? req.query.code : '';
    const stateRaw = typeof req.query.state === 'string' ? req.query.state : '';
    const verifiedState = verifyOAuthState(stateRaw, cfg.sessionSecret);
    if (!code || !verifiedState) {
      sendOAuthPopupHtml(res, {
        type: 'GOOGLE_AUTH_ERROR',
        error: 'Invalid or expired sign-in state. Please try again.',
      });
      return;
    }

    if (!isDatabaseConnected()) {
      await connectToDatabase();
    }
    if (!isDatabaseConnected()) {
      sendOAuthPopupHtml(res, {
        type: 'GOOGLE_AUTH_ERROR',
        error: 'MongoDB database is not connected.',
      });
      return;
    }

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: cfg.googleClientId,
        client_secret: cfg.googleClientSecret,
        redirect_uri: verifiedState.redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    });

    if (!tokenRes.ok) {
      sendOAuthPopupHtml(res, {
        type: 'GOOGLE_AUTH_ERROR',
        error: 'Failed to exchange Google authorization code.',
      });
      return;
    }

    const tokenJson = (await tokenRes.json()) as { access_token?: string };
    if (!tokenJson.access_token) {
      sendOAuthPopupHtml(res, {
        type: 'GOOGLE_AUTH_ERROR',
        error: 'Google access token was not returned.',
      });
      return;
    }

    const profileRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    });

    if (!profileRes.ok) {
      sendOAuthPopupHtml(res, {
        type: 'GOOGLE_AUTH_ERROR',
        error: 'Unable to verify Google account profile.',
      });
      return;
    }

    const profile = (await profileRes.json()) as {
      email?: string;
      email_verified?: boolean;
      name?: string;
      sub?: string;
    };

    const googleEmail = (profile.email || '').trim().toLowerCase();
    if (!googleEmail || !profile.email_verified) {
      sendOAuthPopupHtml(res, {
        type: 'GOOGLE_AUTH_ERROR',
        error: 'A verified Google email address is required.',
      });
      return;
    }

    const existingCount = await AdminUserModel.countDocuments();
    let admin = await AdminUserModel.findOne({ email: googleEmail });

    if (!admin) {
      if (existingCount === 0 && cfg.adminAllowedEmail && googleEmail === cfg.adminAllowedEmail) {
        admin = await AdminUserModel.create({
          email: googleEmail,
          name: sanitizePlainText(profile.name || 'Gideon Kwesi Ansah', 100),
          googleSub: profile.sub || '',
          role: 'admin',
        });
      } else {
        sendOAuthPopupHtml(res, {
          type: 'GOOGLE_AUTH_ERROR',
          error:
            existingCount === 0
              ? 'No administrator email is authorised yet. Complete /admin/setup or set ADMIN_ALLOWED_EMAIL.'
              : 'This Google account is not authorised to access the admin dashboard.',
        });
        return;
      }
    }

    // Purge expired sessions
    await AdminSessionModel.deleteMany({ expiresAt: { $lte: new Date() } });

    const rawSessionToken = crypto.randomBytes(32).toString('hex');
    const csrfToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await AdminSessionModel.create({
      tokenHash: hashToken(rawSessionToken),
      csrfToken,
      adminId: admin._id,
      userAgent: String(req.headers['user-agent'] || '').slice(0, 300),
      ipAddress: String(req.ip || '').slice(0, 100),
      lastActiveAt: new Date(),
      expiresAt,
    });

    if (profile.sub && !admin.googleSub) {
      admin.googleSub = profile.sub;
    }
    admin.lastLoginAt = new Date();
    await admin.save();

    await seedInitialPortfolioData();
    await logAdminActivity(
      admin.email,
      'LOGIN',
      'AdminSession',
      '',
      'Signed in to admin dashboard via Google'
    );

    res.cookie(SESSION_COOKIE_NAME, rawSessionToken, getSessionCookieOptions(req));
    sendOAuthPopupHtml(res, { type: 'GOOGLE_AUTH_SUCCESS' });
  } catch (err) {
    console.error('[Google OAuth Callback] Error:', err);
    sendOAuthPopupHtml(res, {
      type: 'GOOGLE_AUTH_ERROR',
      error: 'An unexpected error occurred during Google sign-in.',
    });
  }
});

adminRouter.post('/logout', requireAdminAuth, requireCsrf, async (req: AuthenticatedAdminRequest, res) => {
  try {
    if (req.sessionId) {
      await AdminSessionModel.deleteOne({ _id: req.sessionId });
    }
    if (req.admin) {
      await logAdminActivity(req.admin.email, 'LOGOUT', 'AdminSession', '', 'Signed out');
    }
    res.clearCookie(SESSION_COOKIE_NAME, getSessionCookieOptions(req));
    res.json({ success: true });
  } catch (err) {
    console.error('[Admin Logout] Error:', err);
    res.status(500).json({ error: 'Logout failed.' });
  }
});

// Protect all routes below this point
adminRouter.use(requireAdminAuth);
adminRouter.use(requireCsrf);

adminRouter.get('/me', async (req: AuthenticatedAdminRequest, res) => {
  res.json({
    admin: req.admin,
    csrfToken: req.csrfToken,
    configStatus: getSystemConfigStatus(),
  });
});

adminRouter.get('/overview', async (_req, res) => {
  try {
    await seedInitialPortfolioData();
    const [
      totalProjects,
      publishedProjects,
      draftProjects,
      archivedProjects,
      totalMessages,
      unreadMessages,
      totalServices,
      totalDocuments,
      totalTestimonials,
      recentActivity,
    ] = await Promise.all([
      ProjectModel.countDocuments(),
      ProjectModel.countDocuments({ status: 'published' }),
      ProjectModel.countDocuments({ status: 'draft' }),
      ProjectModel.countDocuments({ status: 'archived' }),
      ContactMessageModel.countDocuments(),
      ContactMessageModel.countDocuments({ status: 'unread' }),
      ServiceItemModel.countDocuments(),
      UploadedDocumentModel.countDocuments(),
      TestimonialModel.countDocuments(),
      AdminActivityModel.find().sort({ createdAt: -1 }).limit(12).lean(),
    ]);

    res.json({
      stats: {
        totalProjects,
        publishedProjects,
        draftProjects,
        archivedProjects,
        totalMessages,
        unreadMessages,
        totalServices,
        totalDocuments,
        totalTestimonials,
      },
      recentActivity,
      configStatus: getSystemConfigStatus(),
    });
  } catch (err) {
    console.error('[Admin Overview] Error:', err);
    res.status(500).json({ error: 'Failed to load dashboard overview.' });
  }
});

adminRouter.get('/preview', async (_req, res) => {
  try {
    const [settings, homepageDoc, aboutDoc, services, projects, researchDoc, skills, testimonials, documents] =
      await Promise.all([
        SiteSettingsModel.findOne({ singletonKey: 'default' }).lean(),
        HomepageContentModel.findOne({ singletonKey: 'default' }).lean(),
        AboutContentModel.findOne({ singletonKey: 'default' }).lean(),
        ServiceItemModel.find().sort({ order: 1, createdAt: 1 }).lean(),
        ProjectModel.find({ status: { $ne: 'archived' } }).sort({ order: 1, createdAt: -1 }).lean(),
        ResearchContentModel.findOne({ singletonKey: 'default' }).lean(),
        SkillModel.find().sort({ order: 1 }).lean(),
        TestimonialModel.find().sort({ order: 1 }).lean(),
        UploadedDocumentModel.find().sort({ createdAt: -1 }).lean(),
      ]);

    res.json({
      settings,
      homepage: homepageDoc?.draft || homepageDoc?.published || null,
      about: aboutDoc?.draft || aboutDoc?.published || null,
      services,
      projects,
      featuredProjects: projects.filter((p) => p.featured).slice(0, 6),
      research: researchDoc?.draft || researchDoc?.published || null,
      skills,
      testimonials,
      documents,
    });
  } catch (err) {
    console.error('[Admin Preview] Error:', err);
    res.status(500).json({ error: 'Failed to load preview.' });
  }
});

// Settings
const settingsSchema = z.object({
  siteName: z.string().trim().min(1).max(120),
  profileName: z.string().trim().min(1).max(120),
  logoUrl: z.string().trim().max(500).optional().default(''),
  profilePhotoUrl: z.string().trim().max(500).optional().default(''),
  contactEmail: z.string().trim().max(180).optional().default(''),
  whatsappNumber: z.string().trim().max(60).optional().default(''),
  linkedinUrl: z.string().trim().max(300).optional().default(''),
  githubUrl: z.string().trim().max(300).optional().default(''),
  cvDocumentUrl: z.string().trim().max(500).optional().default(''),
  cvFileName: z.string().trim().max(200).optional().default(''),
  seoTitle: z.string().trim().max(160).optional().default(''),
  seoDescription: z.string().trim().max(320).optional().default(''),
  socialImageUrl: z.string().trim().max(500).optional().default(''),
  footerText: z.string().trim().max(320).optional().default(''),
});

adminRouter.get('/settings', async (_req, res) => {
  const settings = await SiteSettingsModel.findOne({ singletonKey: 'default' }).lean();
  res.json({ settings });
});

adminRouter.put('/settings', async (req: AuthenticatedAdminRequest, res) => {
  try {
    const parsed = settingsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid settings.' });
      return;
    }

    const updated = await SiteSettingsModel.findOneAndUpdate(
      { singletonKey: 'default' },
      { $set: parsed.data },
      { new: true, upsert: true }
    );
    await logAdminActivity(req.admin!.email, 'UPDATE', 'SiteSettings', '', 'Updated website settings');
    res.json({ settings: updated });
  } catch (err) {
    console.error('[Admin Settings] Error:', err);
    res.status(500).json({ error: 'Failed to update settings.' });
  }
});

// Homepage Content
adminRouter.get('/homepage', async (_req, res) => {
  const doc = await HomepageContentModel.findOne({ singletonKey: 'default' }).lean();
  res.json({ homepage: doc });
});

adminRouter.put('/homepage', async (req: AuthenticatedAdminRequest, res) => {
  try {
    const { action, data } = req.body as {
      action?: 'save_draft' | 'publish' | 'unpublish';
      data?: Record<string, unknown>;
    };

    const doc =
      (await HomepageContentModel.findOne({ singletonKey: 'default' })) ||
      new HomepageContentModel({ singletonKey: 'default' });

    if (data && typeof data === 'object') {
      const cleanPayload = {
        heroName: sanitizePlainText(data.heroName, 120),
        heroHeadline: sanitizePlainText(data.heroHeadline, 300),
        heroSubheadline: sanitizePlainText(data.heroSubheadline, 1000),
        primaryCtaText: sanitizePlainText(data.primaryCtaText, 60),
        secondaryCtaText: sanitizePlainText(data.secondaryCtaText, 60),
        shortIntroTitle: sanitizePlainText(data.shortIntroTitle, 180),
        shortIntroBody: sanitizePlainText(data.shortIntroBody, 2000),
        expertiseSectionTitle: sanitizePlainText(data.expertiseSectionTitle, 140),
        featuredSectionTitle: sanitizePlainText(data.featuredSectionTitle, 140),
        featuredSectionSubtitle: sanitizePlainText(data.featuredSectionSubtitle, 500),
        ctaTitle: sanitizePlainText(data.ctaTitle, 200),
        ctaBody: sanitizePlainText(data.ctaBody, 1000),
        ctaButtonText: sanitizePlainText(data.ctaButtonText, 60),
      };
      doc.draft = cleanPayload;
      if (action === 'publish') {
        doc.published = cleanPayload;
        doc.isPublished = true;
      }
    }

    if (action === 'unpublish') {
      doc.isPublished = false;
    } else if (action === 'publish' && !data) {
      doc.published = doc.draft;
      doc.isPublished = true;
    }

    await doc.save();
    await logAdminActivity(
      req.admin!.email,
      action === 'publish' ? 'PUBLISH' : action === 'unpublish' ? 'UNPUBLISH' : 'DRAFT',
      'HomepageContent',
      '',
      `Homepage content (${action || 'save_draft'})`
    );
    res.json({ homepage: doc });
  } catch (err) {
    console.error('[Admin Homepage] Error:', err);
    res.status(500).json({ error: 'Failed to save homepage content.' });
  }
});

// About Content
adminRouter.get('/about', async (_req, res) => {
  const doc = await AboutContentModel.findOne({ singletonKey: 'default' }).lean();
  res.json({ about: doc });
});

adminRouter.put('/about', async (req: AuthenticatedAdminRequest, res) => {
  try {
    const { action, data } = req.body as {
      action?: 'save_draft' | 'publish' | 'unpublish';
      data?: Record<string, unknown>;
    };

    const doc =
      (await AboutContentModel.findOne({ singletonKey: 'default' })) ||
      new AboutContentModel({ singletonKey: 'default' });

    if (data && typeof data === 'object') {
      const cleanPayload = {
        fullName: sanitizePlainText(data.fullName, 120),
        degree: sanitizePlainText(data.degree, 180),
        university: sanitizePlainText(data.university, 220),
        graduationYear: sanitizePlainText(data.graduationYear, 20),
        honors: sanitizePlainText(data.honors, 120),
        professionalBackground: sanitizePlainText(data.professionalBackground, 3000),
        educationDetails: sanitizePlainText(data.educationDetails, 3000),
        technicalInterests: sanitizePlainText(data.technicalInterests, 3000),
        professionalApproach: sanitizePlainText(data.professionalApproach, 3000),
        careerAndResearchInterests: sanitizePlainText(data.careerAndResearchInterests, 3000),
      };
      doc.draft = cleanPayload;
      if (action === 'publish') {
        doc.published = cleanPayload;
        doc.isPublished = true;
      }
    }

    if (action === 'unpublish') {
      doc.isPublished = false;
    } else if (action === 'publish' && !data) {
      doc.published = doc.draft;
      doc.isPublished = true;
    }

    await doc.save();
    await logAdminActivity(
      req.admin!.email,
      action === 'publish' ? 'PUBLISH' : 'DRAFT',
      'AboutContent',
      '',
      `About content (${action || 'save_draft'})`
    );
    res.json({ about: doc });
  } catch (err) {
    console.error('[Admin About] Error:', err);
    res.status(500).json({ error: 'Failed to save About page content.' });
  }
});

// Services & AI Automation Management
const serviceSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().optional(),
  shortSummary: z.string().trim().max(400).optional().default(''),
  description: z.string().trim().min(5).max(3000),
  capabilities: z.array(z.string().trim().min(1).max(200)).default([]),
  category: z.enum(['Website Development', 'Data Analytics', 'AI Automation', 'Electrical Engineering']),
  visualUrl: z.string().trim().max(500).optional().default(''),
  relatedProjectSlugs: z.array(z.string().trim()).optional().default([]),
  order: z.number().int().min(0).max(999).default(0),
  isPublished: z.boolean().default(true),
  isAiAutomation: z.boolean().default(false),
  aiProblemSolved: z.string().trim().max(2000).optional().default(''),
  aiDemoUrl: z.string().trim().max(500).optional().default(''),
  aiCaseStudy: z.string().trim().max(4000).optional().default(''),
  aiResults: z.string().trim().max(2000).optional().default(''),
});

adminRouter.get('/services', async (_req, res) => {
  const services = await ServiceItemModel.find().sort({ order: 1, createdAt: 1 }).lean();
  res.json({ services });
});

adminRouter.post('/services', async (req: AuthenticatedAdminRequest, res) => {
  try {
    const parsed = serviceSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid service input.' });
      return;
    }
    const slug = parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.title);
    const created = await ServiceItemModel.create({
      ...parsed.data,
      slug: `${slug}-${Date.now().toString(36).slice(-4)}`,
    });
    await logAdminActivity(req.admin!.email, 'CREATE', 'Service', String(created._id), `Created service "${created.title}"`);
    res.status(201).json({ service: created });
  } catch (err) {
    console.error('[Admin Services] Create error:', err);
    res.status(500).json({ error: 'Failed to create service.' });
  }
});

adminRouter.put('/services/:id', async (req: AuthenticatedAdminRequest, res) => {
  try {
    const parsed = serviceSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid service input.' });
      return;
    }
    const updated = await ServiceItemModel.findByIdAndUpdate(
      req.params.id,
      { $set: parsed.data },
      { new: true }
    );
    if (!updated) {
      res.status(404).json({ error: 'Service not found.' });
      return;
    }
    await logAdminActivity(req.admin!.email, 'UPDATE', 'Service', String(updated._id), `Updated service "${updated.title}"`);
    res.json({ service: updated });
  } catch (err) {
    console.error('[Admin Services] Update error:', err);
    res.status(500).json({ error: 'Failed to update service.' });
  }
});

adminRouter.delete('/services/:id', async (req: AuthenticatedAdminRequest, res) => {
  try {
    const deleted = await ServiceItemModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Service not found.' });
      return;
    }
    await logAdminActivity(req.admin!.email, 'DELETE', 'Service', String(deleted._id), `Deleted service "${deleted.title}"`);
    res.json({ success: true });
  } catch (err) {
    console.error('[Admin Services] Delete error:', err);
    res.status(500).json({ error: 'Failed to delete service.' });
  }
});

// Projects Management
const projectSchema = z.object({
  title: z.string().trim().min(2).max(200),
  slug: z.string().trim().optional(),
  category: z.enum(['Website Development', 'Data Analytics', 'AI Automation', 'Electrical Engineering']),
  shortDescription: z.string().trim().min(5).max(500),
  overview: z.string().trim().max(4000).optional().default(''),
  problemStatement: z.string().trim().max(4000).optional().default(''),
  objectives: z.array(z.string().trim().min(1).max(300)).optional().default([]),
  contribution: z.string().trim().max(4000).optional().default(''),
  technologies: z.array(z.string().trim().min(1).max(80)).optional().default([]),
  developmentProcess: z.string().trim().max(5000).optional().default(''),
  resultsAndFindings: z.string().trim().max(5000).optional().default(''),
  coverImageUrl: z.string().trim().max(500).optional().default(''),
  galleryImages: z.array(z.string().trim().max(500)).optional().default([]),
  githubUrl: z.string().trim().max(500).optional().default(''),
  liveDemoUrl: z.string().trim().max(500).optional().default(''),
  demoVideoUrl: z.string().trim().max(500).optional().default(''),
  businessProblemSolved: z.string().trim().max(2000).optional().default(''),
  caseStudyDetails: z.string().trim().max(5000).optional().default(''),
  featured: z.boolean().optional().default(false),
  order: z.number().int().min(0).max(9999).optional().default(0),
  status: z.enum(['draft', 'published', 'archived']).optional().default('draft'),
});

adminRouter.get('/projects', async (_req, res) => {
  const projects = await ProjectModel.find().sort({ order: 1, createdAt: -1 }).lean();
  res.json({ projects });
});

adminRouter.post('/projects', async (req: AuthenticatedAdminRequest, res) => {
  try {
    const parsed = projectSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid project data.' });
      return;
    }

    let baseSlug = parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.title);
    if (!baseSlug) baseSlug = `project-${Date.now()}`;
    const existing = await ProjectModel.findOne({ slug: baseSlug });
    const finalSlug = existing ? `${baseSlug}-${Date.now().toString(36).slice(-4)}` : baseSlug;

    const project = await ProjectModel.create({
      ...parsed.data,
      slug: finalSlug,
    });

    await logAdminActivity(
      req.admin!.email,
      'CREATE',
      'Project',
      String(project._id),
      `Created project "${project.title}" (${project.status})`
    );
    res.status(201).json({ project });
  } catch (err) {
    console.error('[Admin Projects] Create error:', err);
    res.status(500).json({ error: 'Failed to create project.' });
  }
});

adminRouter.put('/projects/:id', async (req: AuthenticatedAdminRequest, res) => {
  try {
    const parsed = projectSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid project data.' });
      return;
    }

    const dataToUpdate: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.slug) {
      dataToUpdate.slug = slugify(parsed.data.slug);
    }

    const updated = await ProjectModel.findByIdAndUpdate(
      req.params.id,
      { $set: dataToUpdate },
      { new: true }
    );
    if (!updated) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }

    await logAdminActivity(
      req.admin!.email,
      'UPDATE',
      'Project',
      String(updated._id),
      `Updated project "${updated.title}" (${updated.status})`
    );
    res.json({ project: updated });
  } catch (err) {
    console.error('[Admin Projects] Update error:', err);
    res.status(500).json({ error: 'Failed to update project.' });
  }
});

adminRouter.patch('/projects/reorder', async (req: AuthenticatedAdminRequest, res) => {
  try {
    const { orderedIds } = req.body as { orderedIds?: string[] };
    if (!Array.isArray(orderedIds)) {
      res.status(400).json({ error: 'orderedIds array is required.' });
      return;
    }

    await Promise.all(
      orderedIds.map((id, idx) =>
        ProjectModel.findByIdAndUpdate(id, { $set: { order: idx + 1 } })
      )
    );
    await logAdminActivity(req.admin!.email, 'REORDER', 'Project', '', 'Reordered portfolio projects');
    res.json({ success: true });
  } catch (err) {
    console.error('[Admin Projects] Reorder error:', err);
    res.status(500).json({ error: 'Failed to reorder projects.' });
  }
});

adminRouter.patch('/projects/:id/status', async (req: AuthenticatedAdminRequest, res) => {
  try {
    const schema = z.object({
      status: z.enum(['draft', 'published', 'archived']).optional(),
      featured: z.boolean().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid status payload.' });
      return;
    }

    const updated = await ProjectModel.findByIdAndUpdate(
      req.params.id,
      { $set: parsed.data },
      { new: true }
    );
    if (!updated) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }
    await logAdminActivity(
      req.admin!.email,
      'STATUS',
      'Project',
      String(updated._id),
      `Updated "${updated.title}" status to ${updated.status}`
    );
    res.json({ project: updated });
  } catch (err) {
    console.error('[Admin Projects] Status error:', err);
    res.status(500).json({ error: 'Failed to update project status.' });
  }
});

adminRouter.delete('/projects/:id', async (req: AuthenticatedAdminRequest, res) => {
  try {
    const deleted = await ProjectModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }
    await logAdminActivity(req.admin!.email, 'DELETE', 'Project', String(deleted._id), `Deleted project "${deleted.title}"`);
    res.json({ success: true });
  } catch (err) {
    console.error('[Admin Projects] Delete error:', err);
    res.status(500).json({ error: 'Failed to delete project.' });
  }
});

// Research Content
adminRouter.get('/research', async (_req, res) => {
  const research = await ResearchContentModel.findOne({ singletonKey: 'default' }).lean();
  res.json({ research });
});

adminRouter.put('/research', async (req: AuthenticatedAdminRequest, res) => {
  try {
    const { action, data } = req.body as {
      action?: 'save_draft' | 'publish' | 'unpublish';
      data?: {
        academicBackground?: string;
        engineeringResearchSummary?: string;
        dataScienceSummary?: string;
        renewableEnergySummary?: string;
        researchInterests?: Array<{ title: string; description: string; order?: number }>;
        futurePublicationsNote?: string;
      };
    };

    const doc =
      (await ResearchContentModel.findOne({ singletonKey: 'default' })) ||
      new ResearchContentModel({ singletonKey: 'default' });

    if (data && typeof data === 'object') {
      const cleanInterests = Array.isArray(data.researchInterests)
        ? data.researchInterests
            .filter((item) => item && typeof item.title === 'string' && item.title.trim())
            .map((item, idx) => ({
              title: sanitizePlainText(item.title, 180),
              description: sanitizePlainText(item.description || '', 800),
              order: typeof item.order === 'number' ? item.order : idx + 1,
            }))
        : [];

      const payload = {
        academicBackground: sanitizePlainText(data.academicBackground, 3000),
        engineeringResearchSummary: sanitizePlainText(data.engineeringResearchSummary, 3000),
        dataScienceSummary: sanitizePlainText(data.dataScienceSummary, 3000),
        renewableEnergySummary: sanitizePlainText(data.renewableEnergySummary, 3000),
        researchInterests: cleanInterests,
        futurePublicationsNote: sanitizePlainText(data.futurePublicationsNote, 2000),
      };

      doc.draft = payload;
      if (action === 'publish') {
        doc.published = payload;
        doc.isPublished = true;
      }
    }

    if (action === 'unpublish') {
      doc.isPublished = false;
    } else if (action === 'publish' && !data) {
      doc.published = doc.draft;
      doc.isPublished = true;
    }

    await doc.save();
    await logAdminActivity(
      req.admin!.email,
      action === 'publish' ? 'PUBLISH' : 'DRAFT',
      'ResearchContent',
      '',
      `Research content (${action || 'save_draft'})`
    );
    res.json({ research: doc });
  } catch (err) {
    console.error('[Admin Research] Error:', err);
    res.status(500).json({ error: 'Failed to update research content.' });
  }
});

// Skills
const skillSchema = z.object({
  name: z.string().trim().min(1).max(100),
  category: z.enum(['Website Development', 'Data Analytics & ML', 'AI Automation', 'Electrical Engineering']),
  order: z.number().int().min(0).max(999).default(0),
  isPublished: z.boolean().default(true),
});

adminRouter.get('/skills', async (_req, res) => {
  const skills = await SkillModel.find().sort({ order: 1, name: 1 }).lean();
  res.json({ skills });
});

adminRouter.post('/skills', async (req: AuthenticatedAdminRequest, res) => {
  const parsed = skillSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid skill.' });
    return;
  }
  const skill = await SkillModel.create(parsed.data);
  await logAdminActivity(req.admin!.email, 'CREATE', 'Skill', String(skill._id), `Added skill "${skill.name}"`);
  res.status(201).json({ skill });
});

adminRouter.put('/skills/:id', async (req: AuthenticatedAdminRequest, res) => {
  const parsed = skillSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid skill.' });
    return;
  }
  const skill = await SkillModel.findByIdAndUpdate(req.params.id, { $set: parsed.data }, { new: true });
  if (!skill) {
    res.status(404).json({ error: 'Skill not found.' });
    return;
  }
  res.json({ skill });
});

adminRouter.delete('/skills/:id', async (req: AuthenticatedAdminRequest, res) => {
  const deleted = await SkillModel.findByIdAndDelete(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Skill not found.' });
    return;
  }
  await logAdminActivity(req.admin!.email, 'DELETE', 'Skill', String(deleted._id), `Removed skill "${deleted.name}"`);
  res.json({ success: true });
});

// Testimonials
const testimonialSchema = z.object({
  personName: z.string().trim().min(2).max(120),
  positionOrOrg: z.string().trim().min(2).max(160),
  content: z.string().trim().min(10).max(2000),
  photoUrl: z.string().trim().max(500).optional().default(''),
  isPublished: z.boolean().default(false),
  order: z.number().int().min(0).max(999).default(0),
});

adminRouter.get('/testimonials', async (_req, res) => {
  const testimonials = await TestimonialModel.find().sort({ order: 1, createdAt: -1 }).lean();
  res.json({ testimonials });
});

adminRouter.post('/testimonials', async (req: AuthenticatedAdminRequest, res) => {
  const parsed = testimonialSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid testimonial.' });
    return;
  }
  const created = await TestimonialModel.create(parsed.data);
  await logAdminActivity(req.admin!.email, 'CREATE', 'Testimonial', String(created._id), `Added testimonial from "${created.personName}"`);
  res.status(201).json({ testimonial: created });
});

adminRouter.put('/testimonials/:id', async (req: AuthenticatedAdminRequest, res) => {
  const parsed = testimonialSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid testimonial.' });
    return;
  }
  const updated = await TestimonialModel.findByIdAndUpdate(req.params.id, { $set: parsed.data }, { new: true });
  if (!updated) {
    res.status(404).json({ error: 'Testimonial not found.' });
    return;
  }
  res.json({ testimonial: updated });
});

adminRouter.delete('/testimonials/:id', async (req: AuthenticatedAdminRequest, res) => {
  const deleted = await TestimonialModel.findByIdAndDelete(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Testimonial not found.' });
    return;
  }
  await logAdminActivity(req.admin!.email, 'DELETE', 'Testimonial', String(deleted._id), `Deleted testimonial from "${deleted.personName}"`);
  res.json({ success: true });
});

// Contact Messages Inbox
adminRouter.get('/messages', async (req, res) => {
  const statusFilter = typeof req.query.status === 'string' ? req.query.status : '';
  const query: Record<string, unknown> = {};
  if (['unread', 'read', 'archived'].includes(statusFilter)) {
    query.status = statusFilter;
  }
  const messages = await ContactMessageModel.find(query).sort({ createdAt: -1 }).lean();
  res.json({ messages });
});

adminRouter.patch('/messages/:id', async (req: AuthenticatedAdminRequest, res) => {
  const schema = z.object({
    status: z.enum(['unread', 'read', 'archived']),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid message status.' });
    return;
  }

  const updateFields: Record<string, unknown> = { status: parsed.data.status };
  if (parsed.data.status === 'read') {
    updateFields.readAt = new Date();
  }
  const updated = await ContactMessageModel.findByIdAndUpdate(
    req.params.id,
    { $set: updateFields },
    { new: true }
  );
  if (!updated) {
    res.status(404).json({ error: 'Message not found.' });
    return;
  }
  res.json({ message: updated });
});

adminRouter.delete('/messages/:id', async (req: AuthenticatedAdminRequest, res) => {
  const deleted = await ContactMessageModel.findByIdAndDelete(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Message not found.' });
    return;
  }
  await logAdminActivity(req.admin!.email, 'DELETE', 'ContactMessage', String(deleted._id), `Deleted contact message from ${deleted.fullName}`);
  res.json({ success: true });
});

// Cloudinary Image Upload
adminRouter.post(
  '/upload/image',
  (req, res, next) => {
    uploadImageMulter.single('file')(req, res, (err) => {
      if (err) {
        res.status(400).json({ error: err.message || 'Invalid image upload.' });
        return;
      }
      next();
    });
  },
  async (req: AuthenticatedAdminRequest, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No image file provided.' });
        return;
      }

      const folderSuffix = sanitizePlainText(req.body?.folder || 'general', 40).replace(/[^a-zA-Z0-9_-]/g, '');
      const result = await uploadBufferToCloudinary(req.file.buffer, {
        folder: `gka-portfolio/images/${folderSuffix || 'general'}`,
        resourceType: 'image',
        originalName: req.file.originalname,
      });

      await logAdminActivity(
        req.admin!.email,
        'UPLOAD',
        'Image',
        result.publicId,
        `Uploaded image ${req.file.originalname}`
      );
      res.status(201).json(result);
    } catch (err) {
      if (err instanceof Error && err.message === 'CLOUDINARY_NOT_CONFIGURED') {
        res.status(503).json({
          error: 'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
        });
        return;
      }
      console.error('[Upload Image] Error:', err);
      res.status(500).json({ error: 'Image upload failed.' });
    }
  }
);

// Documents & CV Upload
adminRouter.get('/documents', async (_req, res) => {
  const documents = await UploadedDocumentModel.find().sort({ createdAt: -1 }).lean();
  res.json({ documents });
});

adminRouter.post(
  '/documents',
  (req, res, next) => {
    uploadDocMulter.single('file')(req, res, (err) => {
      if (err) {
        res.status(400).json({ error: err.message || 'Invalid PDF upload.' });
        return;
      }
      next();
    });
  },
  async (req: AuthenticatedAdminRequest, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'Please select a PDF file to upload.' });
        return;
      }

      const docSchema = z.object({
        title: z.string().trim().min(2).max(160),
        category: z.enum(['cv', 'research_report', 'technical_paper', 'other']),
        description: z.string().trim().max(800).optional().default(''),
        isPublished: z
          .union([z.boolean(), z.string()])
          .optional()
          .transform((val) => val === true || val === 'true'),
      });

      const parsed = docSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid document metadata.' });
        return;
      }

      const uploaded = await uploadBufferToCloudinary(req.file.buffer, {
        folder: `gka-portfolio/documents/${parsed.data.category}`,
        resourceType: 'raw',
        originalName: req.file.originalname,
      });

      const created = await UploadedDocumentModel.create({
        title: parsed.data.title,
        category: parsed.data.category,
        description: parsed.data.description,
        fileUrl: uploaded.url,
        publicId: uploaded.publicId,
        fileName: req.file.originalname,
        fileSizeBytes: uploaded.bytes,
        mimeType: req.file.mimetype,
        isPublished: parsed.data.isPublished ?? true,
      });

      // If uploading a CV, automatically point SiteSettings Download CV to this latest file
      if (parsed.data.category === 'cv' && created.isPublished) {
        await SiteSettingsModel.findOneAndUpdate(
          { singletonKey: 'default' },
          {
            $set: {
              cvDocumentUrl: uploaded.url,
              cvFileName: req.file.originalname,
            },
          },
          { upsert: true }
        );
      }

      await logAdminActivity(
        req.admin!.email,
        'UPLOAD',
        'Document',
        String(created._id),
        `Uploaded ${parsed.data.category.toUpperCase()}: "${created.title}"`
      );
      res.status(201).json({ document: created });
    } catch (err) {
      if (err instanceof Error && err.message === 'CLOUDINARY_NOT_CONFIGURED') {
        res.status(503).json({
          error: 'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
        });
        return;
      }
      console.error('[Admin Documents] Upload error:', err);
      res.status(500).json({ error: 'Document upload failed.' });
    }
  }
);

adminRouter.patch('/documents/:id/set-cv', async (req: AuthenticatedAdminRequest, res) => {
  try {
    const doc = await UploadedDocumentModel.findById(req.params.id);
    if (!doc) {
      res.status(404).json({ error: 'Document not found.' });
      return;
    }

    await SiteSettingsModel.findOneAndUpdate(
      { singletonKey: 'default' },
      { $set: { cvDocumentUrl: doc.fileUrl, cvFileName: doc.fileName } },
      { upsert: true }
    );
    await logAdminActivity(req.admin!.email, 'UPDATE', 'CV', String(doc._id), `Set active CV to "${doc.title}"`);
    res.json({ success: true, cvDocumentUrl: doc.fileUrl, cvFileName: doc.fileName });
  } catch (err) {
    console.error('[Admin Documents] Set CV error:', err);
    res.status(500).json({ error: 'Failed to set active CV.' });
  }
});

adminRouter.delete('/documents/:id', async (req: AuthenticatedAdminRequest, res) => {
  try {
    const deleted = await UploadedDocumentModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Document not found.' });
      return;
    }
    if (deleted.publicId) {
      await deleteFromCloudinary(deleted.publicId, 'raw');
    }
    const settings = await SiteSettingsModel.findOne({ singletonKey: 'default' });
    if (settings && settings.cvDocumentUrl === deleted.fileUrl) {
      settings.cvDocumentUrl = '';
      settings.cvFileName = '';
      await settings.save();
    }
    await logAdminActivity(req.admin!.email, 'DELETE', 'Document', String(deleted._id), `Deleted document "${deleted.title}"`);
    res.json({ success: true });
  } catch (err) {
    console.error('[Admin Documents] Delete error:', err);
    res.status(500).json({ error: 'Failed to delete document.' });
  }
});

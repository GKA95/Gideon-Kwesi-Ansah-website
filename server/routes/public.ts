import { Router } from 'express';
import { z } from 'zod';
import { connectToDatabase, isDatabaseConnected } from '../db/connection.ts';
import { getSystemConfigStatus } from '../config/env.ts';
import { seedInitialPortfolioData } from '../db/seed.ts';
import {
  AboutContentModel,
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
import {
  type AuthenticatedAdminRequest,
  contactRateLimiter,
  resolveOptionalAdmin,
  sanitizePlainText,
} from '../middleware/auth.ts';

export const publicRouter = Router();

const contactSchema = z.object({
  fullName: z.string().trim().min(2, 'Please provide your full name.').max(120),
  email: z.string().trim().email('Please enter a valid email address.').max(180),
  organisation: z.string().trim().max(160).optional().default(''),
  serviceOfInterest: z.enum([
    'Website Development',
    'Data Analytics',
    'AI Automation',
    'Electrical Engineering',
    'Research Collaboration',
    'Other',
  ]),
  message: z.string().trim().min(10, 'Please include a short message (at least 10 characters).').max(4000),
});

async function ensureDbReady() {
  if (!isDatabaseConnected()) {
    await connectToDatabase();
  }
  if (!isDatabaseConnected()) {
    return false;
  }
  await seedInitialPortfolioData();
  return true;
}

publicRouter.get('/bootstrap', async (_req, res) => {
  try {
    const ready = await ensureDbReady();
    if (!ready) {
      res.status(503).json({
        error: 'DATABASE_NOT_CONFIGURED',
        message: 'MongoDB Atlas is not configured yet.',
        configStatus: getSystemConfigStatus(),
      });
      return;
    }

    const [
      settings,
      homepageDoc,
      aboutDoc,
      services,
      publishedProjects,
      researchDoc,
      skills,
      testimonials,
      documents,
    ] = await Promise.all([
      SiteSettingsModel.findOne({ singletonKey: 'default' }).lean(),
      HomepageContentModel.findOne({ singletonKey: 'default' }).lean(),
      AboutContentModel.findOne({ singletonKey: 'default' }).lean(),
      ServiceItemModel.find({ isPublished: true }).sort({ order: 1, createdAt: 1 }).lean(),
      ProjectModel.find({ status: 'published' }).sort({ order: 1, createdAt: -1 }).lean(),
      ResearchContentModel.findOne({ singletonKey: 'default' }).lean(),
      SkillModel.find({ isPublished: true }).sort({ order: 1 }).lean(),
      TestimonialModel.find({ isPublished: true }).sort({ order: 1, createdAt: -1 }).lean(),
      UploadedDocumentModel.find({ isPublished: true }).sort({ createdAt: -1 }).lean(),
    ]);

    const featuredProjects = publishedProjects.filter((p) => p.featured).slice(0, 6);

    res.json({
      settings: settings || null,
      homepage: homepageDoc && homepageDoc.isPublished ? homepageDoc.published : null,
      about: aboutDoc && aboutDoc.isPublished ? aboutDoc.published : null,
      services,
      projects: publishedProjects,
      featuredProjects,
      research: researchDoc && researchDoc.isPublished ? researchDoc.published : null,
      skills,
      testimonials,
      documents,
    });
  } catch (err) {
    console.error('[Public API] Bootstrap error:', err);
    res.status(500).json({ error: 'Unable to load portfolio content.' });
  }
});

publicRouter.get('/projects', async (req, res) => {
  try {
    const ready = await ensureDbReady();
    if (!ready) {
      res.status(503).json({ error: 'DATABASE_NOT_CONFIGURED' });
      return;
    }

    const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
    const filter: Record<string, unknown> = { status: 'published' };
    if (category && category !== 'All Projects') {
      filter.category = category;
    }

    const projects = await ProjectModel.find(filter).sort({ order: 1, createdAt: -1 }).lean();
    res.json({ projects });
  } catch (err) {
    console.error('[Public API] Projects error:', err);
    res.status(500).json({ error: 'Failed to load projects.' });
  }
});

publicRouter.get('/projects/:slug', async (req: AuthenticatedAdminRequest, res) => {
  try {
    const ready = await ensureDbReady();
    if (!ready) {
      res.status(503).json({ error: 'DATABASE_NOT_CONFIGURED' });
      return;
    }

    const slug = req.params.slug.trim();
    const allowDraftPreview = req.query.preview === '1' && (await resolveOptionalAdmin(req));

    const query: Record<string, unknown> = { slug };
    if (!allowDraftPreview) {
      query.status = 'published';
    }

    const project = await ProjectModel.findOne(query).lean();
    if (!project) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }

    const relatedProjects = await ProjectModel.find({
      status: 'published',
      _id: { $ne: project._id },
      category: project.category,
    })
      .sort({ order: 1, createdAt: -1 })
      .limit(3)
      .lean();

    res.json({ project, relatedProjects });
  } catch (err) {
    console.error('[Public API] Project detail error:', err);
    res.status(500).json({ error: 'Failed to load project details.' });
  }
});

publicRouter.post('/contact', contactRateLimiter, async (req, res) => {
  try {
    const ready = await ensureDbReady();
    if (!ready) {
      res.status(503).json({
        error: 'Contact service is currently unavailable because the database is not configured.',
      });
      return;
    }

    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message || 'Invalid contact form input.';
      res.status(400).json({ error: firstIssue });
      return;
    }

    const clean = {
      fullName: sanitizePlainText(parsed.data.fullName, 120),
      email: sanitizePlainText(parsed.data.email, 180).toLowerCase(),
      organisation: sanitizePlainText(parsed.data.organisation || '', 160),
      serviceOfInterest: parsed.data.serviceOfInterest,
      message: sanitizePlainText(parsed.data.message, 4000),
      status: 'unread' as const,
    };

    const created = await ContactMessageModel.create(clean);
    res.status(201).json({
      success: true,
      messageId: String(created._id),
      message: 'Thank you. Your message has been received and stored securely.',
    });
  } catch (err) {
    console.error('[Public API] Contact submission error:', err);
    res.status(500).json({ error: 'Unable to submit your message right now. Please try again.' });
  }
});

import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const AdminUserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true, default: 'Gideon Kwesi Ansah' },
    passwordHash: { type: String, default: '' },
    googleSub: { type: String, default: '' },
    role: { type: String, default: 'admin' },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const AdminSessionSchema = new Schema(
  {
    tokenHash: { type: String, required: true, unique: true, index: true },
    csrfToken: { type: String, required: true },
    adminId: { type: Schema.Types.ObjectId, ref: 'AdminUser', required: true },
    userAgent: { type: String, default: '' },
    ipAddress: { type: String, default: '' },
    lastActiveAt: { type: Date, default: () => new Date(), index: true },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

const AdminActivitySchema = new Schema(
  {
    adminEmail: { type: String, required: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String, default: '' },
    summary: { type: String, required: true },
  },
  { timestamps: true }
);

const SiteSettingsSchema = new Schema(
  {
    singletonKey: { type: String, default: 'default', unique: true },
    siteName: { type: String, required: true, default: 'Gideon Kwesi Ansah' },
    profileName: { type: String, required: true, default: 'Gideon Kwesi Ansah' },
    logoUrl: { type: String, default: '' },
    profilePhotoUrl: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    whatsappNumber: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    githubUrl: { type: String, default: 'https://github.com/GKA95' },
    cvDocumentUrl: { type: String, default: '' },
    cvFileName: { type: String, default: '' },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    socialImageUrl: { type: String, default: '' },
    footerText: { type: String, default: '' },
  },
  { timestamps: true }
);

const HomepageContentPayloadSchema = new Schema(
  {
    heroName: { type: String, default: 'Gideon Kwesi Ansah' },
    heroHeadline: { type: String, default: '' },
    heroSubheadline: { type: String, default: '' },
    primaryCtaText: { type: String, default: 'Explore My Work' },
    secondaryCtaText: { type: String, default: "Let's Work Together" },
    shortIntroTitle: { type: String, default: '' },
    shortIntroBody: { type: String, default: '' },
    expertiseSectionTitle: { type: String, default: 'Core Areas of Practice' },
    featuredSectionTitle: { type: String, default: 'Selected Projects' },
    featuredSectionSubtitle: { type: String, default: '' },
    ctaTitle: { type: String, default: '' },
    ctaBody: { type: String, default: '' },
    ctaButtonText: { type: String, default: 'Start a Conversation' },
  },
  { _id: false }
);

const HomepageContentSchema = new Schema(
  {
    singletonKey: { type: String, default: 'default', unique: true },
    isPublished: { type: Boolean, default: true },
    published: { type: HomepageContentPayloadSchema, default: () => ({}) },
    draft: { type: HomepageContentPayloadSchema, default: () => ({}) },
  },
  { timestamps: true }
);

const AboutContentPayloadSchema = new Schema(
  {
    fullName: { type: String, default: 'Gideon Kwesi Ansah' },
    degree: { type: String, default: 'BSc Electrical and Electronic Engineering' },
    university: { type: String, default: 'Kwame Nkrumah University of Science and Technology (KNUST)' },
    graduationYear: { type: String, default: '2024' },
    honors: { type: String, default: 'Second-Class Upper Division' },
    professionalBackground: { type: String, default: '' },
    educationDetails: { type: String, default: '' },
    technicalInterests: { type: String, default: '' },
    professionalApproach: { type: String, default: '' },
    careerAndResearchInterests: { type: String, default: '' },
  },
  { _id: false }
);

const AboutContentSchema = new Schema(
  {
    singletonKey: { type: String, default: 'default', unique: true },
    isPublished: { type: Boolean, default: true },
    published: { type: AboutContentPayloadSchema, default: () => ({}) },
    draft: { type: AboutContentPayloadSchema, default: () => ({}) },
  },
  { timestamps: true }
);

const ServiceItemSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    shortSummary: { type: String, default: '' },
    description: { type: String, required: true },
    capabilities: [{ type: String }],
    category: {
      type: String,
      enum: ['Website Development', 'Data Analytics', 'AI Automation', 'Electrical Engineering'],
      required: true,
    },
    visualUrl: { type: String, default: '' },
    relatedProjectSlugs: [{ type: String }],
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    isAiAutomation: { type: Boolean, default: false },
    aiProblemSolved: { type: String, default: '' },
    aiDemoUrl: { type: String, default: '' },
    aiCaseStudy: { type: String, default: '' },
    aiResults: { type: String, default: '' },
  },
  { timestamps: true }
);

const ProjectSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    category: {
      type: String,
      enum: ['Website Development', 'Data Analytics', 'AI Automation', 'Electrical Engineering'],
      required: true,
    },
    shortDescription: { type: String, required: true },
    overview: { type: String, default: '' },
    problemStatement: { type: String, default: '' },
    objectives: [{ type: String }],
    contribution: { type: String, default: '' },
    technologies: [{ type: String }],
    developmentProcess: { type: String, default: '' },
    resultsAndFindings: { type: String, default: '' },
    coverImageUrl: { type: String, default: '' },
    galleryImages: [{ type: String }],
    githubUrl: { type: String, default: '' },
    liveDemoUrl: { type: String, default: '' },
    demoVideoUrl: { type: String, default: '' },
    businessProblemSolved: { type: String, default: '' },
    caseStudyDetails: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
  },
  { timestamps: true }
);

const ResearchInterestItemSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const ResearchContentPayloadSchema = new Schema(
  {
    academicBackground: { type: String, default: '' },
    engineeringResearchSummary: { type: String, default: '' },
    dataScienceSummary: { type: String, default: '' },
    renewableEnergySummary: { type: String, default: '' },
    researchInterests: [ResearchInterestItemSchema],
    futurePublicationsNote: { type: String, default: '' },
  },
  { _id: false }
);

const ResearchContentSchema = new Schema(
  {
    singletonKey: { type: String, default: 'default', unique: true },
    isPublished: { type: Boolean, default: true },
    published: { type: ResearchContentPayloadSchema, default: () => ({}) },
    draft: { type: ResearchContentPayloadSchema, default: () => ({}) },
  },
  { timestamps: true }
);

const SkillSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Website Development', 'Data Analytics & ML', 'AI Automation', 'Electrical Engineering'],
      required: true,
    },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const TestimonialSchema = new Schema(
  {
    personName: { type: String, required: true, trim: true },
    positionOrOrg: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    photoUrl: { type: String, default: '' },
    isPublished: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const ContactMessageSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    organisation: { type: String, default: '', trim: true },
    serviceOfInterest: {
      type: String,
      enum: [
        'Website Development',
        'Data Analytics',
        'AI Automation',
        'Electrical Engineering',
        'Research Collaboration',
        'Other',
      ],
      required: true,
    },
    message: { type: String, required: true },
    status: { type: String, enum: ['unread', 'read', 'archived'], default: 'unread', index: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const UploadedDocumentSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['cv', 'research_report', 'technical_paper', 'other'],
      required: true,
    },
    description: { type: String, default: '' },
    fileUrl: { type: String, required: true },
    publicId: { type: String, default: '' },
    fileName: { type: String, required: true },
    fileSizeBytes: { type: Number, default: 0 },
    mimeType: { type: String, default: 'application/pdf' },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type AdminUserDoc = InferSchemaType<typeof AdminUserSchema>;
export type SiteSettingsDoc = InferSchemaType<typeof SiteSettingsSchema>;
export type ProjectDoc = InferSchemaType<typeof ProjectSchema>;

export const AdminUserModel = mongoose.models.AdminUser || mongoose.model('AdminUser', AdminUserSchema);
export const AdminSessionModel =
  mongoose.models.AdminSession || mongoose.model('AdminSession', AdminSessionSchema);
export const AdminActivityModel =
  mongoose.models.AdminActivity || mongoose.model('AdminActivity', AdminActivitySchema);
export const SiteSettingsModel =
  mongoose.models.SiteSettings || mongoose.model('SiteSettings', SiteSettingsSchema);
export const HomepageContentModel =
  mongoose.models.HomepageContent || mongoose.model('HomepageContent', HomepageContentSchema);
export const AboutContentModel =
  mongoose.models.AboutContent || mongoose.model('AboutContent', AboutContentSchema);
export const ServiceItemModel =
  mongoose.models.ServiceItem || mongoose.model('ServiceItem', ServiceItemSchema);
export const ProjectModel = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
export const ResearchContentModel =
  mongoose.models.ResearchContent || mongoose.model('ResearchContent', ResearchContentSchema);
export const SkillModel = mongoose.models.Skill || mongoose.model('Skill', SkillSchema);
export const TestimonialModel =
  mongoose.models.Testimonial || mongoose.model('Testimonial', TestimonialSchema);
export const ContactMessageModel =
  mongoose.models.ContactMessage || mongoose.model('ContactMessage', ContactMessageSchema);
export const UploadedDocumentModel =
  mongoose.models.UploadedDocument || mongoose.model('UploadedDocument', UploadedDocumentSchema);

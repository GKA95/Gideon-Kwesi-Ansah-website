export type ProjectCategory =
  | 'Website Development'
  | 'Data Analytics'
  | 'AI Automation'
  | 'Electrical Engineering';

export type ProjectStatus = 'draft' | 'published' | 'archived';

export interface SiteSettings {
  _id?: string;
  siteName: string;
  profileName: string;
  logoUrl: string;
  profilePhotoUrl: string;
  contactEmail: string;
  whatsappNumber: string;
  linkedinUrl: string;
  githubUrl: string;
  cvDocumentUrl: string;
  cvFileName: string;
  seoTitle: string;
  seoDescription: string;
  socialImageUrl: string;
  footerText: string;
}

export interface HomepageContent {
  heroName: string;
  heroHeadline: string;
  heroSubheadline: string;
  primaryCtaText: string;
  secondaryCtaText: string;
  shortIntroTitle: string;
  shortIntroBody: string;
  expertiseSectionTitle: string;
  featuredSectionTitle: string;
  featuredSectionSubtitle: string;
  ctaTitle: string;
  ctaBody: string;
  ctaButtonText: string;
}

export interface AboutContent {
  fullName: string;
  degree: string;
  university: string;
  graduationYear: string;
  honors: string;
  professionalBackground: string;
  educationDetails: string;
  technicalInterests: string;
  professionalApproach: string;
  careerAndResearchInterests: string;
}

export interface ServiceItem {
  _id: string;
  slug: string;
  title: string;
  shortSummary: string;
  description: string;
  capabilities: string[];
  category: ProjectCategory;
  visualUrl: string;
  relatedProjectSlugs: string[];
  order: number;
  isPublished: boolean;
  isAiAutomation: boolean;
  aiProblemSolved?: string;
  aiDemoUrl?: string;
  aiCaseStudy?: string;
  aiResults?: string;
}

export interface ProjectItem {
  _id: string;
  title: string;
  slug: string;
  category: ProjectCategory;
  shortDescription: string;
  overview: string;
  problemStatement: string;
  objectives: string[];
  contribution: string;
  technologies: string[];
  developmentProcess: string;
  resultsAndFindings: string;
  coverImageUrl: string;
  galleryImages: string[];
  githubUrl: string;
  liveDemoUrl: string;
  demoVideoUrl?: string;
  businessProblemSolved?: string;
  caseStudyDetails?: string;
  featured: boolean;
  order: number;
  status: ProjectStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResearchInterestItem {
  _id?: string;
  title: string;
  description: string;
  order: number;
}

export interface ResearchContent {
  academicBackground: string;
  engineeringResearchSummary: string;
  dataScienceSummary: string;
  renewableEnergySummary: string;
  researchInterests: ResearchInterestItem[];
  futurePublicationsNote: string;
}

export interface SkillItem {
  _id: string;
  name: string;
  category:
    | 'Website Development'
    | 'Data Analytics & ML'
    | 'AI Automation'
    | 'Electrical Engineering';
  order: number;
  isPublished: boolean;
}

export interface TestimonialItem {
  _id: string;
  personName: string;
  positionOrOrg: string;
  content: string;
  photoUrl: string;
  isPublished: boolean;
  order: number;
}

export interface UploadedDocumentItem {
  _id: string;
  title: string;
  category: 'cv' | 'research_report' | 'technical_paper' | 'other';
  description: string;
  fileUrl: string;
  publicId: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  isPublished: boolean;
  createdAt: string;
}

export interface ContactMessageItem {
  _id: string;
  fullName: string;
  email: string;
  organisation: string;
  serviceOfInterest: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  createdAt: string;
  readAt?: string | null;
}

export interface SystemConfigStatus {
  mongodbConfigured: boolean;
  mongodbDbName: string;
  sessionSecretConfigured: boolean;
  adminSetupTokenConfigured: boolean;
  googleOAuthConfigured: boolean;
  cloudinaryConfigured: boolean;
  missingVars: string[];
}

export interface PortfolioBootstrapData {
  settings: SiteSettings | null;
  homepage: HomepageContent | null;
  about: AboutContent | null;
  services: ServiceItem[];
  projects: ProjectItem[];
  featuredProjects: ProjectItem[];
  research: ResearchContent | null;
  skills: SkillItem[];
  testimonials: TestimonialItem[];
  documents: UploadedDocumentItem[];
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AdminActivityItem {
  _id: string;
  adminEmail: string;
  action: string;
  entityType: string;
  summary: string;
  createdAt: string;
}

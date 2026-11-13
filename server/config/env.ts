import dotenv from 'dotenv';

dotenv.config();

export interface SystemConfigStatus {
  mongodbConfigured: boolean;
  mongodbDbName: string;
  sessionSecretConfigured: boolean;
  adminSetupTokenConfigured: boolean;
  googleOAuthConfigured: boolean;
  cloudinaryConfigured: boolean;
  missingVars: string[];
}

export function getEnvConfig() {
  return {
    port: Number(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    appUrl: process.env.APP_URL || 'http://localhost:3000',
    mongodbUri: process.env.MONGODB_URI?.trim() || '',
    mongodbDbName: process.env.MONGODB_DB_NAME?.trim() || 'gka_portfolio',
    sessionSecret: process.env.SESSION_SECRET?.trim() || '',
    adminSetupToken: process.env.ADMIN_SETUP_TOKEN?.trim() || '',
    googleClientId: process.env.GOOGLE_CLIENT_ID?.trim() || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET?.trim() || '',
    adminAllowedEmail: process.env.ADMIN_ALLOWED_EMAIL?.trim().toLowerCase() || '',
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME?.trim() || '',
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY?.trim() || '',
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET?.trim() || '',
  };
}

export function getSystemConfigStatus(): SystemConfigStatus {
  const cfg = getEnvConfig();
  const missingVars: string[] = [];

  if (!cfg.mongodbUri) missingVars.push('MONGODB_URI');
  if (!cfg.sessionSecret) missingVars.push('SESSION_SECRET');
  if (!cfg.adminSetupToken) missingVars.push('ADMIN_SETUP_TOKEN');
  if (!cfg.googleClientId) missingVars.push('GOOGLE_CLIENT_ID');
  if (!cfg.googleClientSecret) missingVars.push('GOOGLE_CLIENT_SECRET');
  if (!cfg.cloudinaryCloudName) missingVars.push('CLOUDINARY_CLOUD_NAME');
  if (!cfg.cloudinaryApiKey) missingVars.push('CLOUDINARY_API_KEY');
  if (!cfg.cloudinaryApiSecret) missingVars.push('CLOUDINARY_API_SECRET');

  return {
    mongodbConfigured: Boolean(cfg.mongodbUri),
    mongodbDbName: cfg.mongodbDbName,
    sessionSecretConfigured: Boolean(cfg.sessionSecret && cfg.sessionSecret.length >= 16),
    adminSetupTokenConfigured: Boolean(cfg.adminSetupToken && cfg.adminSetupToken.length >= 12),
    googleOAuthConfigured: Boolean(cfg.googleClientId && cfg.googleClientSecret),
    cloudinaryConfigured: Boolean(
      cfg.cloudinaryCloudName && cfg.cloudinaryApiKey && cfg.cloudinaryApiSecret
    ),
    missingVars,
  };
}

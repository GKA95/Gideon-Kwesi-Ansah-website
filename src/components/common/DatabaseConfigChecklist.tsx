import { CheckCircle2, AlertCircle, Database, Cloud, KeyRound } from 'lucide-react';
import type { SystemConfigStatus } from '../../types/portfolio';

interface DatabaseConfigChecklistProps {
  status: SystemConfigStatus | null;
  dbConnected?: boolean;
  dbError?: string | null;
  compact?: boolean;
}

export function DatabaseConfigChecklist({
  status,
  dbConnected = false,
  dbError,
  compact = false,
}: DatabaseConfigChecklistProps) {
  const items = [
    {
      key: 'MONGODB_URI',
      label: 'MongoDB Atlas Connection',
      detail: 'Required for storing and serving all portfolio content, projects, and contact messages.',
      ready: dbConnected,
      configured: Boolean(status?.mongodbConfigured),
      icon: Database,
    },
    {
      key: 'SESSION_SECRET',
      label: 'Session Signing Secret',
      detail: 'Required (16+ characters) for secure server-managed administrator sessions.',
      ready: Boolean(status?.sessionSecretConfigured),
      configured: Boolean(status?.sessionSecretConfigured),
      icon: KeyRound,
    },
    {
      key: 'ADMIN_SETUP_TOKEN',
      label: 'One-Time Admin Setup Token',
      detail: 'Required (12+ characters) to authorize creating the single administrator account.',
      ready: Boolean(status?.adminSetupTokenConfigured),
      configured: Boolean(status?.adminSetupTokenConfigured),
      icon: KeyRound,
    },
    {
      key: 'GOOGLE_CLIENT_ID / SECRET',
      label: 'Google Sign-In OAuth 2.0',
      detail:
        'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (plus optional ADMIN_ALLOWED_EMAIL) for Google-only admin login.',
      ready: Boolean(status?.googleOAuthConfigured),
      configured: Boolean(status?.googleOAuthConfigured),
      icon: KeyRound,
    },
    {
      key: 'CLOUDINARY_*',
      label: 'Cloudinary Media & PDF Storage',
      detail:
        'CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET for uploading images, CVs, and research PDFs.',
      ready: Boolean(status?.cloudinaryConfigured),
      configured: Boolean(status?.cloudinaryConfigured),
      icon: Cloud,
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1B2E] p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            External Service Configuration Checklist
          </h3>
          {!compact && (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Configure the following environment variables in your server secrets panel to activate
              live database persistence and media uploads.
            </p>
          )}
        </div>
      </div>

      {dbError && !dbConnected && (
        <div className="mb-5 rounded-lg border border-amber-300/70 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
          {dbError}
        </div>
      )}

      <div className="divide-y divide-slate-200 dark:divide-slate-800">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.key} className="py-3.5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <Icon className="w-4 h-4 mt-1 text-slate-500 dark:text-slate-400 shrink-0" />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {item.label}
                    </span>
                    <code className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      {item.key}
                    </code>
                  </div>
                  {!compact && (
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                      {item.detail}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 text-xs font-medium">
                {item.ready ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    Connected
                  </span>
                ) : item.configured ? (
                  <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
                    <AlertCircle className="w-4 h-4" />
                    Verify Connection
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400">
                    <AlertCircle className="w-4 h-4" />
                    Missing Env Var
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

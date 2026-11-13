import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { apiFetch, setCsrfToken } from '../../services/api';
import type { AdminUser, SystemConfigStatus } from '../../types/portfolio';
import { SeoHead } from '../../components/common/SeoHead';
import { DatabaseConfigChecklist } from '../../components/common/DatabaseConfigChecklist';

interface AdminStatusResponse {
  dbConnected: boolean;
  dbError: string | null;
  adminExists: boolean;
  configStatus: SystemConfigStatus;
}

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<AdminStatusResponse | null>(null);
  const [checking, setChecking] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        try {
          const me = await apiFetch<{ admin: AdminUser; csrfToken: string }>('/api/admin/me');
          if (me.admin) {
            setCsrfToken(me.csrfToken);
            navigate('/admin/dashboard', { replace: true });
            return;
          }
        } catch {
          // Not authenticated yet
        }

        const st = await apiFetch<AdminStatusResponse>('/api/admin/status');
        setStatus(st);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to reach server.');
      } finally {
        setChecking(false);
      }
    }
    void init();
  }, [navigate]);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return;
      }

      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        try {
          const me = await apiFetch<{ admin: AdminUser; csrfToken: string }>('/api/admin/me');
          setCsrfToken(me.csrfToken);
          navigate('/admin/dashboard', { replace: true });
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Session could not be verified.');
          setSigningIn(false);
        }
      } else if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
        setError(typeof event.data.error === 'string' ? event.data.error : 'Google sign-in failed.');
        setSigningIn(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  async function handleGoogleSignIn() {
    setError(null);
    setSigningIn(true);
    try {
      const { url } = await apiFetch<{ url: string }>(
        `/api/admin/auth/google/url?origin=${encodeURIComponent(window.location.origin)}`
      );
      const popup = window.open(url, 'google_admin_oauth', 'width=520,height=640');
      if (!popup) {
        setError('Popup was blocked by your browser. Please allow popups for this site and try again.');
        setSigningIn(false);
        return;
      }
      const timer = window.setInterval(() => {
        if (popup.closed) {
          window.clearInterval(timer);
          setSigningIn(false);
        }
      }, 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start Google sign-in.');
      setSigningIn(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 flex items-center justify-center px-4 py-12">
      <SeoHead
        title="Private Admin Sign In"
        description="Restricted portfolio administration portal."
        noindex
      />

      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#0A192F] text-white dark:bg-sky-500 dark:text-slate-950">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-display font-bold">Portfolio Administration</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Sign in with your authorised Google account.
          </p>
        </div>

        {checking ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1B2E] p-8 text-center text-sm text-slate-500">
            Checking session...
          </div>
        ) : status && (!status.dbConnected || !status.configStatus.googleOAuthConfigured) ? (
          <DatabaseConfigChecklist
            status={status.configStatus}
            dbConnected={status.dbConnected}
            dbError={status.dbError}
          />
        ) : status && !status.adminExists ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1B2E] p-7 text-center space-y-4">
            <h2 className="text-lg font-display font-semibold">Initial Setup Required</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No authorised Google email is configured yet. Complete one-time setup with your
              server setup token (or configure <code className="font-mono text-xs">ADMIN_ALLOWED_EMAIL</code>).
            </p>
            <Link
              to="/admin/setup"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-[#0A192F] text-white dark:bg-sky-500 dark:text-slate-950 text-sm font-semibold"
            >
              Proceed to One-Time Setup
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1B2E] p-7 sm:p-8 space-y-5">
            {error ? (
              <div
                role="alert"
                className="rounded-lg border border-rose-300 dark:border-rose-700/60 bg-rose-50 dark:bg-rose-950/40 px-4 py-3 text-sm text-rose-800 dark:text-rose-200"
              >
                {error}
              </div>
            ) : null}

            <p className="text-sm text-slate-600 dark:text-slate-300 text-center">
              Access is restricted strictly to the authorised administrator Google account.
            </p>

            <button
              type="button"
              disabled={signingIn}
              onClick={() => void handleGoogleSignIn()}
              className="w-full inline-flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900 text-sm font-semibold transition-colors disabled:opacity-60"
            >
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="w-5 h-5 shrink-0"
                aria-hidden="true"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              <span>{signingIn ? 'Waiting for Google Sign-In...' : 'Sign in with Google'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

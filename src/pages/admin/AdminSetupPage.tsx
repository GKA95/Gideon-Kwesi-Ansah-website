import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock } from 'lucide-react';
import { apiFetch } from '../../services/api';
import type { SystemConfigStatus } from '../../types/portfolio';
import { SeoHead } from '../../components/common/SeoHead';
import { DatabaseConfigChecklist } from '../../components/common/DatabaseConfigChecklist';

interface AdminStatusResponse {
  dbConnected: boolean;
  dbError: string | null;
  adminExists: boolean;
  configStatus: SystemConfigStatus;
}

export function AdminSetupPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<AdminStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [setupToken, setSetupToken] = useState('');
  const [name, setName] = useState('Gideon Kwesi Ansah');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await apiFetch<AdminStatusResponse>('/api/admin/status');
        setStatus(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to reach server.');
      } finally {
        setLoading(false);
      }
    }
    void loadStatus();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch('/api/admin/setup', {
        method: 'POST',
        body: JSON.stringify({ setupToken, name, email }),
      });
      navigate('/admin/login', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060D1A] text-slate-900 dark:text-slate-100 flex items-center justify-center px-4 py-12">
      <SeoHead
        title="Initial Administrator Setup"
        description="One-time administrator Google email authorization."
        noindex
      />

      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#0A192F] text-white dark:bg-sky-500 dark:text-slate-950">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-display font-bold">One-Time Administrator Setup</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Authorise the single Google email permitted to sign in to your admin dashboard using{' '}
            <code className="font-mono text-xs">ADMIN_SETUP_TOKEN</code>.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1B2E] p-8 text-center text-sm text-slate-500">
            Verifying system status...
          </div>
        ) : status && status.adminExists ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1B2E] p-8 text-center space-y-4">
            <Lock className="w-8 h-8 mx-auto text-slate-400" />
            <h2 className="text-lg font-display font-semibold">Administrator Setup Closed</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              An authorised administrator Google account has already been configured.
            </p>
            <Link
              to="/admin/login"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-[#0A192F] text-white dark:bg-sky-500 dark:text-slate-950 text-sm font-semibold"
            >
              Go to Google Sign-In
            </Link>
          </div>
        ) : status && (!status.dbConnected || !status.configStatus.adminSetupTokenConfigured) ? (
          <DatabaseConfigChecklist
            status={status.configStatus}
            dbConnected={status.dbConnected}
            dbError={status.dbError}
          />
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1B2E] p-7 sm:p-8 space-y-5"
          >
            {error ? (
              <div
                role="alert"
                className="rounded-lg border border-rose-300 dark:border-rose-700/60 bg-rose-50 dark:bg-rose-950/40 px-4 py-3 text-sm text-rose-800 dark:text-rose-200"
              >
                {error}
              </div>
            ) : null}

            <div>
              <label
                htmlFor="setup-token"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Server Setup Token (ADMIN_SETUP_TOKEN)
              </label>
              <input
                id="setup-token"
                type="password"
                required
                value={setupToken}
                onChange={(e) => setSetupToken(e.target.value)}
                placeholder="Enter secret setup token"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label
                htmlFor="setup-name"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Administrator Name
              </label>
              <input
                id="setup-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label
                htmlFor="setup-email"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Authorised Google Email Address
              </label>
              <input
                id="setup-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="gideonkwesiansah@gmail.com"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060D1A] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-[#0A192F] text-white dark:bg-sky-500 dark:text-slate-950 text-sm font-semibold hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? 'Authorising Email...' : 'Authorise Google Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

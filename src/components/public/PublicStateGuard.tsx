import type { ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { DatabaseConfigChecklist } from '../common/DatabaseConfigChecklist';

export function PublicStateGuard({ children }: { children: ReactNode }) {
  const { loading, error, dbUnconfigured, configStatus, refresh } = usePortfolio();

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-10" aria-busy="true">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-12 w-4/5 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-20 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          </div>
          <div className="lg:col-span-5">
            <div className="aspect-[4/5] w-full bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (dbUnconfigured) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-wide text-sky-700 dark:text-sky-400">
            System Setup Required
          </p>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
            Gideon Kwesi Ansah
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400">
            This portfolio serves all content dynamically from MongoDB Atlas. Connect your database
            and environment secrets to load and manage live portfolio content.
          </p>
        </div>

        <DatabaseConfigChecklist status={configStatus} dbConnected={false} />

        <div>
          <button
            type="button"
            onClick={() => void refresh()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0A192F] text-white dark:bg-sky-500 dark:text-slate-950 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center space-y-4">
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
          Unable to Load Content
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">{error}</p>
        <button
          type="button"
          onClick={() => void refresh()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0A192F] text-white dark:bg-sky-500 dark:text-slate-950 text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

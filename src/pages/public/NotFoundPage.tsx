import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SeoHead } from '../../components/common/SeoHead';

export function NotFoundPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24 text-center space-y-5">
      <SeoHead
        title="Page Not Found — Gideon Kwesi Ansah"
        description="The requested page could not be found."
        noindex
      />
      <p className="text-xs font-mono tabular-nums text-sky-700 dark:text-sky-400">404</p>
      <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
        Page Not Found
      </h1>
      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="pt-2 flex justify-center gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0A192F] text-white dark:bg-sky-500 dark:text-slate-950 text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
        <Link
          to="/projects"
          className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white"
        >
          View Projects
        </Link>
      </div>
    </div>
  );
}

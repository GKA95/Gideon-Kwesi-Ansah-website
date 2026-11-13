import { useEffect, useState } from 'react';
import { Monitor, Smartphone, X } from 'lucide-react';
import { apiFetch } from '../../../services/api';
import type { PortfolioBootstrapData } from '../../../types/portfolio';
import { PortfolioProvider } from '../../../context/PortfolioContext';
import { PublicLayout } from '../../public/PublicLayout';
import { HomePage } from '../../../pages/public/HomePage';
import { AboutPage } from '../../../pages/public/AboutPage';
import { ServicesPage } from '../../../pages/public/ServicesPage';
import { ProjectsPage } from '../../../pages/public/ProjectsPage';
import { ResearchPage } from '../../../pages/public/ResearchPage';

type PreviewPageKey = 'home' | 'about' | 'services' | 'projects' | 'research';

export function AdminPreviewModal({ onClose }: { onClose: () => void }) {
  const [previewData, setPreviewData] = useState<PortfolioBootstrapData | null>(null);
  const [page, setPage] = useState<PreviewPageKey>('home');
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await apiFetch<PortfolioBootstrapData>('/api/admin/preview');
        setPreviewData(res);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Draft website preview"
      className="fixed inset-0 z-50 bg-slate-950/80 flex flex-col"
    >
      <div className="bg-[#0A192F] text-white px-4 sm:px-6 h-14 flex items-center justify-between gap-4 border-b border-slate-800">
        <div className="flex items-center gap-3 overflow-x-auto">
          <span className="text-xs font-semibold text-sky-400 whitespace-nowrap">
            Draft Preview
          </span>
          <div className="flex items-center gap-1">
            {(
              [
                { id: 'home', label: 'Home' },
                { id: 'about', label: 'About' },
                { id: 'services', label: 'Services' },
                { id: 'projects', label: 'Projects' },
                { id: 'research', label: 'Research' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPage(tab.id)}
                className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap ${
                  page === tab.id ? 'bg-sky-500 text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setViewport('desktop')}
            aria-label="Desktop preview width"
            className={`p-1.5 rounded ${
              viewport === 'desktop' ? 'bg-white/15 text-white' : 'text-slate-400'
            }`}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewport('mobile')}
            aria-label="Mobile preview width"
            className={`p-1.5 rounded ${
              viewport === 'mobile' ? 'bg-white/15 text-white' : 'text-slate-400'
            }`}
          >
            <Smartphone className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-xs font-medium"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-200 dark:bg-slate-950 p-4 sm:p-6 flex justify-center">
        <div
          className={`bg-white dark:bg-[#060D1A] rounded-xl shadow-2xl overflow-y-auto border border-slate-300 dark:border-slate-800 transition-all ${
            viewport === 'mobile' ? 'w-[390px]' : 'w-full max-w-6xl'
          }`}
        >
          {loading || !previewData ? (
            <div className="p-16 text-center text-sm text-slate-500">
              Loading draft preview...
            </div>
          ) : (
            <PortfolioProvider overrideData={previewData}>
              <PublicLayout isPreview>
                {page === 'home' && <HomePage isPreview />}
                {page === 'about' && <AboutPage isPreview />}
                {page === 'services' && <ServicesPage isPreview />}
                {page === 'projects' && <ProjectsPage isPreview />}
                {page === 'research' && <ResearchPage isPreview />}
              </PublicLayout>
            </PortfolioProvider>
          )}
        </div>
      </div>
    </div>
  );
}

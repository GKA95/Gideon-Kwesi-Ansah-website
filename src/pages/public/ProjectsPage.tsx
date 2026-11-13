import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { SeoHead } from '../../components/common/SeoHead';
import { PublicStateGuard } from '../../components/public/PublicStateGuard';
import { ProjectCard } from '../../components/public/ProjectCard';

const CATEGORIES = [
  'All Projects',
  'Website Development',
  'Data Analytics',
  'AI Automation',
  'Electrical Engineering',
] as const;

export function ProjectsPage({ isPreview = false }: { isPreview?: boolean }) {
  const { data } = usePortfolio();
  const [selectedCategory, setSelectedCategory] = useState<string>('All Projects');
  const projects = data?.projects || [];
  const settings = data?.settings;

  const filtered = useMemo(() => {
    if (selectedCategory === 'All Projects') return projects;
    return projects.filter((p) => p.category === selectedCategory);
  }, [projects, selectedCategory]);

  return (
    <PublicStateGuard>
      <SeoHead
        title={`Projects — ${settings?.profileName || 'Gideon Kwesi Ansah'}`}
        description="Explore published projects across Website Development, Data Analytics, AI Automation, and Electrical Engineering."
        imageUrl={settings?.socialImageUrl}
        noindex={isPreview}
      />

      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#081121]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-20">
          <p className="text-sm font-medium text-sky-700 dark:text-sky-400">Project Portfolio</p>
          <h1 className="mt-2 text-2xl sm:text-4xl font-display font-bold tracking-tight text-slate-900 dark:text-white">
            Selected Work &amp; Technical Case Studies
          </h1>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            Browse work across web engineering, predictive data analytics, AI automation, and
            electrical power systems.
          </p>

          {/* Interactive Filter Controls */}
          <div
            role="tablist"
            aria-label="Filter projects by category"
            className="mt-6 sm:mt-8 flex sm:inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#0D1B2E] border border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar max-w-full"
          >
            {CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedCategory(category)}
                  className={`min-h-[40px] px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-white dark:bg-[#0A192F] text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((project) => (
              <ProjectCard key={project._id} project={project} isPreview={isPreview} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1B2E] p-12 text-center">
            <FolderOpen className="w-8 h-8 mx-auto text-slate-400" strokeWidth={1.5} />
            <h2 className="mt-4 text-lg font-display font-semibold text-slate-900 dark:text-white">
              No published projects in {selectedCategory} yet
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Only verified, completed projects are published here. Check back soon or explore
              capabilities and research areas in the meantime.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              {selectedCategory !== 'All Projects' && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('All Projects')}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-200"
                >
                  Show All Categories
                </button>
              )}
              <Link
                to="/services"
                className="px-4 py-2 rounded-lg bg-[#0A192F] text-white dark:bg-sky-500 dark:text-slate-950 text-sm font-medium"
              >
                View Services
              </Link>
            </div>
          </div>
        )}
      </section>
    </PublicStateGuard>
  );
}

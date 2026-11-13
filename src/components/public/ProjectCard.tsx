import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { ProjectItem } from '../../types/portfolio';
import { ImageWithFallback } from '../common/ImageWithFallback';

export function ProjectCard({
  project,
  isPreview = false,
}: {
  project: ProjectItem;
  isPreview?: boolean;
}) {
  const detailPath = isPreview
    ? `/projects/${encodeURIComponent(project.slug)}?preview=1`
    : `/projects/${encodeURIComponent(project.slug)}`;

  return (
    <article className="group flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1B2E] overflow-hidden transition-transform duration-200 hover:-translate-y-0.5">
      <div className="aspect-[16/10] w-full overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <ImageWithFallback
          src={project.coverImageUrl}
          alt={project.title}
          fallbackLabel={project.category}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between gap-5">
        <div>
          <p className="text-xs font-medium text-sky-700 dark:text-sky-400">
            {project.category}
            {project.status === 'draft' && isPreview ? ' · Draft' : ''}
          </p>

          <h3 className="mt-2 text-lg font-display font-semibold text-slate-900 dark:text-white leading-snug">
            <Link to={detailPath} className="hover:text-sky-700 dark:hover:text-sky-400 transition-colors">
              {project.title}
            </Link>
          </h3>

          <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
            {project.shortDescription}
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
          {project.technologies && project.technologies.length > 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {project.technologies.join(' · ')}
            </p>
          )}

          <Link
            to={detailPath}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-900 dark:text-white hover:text-sky-700 dark:hover:text-sky-400 transition-colors"
          >
            <span>View Project</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Github, X } from 'lucide-react';
import { apiFetch } from '../../services/api';
import type { ProjectItem } from '../../types/portfolio';
import { SeoHead } from '../../components/common/SeoHead';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';
import { ProjectCard } from '../../components/public/ProjectCard';
import { usePortfolio } from '../../context/PortfolioContext';

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === '1';
  const { data } = usePortfolio();

  const [project, setProject] = useState<ProjectItem | null>(null);
  const [related, setRelated] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch<{ project: ProjectItem; relatedProjects: ProjectItem[] }>(
          `/api/public/projects/${encodeURIComponent(slug)}${isPreview ? '?preview=1' : ''}`
        );
        if (active) {
          setProject(res.project);
          setRelated(res.relatedProjects || []);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Project not found.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [slug, isPreview]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxImage(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-6" aria-busy="true">
        <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="h-10 w-3/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="aspect-[16/9] w-full bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24 text-center space-y-4">
        <SeoHead
          title="Project Not Found — Gideon Kwesi Ansah"
          description="The requested project could not be found."
          noindex
        />
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
          Project Not Available
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {error || 'This project is either unpublished or does not exist.'}
        </p>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0A192F] text-white dark:bg-sky-500 dark:text-slate-950 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>
      </div>
    );
  }

  const gallery = (project.galleryImages || []).filter(Boolean);

  return (
    <>
      <SeoHead
        title={`${project.title} — ${data?.settings?.profileName || 'Gideon Kwesi Ansah'}`}
        description={project.shortDescription}
        imageUrl={project.coverImageUrl || data?.settings?.socialImageUrl}
        noindex={isPreview || project.status !== 'published'}
      />

      <article>
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#081121]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <Link
              to="/projects"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>All Projects</span>
            </Link>

            <p className="mt-6 text-xs font-medium text-sky-700 dark:text-sky-400">
              {project.category}
              {project.status !== 'published' ? ` · ${project.status}` : ''}
            </p>

            <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold tracking-tight text-slate-900 dark:text-white">
              {project.title}
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
              {project.overview || project.shortDescription}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              {project.liveDemoUrl ? (
                <a
                  href={project.liveDemoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0A192F] text-white dark:bg-sky-500 dark:text-slate-950 text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <span>Live Demonstration</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              ) : null}

              {project.githubUrl ? (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub Repository</span>
                </a>
              ) : null}

              {project.demoVideoUrl ? (
                <a
                  href={project.demoVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span>Watch Demo Video</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              ) : null}
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">
          {project.coverImageUrl ? (
            <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <ImageWithFallback
                src={project.coverImageUrl}
                alt={project.title}
                className="w-full h-full object-cover"
                eager
              />
            </div>
          ) : null}

          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {project.businessProblemSolved ? (
              <section className="py-8 first:pt-0 grid grid-cols-1 md:grid-cols-12 gap-6">
                <h2 className="md:col-span-4 text-lg font-display font-semibold text-slate-900 dark:text-white">
                  Business Problem Solved
                </h2>
                <p className="md:col-span-8 text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {project.businessProblemSolved}
                </p>
              </section>
            ) : null}

            {project.problemStatement ? (
              <section className="py-8 first:pt-0 grid grid-cols-1 md:grid-cols-12 gap-6">
                <h2 className="md:col-span-4 text-lg font-display font-semibold text-slate-900 dark:text-white">
                  Problem Statement
                </h2>
                <p className="md:col-span-8 text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {project.problemStatement}
                </p>
              </section>
            ) : null}

            {project.objectives && project.objectives.length > 0 ? (
              <section className="py-8 first:pt-0 grid grid-cols-1 md:grid-cols-12 gap-6">
                <h2 className="md:col-span-4 text-lg font-display font-semibold text-slate-900 dark:text-white">
                  Objectives
                </h2>
                <ul className="md:col-span-8 space-y-2.5 text-base text-slate-600 dark:text-slate-300">
                  {project.objectives.map((obj, idx) => (
                    <li key={idx} className="flex items-baseline gap-3">
                      <span className="text-xs font-mono tabular-nums text-sky-700 dark:text-sky-400">
                        0{idx + 1}.
                      </span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {project.contribution ? (
              <section className="py-8 first:pt-0 grid grid-cols-1 md:grid-cols-12 gap-6">
                <h2 className="md:col-span-4 text-lg font-display font-semibold text-slate-900 dark:text-white">
                  My Contribution
                </h2>
                <p className="md:col-span-8 text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {project.contribution}
                </p>
              </section>
            ) : null}

            {project.technologies && project.technologies.length > 0 ? (
              <section className="py-8 first:pt-0 grid grid-cols-1 md:grid-cols-12 gap-6">
                <h2 className="md:col-span-4 text-lg font-display font-semibold text-slate-900 dark:text-white">
                  Technologies &amp; Tools
                </h2>
                <p className="md:col-span-8 text-base text-slate-700 dark:text-slate-200 leading-relaxed">
                  {project.technologies.join(' · ')}
                </p>
              </section>
            ) : null}

            {project.developmentProcess ? (
              <section className="py-8 first:pt-0 grid grid-cols-1 md:grid-cols-12 gap-6">
                <h2 className="md:col-span-4 text-lg font-display font-semibold text-slate-900 dark:text-white">
                  Development Process
                </h2>
                <p className="md:col-span-8 text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {project.developmentProcess}
                </p>
              </section>
            ) : null}

            {project.caseStudyDetails ? (
              <section className="py-8 first:pt-0 grid grid-cols-1 md:grid-cols-12 gap-6">
                <h2 className="md:col-span-4 text-lg font-display font-semibold text-slate-900 dark:text-white">
                  Case Study Details
                </h2>
                <p className="md:col-span-8 text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {project.caseStudyDetails}
                </p>
              </section>
            ) : null}

            {project.resultsAndFindings ? (
              <section className="py-8 first:pt-0 grid grid-cols-1 md:grid-cols-12 gap-6">
                <h2 className="md:col-span-4 text-lg font-display font-semibold text-slate-900 dark:text-white">
                  Results &amp; Findings
                </h2>
                <p className="md:col-span-8 text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {project.resultsAndFindings}
                </p>
              </section>
            ) : null}
          </div>

          {gallery.length > 0 ? (
            <section className="pt-4">
              <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-6">
                Screenshots &amp; Gallery
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {gallery.map((imgUrl, idx) => (
                  <button
                    key={imgUrl + idx}
                    type="button"
                    onClick={() => setLightboxImage(imgUrl)}
                    className="group aspect-[16/10] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 text-left focus-visible:outline-2 focus-visible:outline-sky-500"
                  >
                    <ImageWithFallback
                      src={imgUrl}
                      alt={`${project.title} screenshot ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {related.length > 0 ? (
            <section className="pt-10 border-t border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-6">
                Related Projects
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map((rel) => (
                  <ProjectCard key={rel._id} project={rel} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </article>

      {lightboxImage ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            aria-label="Close image preview"
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={lightboxImage}
            alt="Project gallery preview"
            className="max-w-full max-h-[88vh] rounded-lg object-contain"
            referrerPolicy="no-referrer"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </>
  );
}

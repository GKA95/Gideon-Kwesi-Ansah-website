import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { SeoHead } from '../../components/common/SeoHead';
import { PublicStateGuard } from '../../components/public/PublicStateGuard';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';
import serviceElectricalImg from '../../assets/images/service_electrical_grid_1794571262270.jpg';
import serviceDataImg from '../../assets/images/service_data_systems_1794571262657.jpg';

export function ServicesPage({ isPreview = false }: { isPreview?: boolean }) {
  const { data } = usePortfolio();
  const services = data?.services || [];
  const projects = data?.projects || [];
  const settings = data?.settings;

  const getDefaultServiceVisual = (category: string, uploadedUrl?: string) => {
    if (uploadedUrl) return uploadedUrl;
    if (category === 'Electrical Engineering') return serviceElectricalImg;
    if (category === 'Data Analytics' || category === 'AI Automation') return serviceDataImg;
    return '';
  };

  return (
    <PublicStateGuard>
      <SeoHead
        title={`Services — ${settings?.profileName || 'Gideon Kwesi Ansah'}`}
        description="Website Development, Data Analytics and Machine Learning, AI Automation and Business Solutions, and Electrical Engineering services."
        imageUrl={settings?.socialImageUrl}
        noindex={isPreview}
      />

      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#081121]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <p className="text-sm font-medium text-sky-700 dark:text-sky-400">Services &amp; Capabilities</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold tracking-tight text-slate-900 dark:text-white max-w-3xl">
            Technical Solutions Across Software, Data, AI Automation, and Electrical Engineering
          </h1>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            Every capability is tailored to clear operational objectives—whether launching a custom
            web platform, analysing business or energy datasets, automating customer workflows, or
            modelling power systems.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-16">
        {services.map((service, idx) => {
          const visualSrc = getDefaultServiceVisual(service.category, service.visualUrl);
          const related = projects.filter(
            (p) =>
              p.category === service.category ||
              (service.relatedProjectSlugs || []).includes(p.slug)
          );

          return (
            <article
              key={service._id}
              id={service.slug}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1B2E] overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12">
                <div className="lg:col-span-7 p-7 sm:p-10 flex flex-col justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-3 text-xs font-mono tabular-nums text-sky-700 dark:text-sky-400">
                      <span>0{idx + 1}.</span>
                      <span>{service.category}</span>
                    </div>

                    <h2 className="mt-2 text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white">
                      {service.title}
                    </h2>

                    <p className="mt-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                      {service.description}
                    </p>

                    {service.isAiAutomation && service.aiProblemSolved ? (
                      <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">
                          Business Challenges Addressed
                        </p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          {service.aiProblemSolved}
                        </p>
                      </div>
                    ) : null}

                    {service.aiCaseStudy ? (
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">
                          Implementation Notes
                        </p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          {service.aiCaseStudy}
                        </p>
                      </div>
                    ) : null}

                    {service.capabilities && service.capabilities.length > 0 && (
                      <div className="mt-6">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
                          Capabilities &amp; Scope
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {service.capabilities.map((cap) => (
                            <li
                              key={cap}
                              className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200"
                            >
                              <Check className="w-4 h-4 mt-0.5 text-sky-600 dark:text-sky-400 shrink-0" />
                              <span>{cap}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                    <Link
                      to={`/contact?service=${encodeURIComponent(service.category)}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0A192F] text-white dark:bg-sky-500 dark:text-slate-950 text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                      <span>Inquire About {service.title}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    {service.aiDemoUrl ? (
                      <a
                        href={service.aiDemoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-sky-700 dark:text-sky-400 hover:underline"
                      >
                        View Demonstration
                      </a>
                    ) : null}
                  </div>
                </div>

                <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between bg-slate-50 dark:bg-[#091426]">
                  <div className="aspect-[4/3] w-full overflow-hidden border-b border-slate-200 dark:border-slate-800">
                    <ImageWithFallback
                      src={visualSrc}
                      alt={service.title}
                      fallbackLabel={service.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Related Published Projects
                      </p>
                      {related.length > 0 ? (
                        <ul className="mt-3 space-y-2.5">
                          {related.map((proj) => (
                            <li key={proj._id}>
                              <Link
                                to={`/projects/${encodeURIComponent(proj.slug)}`}
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-900 dark:text-white hover:text-sky-700 dark:hover:text-sky-400"
                              >
                                <span>{proj.title}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          Published project case studies in {service.category} will appear here as
                          they are added.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </PublicStateGuard>
  );
}

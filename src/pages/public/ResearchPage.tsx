import { FileText, Download } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { SeoHead } from '../../components/common/SeoHead';
import { PublicStateGuard } from '../../components/public/PublicStateGuard';

export function ResearchPage({ isPreview = false }: { isPreview?: boolean }) {
  const { data } = usePortfolio();
  const research = data?.research;
  const settings = data?.settings;
  const documents = (data?.documents || []).filter(
    (d) => d.category === 'research_report' || d.category === 'technical_paper'
  );

  return (
    <PublicStateGuard>
      <SeoHead
        title={`Research — ${settings?.profileName || 'Gideon Kwesi Ansah'}`}
        description="Academic background and research interests in renewable energy integration, battery energy storage, smart microgrids, and machine learning for energy systems."
        imageUrl={settings?.socialImageUrl}
        noindex={isPreview}
      />

      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#081121]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-20">
          <p className="text-sm font-medium text-sky-700 dark:text-sky-400">
            Academic &amp; Engineering Research
          </p>
          <h1 className="mt-2 text-2xl sm:text-4xl font-display font-bold tracking-tight text-slate-900 dark:text-white max-w-3xl">
            Power Systems, Renewable Energy, and Data-Driven Forecasting
          </h1>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            {research?.academicBackground}
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12 sm:space-y-16">
        {/* Three Focus Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1B2E] p-6">
            <h2 className="text-lg font-display font-semibold text-slate-900 dark:text-white">
              Engineering Research Projects
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {research?.engineeringResearchSummary}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1B2E] p-6">
            <h2 className="text-lg font-display font-semibold text-slate-900 dark:text-white">
              Data Science &amp; Machine Learning
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {research?.dataScienceSummary}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1B2E] p-6">
            <h2 className="text-lg font-display font-semibold text-slate-900 dark:text-white">
              Renewable Energy &amp; Power Systems
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {research?.renewableEnergySummary}
            </p>
          </div>
        </div>

        {/* 7 Research Interests */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-8">
            Core Research Interests
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            {(research?.researchInterests || []).map((item, idx) => (
              <div
                key={item._id || item.title}
                className="pb-6 border-b border-slate-200 dark:border-slate-800/80"
              >
                <div className="flex items-baseline gap-3">
                  <span className="text-xs font-mono tabular-nums text-sky-700 dark:text-sky-400">
                    0{idx + 1}.
                  </span>
                  <h3 className="text-base font-display font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                </div>
                {item.description ? (
                  <p className="mt-2 pl-6 sm:pl-8 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* Future Publications & Technical Reports */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1B2E] p-5 sm:p-10">
          <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 dark:text-white">
            Publications &amp; Technical Reports
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            {research?.futurePublicationsNote ||
              'Technical reports, working papers, and future research publications will appear here as they are published.'}
          </p>

          {documents.length > 0 ? (
            <div className="mt-6 divide-y divide-slate-200 dark:divide-slate-800 border-t border-slate-200 dark:border-slate-800">
              {documents.map((doc) => (
                <div
                  key={doc._id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 mt-0.5 text-sky-700 dark:text-sky-400 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {doc.title}
                      </p>
                      {doc.description ? (
                        <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                          {doc.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={doc.fileName}
                    className="inline-flex items-center justify-center gap-1.5 w-full sm:w-auto min-h-[44px] sm:min-h-0 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </a>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </PublicStateGuard>
  );
}

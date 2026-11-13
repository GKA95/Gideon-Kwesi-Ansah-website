import { Link } from 'react-router-dom';
import { Download, ArrowRight } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { SeoHead } from '../../components/common/SeoHead';
import { PublicStateGuard } from '../../components/public/PublicStateGuard';

export function AboutPage({ isPreview = false }: { isPreview?: boolean }) {
  const { data } = usePortfolio();
  const about = data?.about;
  const settings = data?.settings;

  const sections = [
    {
      number: '01.',
      title: 'Professional Background',
      content: about?.professionalBackground,
    },
    {
      number: '02.',
      title: 'Education',
      content: about?.educationDetails,
    },
    {
      number: '03.',
      title: 'Technical Interests',
      content: about?.technicalInterests,
    },
    {
      number: '04.',
      title: 'Professional Approach',
      content: about?.professionalApproach,
    },
    {
      number: '05.',
      title: 'Career and Research Interests',
      content: about?.careerAndResearchInterests,
    },
  ];

  return (
    <PublicStateGuard>
      <SeoHead
        title={`About — ${settings?.profileName || 'Gideon Kwesi Ansah'}`}
        description={`Academic background and multidisciplinary engineering profile of ${
          about?.fullName || 'Gideon Kwesi Ansah'
        }, BSc Electrical and Electronic Engineering (KNUST, 2024).`}
        imageUrl={settings?.socialImageUrl}
        noindex={isPreview}
      />

      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#081121]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-8">
              <p className="text-sm font-medium text-sky-700 dark:text-sky-400">About Me</p>
              <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold tracking-tight text-slate-900 dark:text-white">
                {about?.fullName || 'Gideon Kwesi Ansah'}
              </h1>
              <p className="mt-3 text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                Electrical Engineering Graduate | Power System &amp; Energy | Microgrids | Data
                Analyst | AI Product Builder | Transforming Ideas into Web &amp; Mobile Apps |
                Virtual Assistant | Educator
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-4">
              {settings?.profilePhotoUrl ? (
                <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                  <img
                    src={settings.profilePhotoUrl}
                    alt={about?.fullName || 'Gideon Kwesi Ansah'}
                    className="w-full h-full object-cover object-top"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                {settings?.cvDocumentUrl ? (
                  <a
                    href={settings.cvDocumentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={settings.cvFileName || 'Gideon_Kwesi_Ansah_CV.pdf'}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0A192F] text-white dark:bg-sky-500 dark:text-slate-950 text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download CV</span>
                  </a>
                ) : null}
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span>Contact Me</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {sections.map((sec) =>
            sec.content ? (
              <div key={sec.title} className="py-10 first:pt-0 last:pb-0 grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 flex items-baseline gap-3">
                  <span className="text-xs font-mono tabular-nums text-sky-700 dark:text-sky-400">
                    {sec.number}
                  </span>
                  <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">
                    {sec.title}
                  </h2>
                </div>
                <div className="lg:col-span-8">
                  <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line max-w-3xl">
                    {sec.content}
                  </p>
                </div>
              </div>
            ) : null
          )}
        </div>
      </section>
    </PublicStateGuard>
  );
}

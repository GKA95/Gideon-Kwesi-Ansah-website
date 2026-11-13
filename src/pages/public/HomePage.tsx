import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Code2,
  BarChart3,
  Bot,
  Zap,
  Download,
  GraduationCap,
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { SeoHead } from '../../components/common/SeoHead';
import { PublicStateGuard } from '../../components/public/PublicStateGuard';
import { ProjectCard } from '../../components/public/ProjectCard';
import type { ProjectCategory } from '../../types/portfolio';

const CATEGORY_ICON_MAP: Record<ProjectCategory, typeof Code2> = {
  'Website Development': Code2,
  'Data Analytics': BarChart3,
  'AI Automation': Bot,
  'Electrical Engineering': Zap,
};

export function HomePage({ isPreview = false }: { isPreview?: boolean }) {
  const { data } = usePortfolio();
  const settings = data?.settings;
  const home = data?.homepage;
  const about = data?.about;
  const services = data?.services || [];
  const featuredProjects = data?.featuredProjects || [];
  const research = data?.research;
  const skills = data?.skills || [];
  const testimonials = data?.testimonials || [];

  const groupedSkills = skills.reduce<Record<string, string[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s.name);
    return acc;
  }, {});

  const structuredData = settings
    ? {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: settings.profileName || 'Gideon Kwesi Ansah',
        url: typeof window !== 'undefined' ? window.location.origin : '',
        sameAs: [settings.githubUrl, settings.linkedinUrl].filter(Boolean),
        alumniOf: {
          '@type': 'CollegeOrUniversity',
          name: 'Kwame Nkrumah University of Science and Technology (KNUST)',
        },
        jobTitle:
          'Digital Solutions Developer, Data & ML Analyst, AI Automation Specialist, Electrical Engineer',
      }
    : undefined;

  return (
    <PublicStateGuard>
      <SeoHead
        title={
          settings?.seoTitle ||
          'Gideon Kwesi Ansah — Digital Solutions, Data Analytics, AI Automation & Electrical Engineering'
        }
        description={
          settings?.seoDescription ||
          'Portfolio of Gideon Kwesi Ansah. Building digital experiences, automating businesses with AI, turning data into insights, and exploring electrical engineering innovations.'
        }
        imageUrl={settings?.socialImageUrl}
        noindex={isPreview}
        structuredData={structuredData}
      />

      {/* 1. Split Hero Section */}
      <section className="border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#081121]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="lg:col-span-7 flex flex-col justify-center"
            >
              <p className="text-sm font-medium text-sky-700 dark:text-sky-400">
                {home?.heroName || 'Gideon Kwesi Ansah'}
              </p>

              <h1
                className="mt-3 text-3xl sm:text-4xl lg:text-[2.65rem] font-display font-bold tracking-tight text-slate-900 dark:text-white leading-[1.16]"
                style={{ textWrap: 'balance' }}
              >
                {home?.heroHeadline ||
                  'Building Digital Experiences. Automating Businesses with AI. Turning Data into Insights. Exploring Engineering Innovations.'}
              </h1>

              <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                {home?.heroSubheadline ||
                  'I work at the intersection of technology, artificial intelligence, data analytics, and electrical engineering. I build digital solutions, explore intelligent automation, analyse data, and apply engineering knowledge to real-world problems.'}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#0A192F] text-white hover:bg-[#112240] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
                >
                  <span>{home?.primaryCtaText || 'Explore My Work'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
                >
                  {home?.secondaryCtaText || "Let's Work Together"}
                </Link>

                {settings?.cvDocumentUrl ? (
                  <a
                    href={settings.cvDocumentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={settings.cvFileName || 'Gideon_Kwesi_Ansah_CV.pdf'}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-sky-700 dark:hover:text-sky-400 transition-colors whitespace-nowrap shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download CV</span>
                  </a>
                ) : null}
              </div>
            </motion.div>

            {/* Right Column: Profile Photograph Container (Never an AI-generated person photo) */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="lg:col-span-5 flex"
            >
              <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#0D1B2E] overflow-hidden flex flex-col justify-between min-h-[340px] lg:min-h-[420px]">
                {settings?.profilePhotoUrl ? (
                  <img
                    src={settings.profilePhotoUrl}
                    alt={settings.profileName || 'Gideon Kwesi Ansah'}
                    className="w-full h-full object-cover object-top min-h-[340px] lg:min-h-[420px]"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex-1 flex flex-col justify-between p-8 bg-gradient-to-br from-[#0A192F] via-[#0F2342] to-[#0B2942] text-white">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>Profile Portrait</span>
                      <span className="font-mono">GKA</span>
                    </div>

                    <div className="my-auto py-8 flex flex-col items-center text-center">
                      <div className="w-28 h-28 rounded-full border border-sky-400/40 bg-white/5 flex items-center justify-center">
                        <span className="text-3xl font-display font-bold tracking-tight text-sky-300">
                          GKA
                        </span>
                      </div>
                      <p className="mt-5 text-lg font-display font-semibold text-white">
                        {settings?.profileName || 'Gideon Kwesi Ansah'}
                      </p>
                      <p className="mt-1 text-sm text-slate-300">
                        BSc Electrical &amp; Electronic Engineering · KNUST
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/10 text-xs text-slate-300 flex items-center justify-between gap-4">
                      <span>Web · Data &amp; ML · AI Automation · Power Systems</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Short Introduction */}
      <section className="border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4">
              <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 dark:text-white">
                {home?.shortIntroTitle || 'Multidisciplinary Practice Grounded in Engineering Rigour'}
              </h2>
            </div>
            <div className="lg:col-span-8">
              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                {home?.shortIntroBody}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Four Professional Expertise Sections */}
      <section className="border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#081121]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white">
                {home?.expertiseSectionTitle || 'Four Pillars of Work'}
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl">
                Integrated technical capabilities spanning digital product delivery, analytical
                modelling, business AI automation, and electrical engineering.
              </p>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-700 dark:text-sky-400 hover:underline whitespace-nowrap shrink-0"
            >
              <span>Explore All Services</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service, idx) => {
              const Icon = CATEGORY_ICON_MAP[service.category] || Code2;
              return (
                <div
                  key={service._id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0D1B2E] p-6 sm:p-7 flex flex-col justify-between gap-5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                        0{idx + 1}.
                      </span>
                      <Icon className="w-5 h-5 text-sky-700 dark:text-sky-400" strokeWidth={1.75} />
                    </div>

                    <h3 className="mt-3 text-xl font-display font-semibold text-slate-900 dark:text-white">
                      {service.title}
                    </h3>

                    <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {service.description}
                    </p>

                    {service.capabilities && service.capabilities.length > 0 && (
                      <ul className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                        {service.capabilities.slice(0, 6).map((cap) => (
                          <li key={cap} className="truncate">
                            · {cap}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <Link
                      to={`/services#${service.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-900 dark:text-white hover:text-sky-700 dark:hover:text-sky-400 transition-colors"
                    >
                      <span>View Capabilities</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Featured Projects */}
      <section className="border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white">
                {home?.featuredSectionTitle || 'Selected & Ongoing Work'}
              </h2>
              {home?.featuredSectionSubtitle && (
                <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl">
                  {home.featuredSectionSubtitle}
                </p>
              )}
            </div>
            <Link
              to="/projects"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-700 dark:text-sky-400 hover:underline whitespace-nowrap shrink-0"
            >
              <span>All Projects</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {featuredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.map((project) => (
                <ProjectCard key={project._id} project={project} isPreview={isPreview} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1B2E] p-8 sm:p-10 text-center">
              <p className="text-base font-medium text-slate-900 dark:text-white">
                Published project case studies are being prepared.
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                Detailed write-ups on energy consumption forecasting, industrial power outage impact
                modelling, solar PV &amp; battery storage systems, and web platforms will appear here
                once finalised and published.
              </p>
              <div className="mt-5 flex justify-center gap-4">
                <Link
                  to="/services"
                  className="text-sm font-medium text-sky-700 dark:text-sky-400 hover:underline"
                >
                  Explore Services
                </Link>
                <Link
                  to="/research"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:underline"
                >
                  View Research Interests
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. Skills & Technologies */}
      {Object.keys(groupedSkills).length > 0 && (
        <section className="border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#081121]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white mb-10">
              Skills &amp; Technologies
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {Object.entries(groupedSkills).map(([category, items]) => (
                <div
                  key={category}
                  className="pt-4 border-t border-slate-200 dark:border-slate-800"
                >
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                    {category}
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    {items.map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. About Me & Research Preview */}
      <section className="border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* About Preview */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1B2E] p-7 sm:p-8 flex flex-col justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-sky-700 dark:text-sky-400">
                  <GraduationCap className="w-4 h-4" />
                  <span>About Gideon Kwesi Ansah</span>
                </div>
                <h2 className="mt-3 text-2xl font-display font-bold text-slate-900 dark:text-white">
                  {about?.degree || 'BSc Electrical and Electronic Engineering'}
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                  {about?.university || 'Kwame Nkrumah University of Science and Technology (KNUST)'}{' '}
                  · {about?.graduationYear || '2024'} · {about?.honors || 'Second-Class Upper Division'}
                </p>
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {about?.professionalBackground}
                </p>
              </div>
              <div>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-900 dark:text-white hover:text-sky-700 dark:hover:text-sky-400"
                >
                  <span>Read Full Biography</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Research Preview */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1B2E] p-7 sm:p-8 flex flex-col justify-between gap-6">
              <div>
                <p className="text-xs font-medium text-sky-700 dark:text-sky-400">
                  Academic &amp; Technical Focus
                </p>
                <h2 className="mt-3 text-2xl font-display font-bold text-slate-900 dark:text-white">
                  Research Interests
                </h2>
                <ul className="mt-4 space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
                  {(research?.researchInterests || []).slice(0, 5).map((item, idx) => (
                    <li key={item.title} className="flex items-baseline gap-3">
                      <span className="text-xs font-mono tabular-nums text-slate-400">
                        0{idx + 1}.
                      </span>
                      <span>{item.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <Link
                  to="/research"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-900 dark:text-white hover:text-sky-700 dark:hover:text-sky-400"
                >
                  <span>Explore Research Page</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Genuine Testimonials (Rendered only if added in Admin) */}
      {testimonials.length > 0 && (
        <section className="border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#081121]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-8">
              Client &amp; Colleague Perspectives
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <blockquote
                  key={t._id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0D1B2E] p-6 flex flex-col justify-between gap-5"
                >
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    &ldquo;{t.content}&rdquo;
                  </p>
                  <footer className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                    {t.photoUrl ? (
                      <img
                        src={t.photoUrl}
                        alt={t.personName}
                        className="w-10 h-10 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : null}
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {t.personName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t.positionOrOrg}
                      </p>
                    </div>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. Call-to-Action Section */}
      <section className="bg-[#0A192F] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <h2
              className="text-2xl sm:text-3xl font-display font-bold tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              {home?.ctaTitle || 'Have a project, research collaboration, or business workflow to build?'}
            </h2>
            <p className="mt-3 text-base text-slate-300 leading-relaxed">
              {home?.ctaBody ||
                'Reach out to discuss website development, data analytics, AI automation, or electrical engineering collaborations.'}
            </p>
          </div>
          <div className="shrink-0">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-sky-500 text-slate-950 font-semibold text-sm hover:bg-sky-400 transition-colors whitespace-nowrap"
            >
              <span>{home?.ctaButtonText || 'Start a Conversation'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </PublicStateGuard>
  );
}

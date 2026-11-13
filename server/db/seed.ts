import {
  AboutContentModel,
  HomepageContentModel,
  ProjectModel,
  ResearchContentModel,
  ServiceItemModel,
  SiteSettingsModel,
  SkillModel,
} from './models.ts';

let seededOnce = false;

export async function seedInitialPortfolioData(): Promise<void> {
  if (seededOnce) return;

  try {
    const existingSettings = await SiteSettingsModel.findOne({ singletonKey: 'default' });
    if (!existingSettings) {
      await SiteSettingsModel.create({
        singletonKey: 'default',
        siteName: 'Gideon Kwesi Ansah',
        profileName: 'Gideon Kwesi Ansah',
        logoUrl: '',
        profilePhotoUrl: '',
        contactEmail: '',
        whatsappNumber: '',
        linkedinUrl: 'https://www.linkedin.com/in/gideon-kwesi-ansah-066b55218',
        githubUrl: 'https://github.com/GKA95',
        cvDocumentUrl: '',
        cvFileName: '',
        seoTitle:
          'Gideon Kwesi Ansah — Digital Solutions, Data Analytics, AI Automation & Electrical Engineering',
        seoDescription:
          'Portfolio of Gideon Kwesi Ansah. Building digital experiences, automating businesses with AI, turning data into insights, and exploring electrical engineering innovations.',
        socialImageUrl: '',
        footerText:
          '© 2026 Gideon Kwesi Ansah. Built across software engineering, data science, AI automation, and electrical engineering.',
      });
    } else if (!existingSettings.linkedinUrl) {
      existingSettings.linkedinUrl = 'https://www.linkedin.com/in/gideon-kwesi-ansah-066b55218';
      await existingSettings.save();
    }

    const existingHome = await HomepageContentModel.findOne({ singletonKey: 'default' });
    if (!existingHome) {
      const initialHome = {
        heroName: 'Gideon Kwesi Ansah',
        heroHeadline:
          'Building Digital Experiences. Automating Businesses with AI. Turning Data into Insights. Exploring Engineering Innovations.',
        heroSubheadline:
          'I work at the intersection of technology, artificial intelligence, data analytics, and electrical engineering. I build digital solutions, explore intelligent automation, analyse data, and apply engineering knowledge to real-world problems.',
        primaryCtaText: 'Explore My Work',
        secondaryCtaText: "Let's Work Together",
        shortIntroTitle: 'Multidisciplinary Practice Grounded in Engineering Rigour',
        shortIntroBody:
          'With a foundation in Electrical and Electronic Engineering from KNUST and practical experience across software development, statistical modelling, and business workflow automation, I design systems that are structured, measurable, and built to serve real operational needs.',
        expertiseSectionTitle: 'Four Pillars of Work',
        featuredSectionTitle: 'Selected & Ongoing Work',
        featuredSectionSubtitle:
          'Projects spanning predictive energy analytics, engineering modelling, digital platforms, and intelligent business automation.',
        ctaTitle: 'Have a project, research collaboration, or business workflow to build?',
        ctaBody:
          'Whether you need a responsive web platform, structured data analysis, an AI business assistant, or technical collaboration in power and energy systems, reach out to start a conversation.',
        ctaButtonText: 'Get in Touch',
      };
      await HomepageContentModel.create({
        singletonKey: 'default',
        isPublished: true,
        published: initialHome,
        draft: initialHome,
      });
    }

    const existingAbout = await AboutContentModel.findOne({ singletonKey: 'default' });
    if (!existingAbout) {
      const initialAbout = {
        fullName: 'Gideon Kwesi Ansah',
        degree: 'BSc Electrical and Electronic Engineering',
        university: 'Kwame Nkrumah University of Science and Technology (KNUST)',
        graduationYear: '2024',
        honors: 'Second-Class Upper Division',
        professionalBackground:
          'I am Gideon Kwesi Ansah, an Electrical and Electronic Engineering graduate working across web development, data analytics and machine learning, AI business automation, and power systems engineering. My focus is on bridging analytical rigour with modern software tools to solve practical challenges for businesses, organisations, and energy systems.',
        educationDetails:
          'I earned a Bachelor of Science in Electrical and Electronic Engineering from the Kwame Nkrumah University of Science and Technology (KNUST) in 2024, graduating with Second-Class Upper Division honours. My academic training grounded me in circuit analysis, power systems, control engineering, mathematical modelling, and quantitative research.',
        technicalInterests:
          'My technical work spans modern full-stack web applications, exploratory data analysis and predictive modelling with Python, intelligent workflow automation using custom AI assistants, and simulation of renewable energy and power storage systems in MATLAB.',
        professionalApproach:
          'Every engagement starts with clearly defining the operational problem before selecting tools. Whether structuring a relational or document database, cleaning complex datasets, designing a web interface, or modelling power system behaviour, I prioritise clarity, maintainability, and verifiable outcomes.',
        careerAndResearchInterests:
          'Looking ahead, I am focused on deepening applied research at the intersection of renewable energy integration, battery energy storage, smart microgrids, and machine learning-driven forecasting—while continuing to build practical digital and AI solutions for growing organisations.',
      };
      await AboutContentModel.create({
        singletonKey: 'default',
        isPublished: true,
        published: initialAbout,
        draft: initialAbout,
      });
    }

    const serviceCount = await ServiceItemModel.countDocuments();
    if (serviceCount === 0) {
      await ServiceItemModel.insertMany([
        {
          slug: 'website-development',
          title: 'Website Development',
          shortSummary:
            'Modern, responsive websites, web applications, and custom content management platforms.',
          description:
            'I design and develop modern, responsive websites and web applications for businesses, organisations, professionals, and individuals.',
          capabilities: [
            'Business websites',
            'Personal portfolio websites',
            'Landing pages',
            'Church and organisation websites',
            'Website redesign',
            'Web applications',
            'Contact forms',
            'Admin dashboards and content management functionality',
          ],
          category: 'Website Development',
          visualUrl: '',
          relatedProjectSlugs: [],
          order: 1,
          isPublished: true,
          isAiAutomation: false,
        },
        {
          slug: 'data-analytics-and-machine-learning',
          title: 'Data Analytics and Machine Learning',
          shortSummary:
            'Statistical modelling, exploratory analysis, dashboards, and predictive machine learning.',
          description:
            'I use data analytics, visualisation, statistical methods, and machine learning to transform data into useful information and support better decision-making.',
          capabilities: [
            'Data cleaning and preparation',
            'Exploratory data analysis',
            'Data visualisation',
            'Power BI dashboards',
            'Excel reporting',
            'Predictive modelling',
            'Machine learning',
            'Data-driven insights',
          ],
          category: 'Data Analytics',
          visualUrl: '',
          relatedProjectSlugs: ['household-power-consumption-forecasting'],
          order: 2,
          isPublished: true,
          isAiAutomation: false,
        },
        {
          slug: 'ai-automation-and-business-solutions',
          title: 'AI Automation and Business Solutions',
          shortSummary:
            'Custom AI assistants, automated enquiry handling, and intelligent workflow integrations.',
          description:
            'I help businesses explore and implement AI-powered solutions that automate repetitive tasks, improve workflows, support customers, and make business operations more efficient.',
          capabilities: [
            'AI-powered customer support assistants',
            'Custom AI assistants for businesses',
            'Business workflow automation',
            'AI-powered WhatsApp assistants',
            'Automated customer enquiry handling',
            'Lead collection and follow-up automation',
            'Appointment booking automation',
            'AI-powered document processing',
            'Custom AI agents',
            'AI integrations into existing business processes',
          ],
          category: 'AI Automation',
          visualUrl: '',
          relatedProjectSlugs: [],
          order: 3,
          isPublished: true,
          isAiAutomation: true,
          aiProblemSolved:
            'Reducing manual administrative bottlenecks in customer enquiries, lead capture, appointment scheduling, and internal document processing.',
        },
        {
          slug: 'electrical-engineering',
          title: 'Electrical Engineering',
          shortSummary:
            'Power systems, solar PV and battery storage modelling, microgrids, and energy optimisation.',
          description:
            'My electrical engineering background and technical interests focus on power systems, renewable energy, energy storage, and the application of technology and data science to electrical engineering problems.',
          capabilities: [
            'Electrical power systems',
            'Renewable energy systems',
            'Solar PV systems',
            'Battery energy storage',
            'Microgrids',
            'Smart grids',
            'Power system optimisation',
            'Machine learning applications in energy systems',
          ],
          category: 'Electrical Engineering',
          visualUrl: '',
          relatedProjectSlugs: [
            'impact-assessment-of-power-outages',
            'solar-pv-and-battery-system-modelling',
          ],
          order: 4,
          isPublished: true,
          isAiAutomation: false,
        },
      ]);
    }

    const projectCount = await ProjectModel.countDocuments();
    if (projectCount === 0) {
      await ProjectModel.insertMany([
        {
          title: 'Household Power Consumption Forecasting',
          slug: 'household-power-consumption-forecasting',
          category: 'Data Analytics',
          shortDescription:
            'A machine learning project focused on analysing household electricity consumption and developing predictive models.',
          overview:
            'A machine learning project focused on analysing household electricity consumption patterns and developing predictive forecasting models using Python data science tooling.',
          problemStatement: '',
          objectives: [],
          contribution: '',
          technologies: ['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'Machine Learning'],
          developmentProcess: '',
          resultsAndFindings: '',
          coverImageUrl: '',
          galleryImages: [],
          githubUrl: '',
          liveDemoUrl: '',
          featured: true,
          order: 1,
          status: 'draft',
        },
        {
          title:
            'Impact Assessment of Power Outages on the Operation of an Industrial/Commercial Company',
          slug: 'impact-assessment-of-power-outages',
          category: 'Electrical Engineering',
          shortDescription:
            'An undergraduate research project examining the impact of electricity outages on business operations, operational downtime, and revenue using multiple linear regression.',
          overview:
            'An undergraduate engineering research study conducted to examine how electricity outages affect industrial and commercial operations, downtime, and revenue performance using multiple linear regression analysis.',
          problemStatement: '',
          objectives: [],
          contribution: '',
          technologies: ['Multiple Linear Regression', 'Statistical Modelling', 'Energy Economics'],
          developmentProcess: '',
          resultsAndFindings: '',
          coverImageUrl: '',
          galleryImages: [],
          githubUrl: '',
          liveDemoUrl: '',
          featured: true,
          order: 2,
          status: 'draft',
        },
        {
          title: 'Solar PV and Battery System Modelling',
          slug: 'solar-pv-and-battery-system-modelling',
          category: 'Electrical Engineering',
          shortDescription:
            'An electrical engineering project involving the modelling and analysis of a solar photovoltaic and battery energy storage system using MATLAB.',
          overview:
            'An electrical engineering modelling project analysing the behaviour and integration of a solar photovoltaic generation array paired with a battery energy storage system in MATLAB.',
          problemStatement: '',
          objectives: [],
          contribution: '',
          technologies: ['MATLAB', 'Solar PV Systems', 'Battery Energy Storage'],
          developmentProcess: '',
          resultsAndFindings: '',
          coverImageUrl: '',
          galleryImages: [],
          githubUrl: '',
          liveDemoUrl: '',
          featured: true,
          order: 3,
          status: 'draft',
        },
      ]);
    }

    const existingResearch = await ResearchContentModel.findOne({ singletonKey: 'default' });
    if (!existingResearch) {
      const initialResearch = {
        academicBackground:
          'BSc Electrical and Electronic Engineering, Kwame Nkrumah University of Science and Technology (KNUST), 2024 — Second-Class Upper Division. Academic work focused on electrical power engineering, quantitative analysis, and computational modelling.',
        engineeringResearchSummary:
          'Investigating grid reliability, industrial outage impacts, solar photovoltaic integration, and battery storage dynamics through mathematical modelling and simulation.',
        dataScienceSummary:
          'Applying time-series analysis, regression modelling, and supervised machine learning to energy consumption datasets and operational telemetry.',
        renewableEnergySummary:
          'Exploring decentralised electricity access, hybrid microgrid architectures, and intelligent control strategies for resilient power delivery.',
        researchInterests: [
          {
            title: 'Renewable energy integration',
            description:
              'Grid-compatible integration of variable solar and clean generation sources into distribution networks.',
            order: 1,
          },
          {
            title: 'Battery energy storage systems',
            description:
              'Modelling charge/discharge dynamics, sizing, and operational reliability of BESS installations.',
            order: 2,
          },
          {
            title: 'Smart grids and microgrids',
            description:
              'Coordinated control, load balancing, and islanded operation of modern microgrid architectures.',
            order: 3,
          },
          {
            title: 'Machine learning for energy forecasting',
            description:
              'Short- and medium-term load and generation forecasting using statistical and ML approaches.',
            order: 4,
          },
          {
            title: 'Power system optimisation and control',
            description:
              'Analytical and data-informed dispatch and loss reduction techniques for electrical networks.',
            order: 5,
          },
          {
            title: 'Decentralised electricity access in Africa',
            description:
              'Practical engineering and techno-economic frameworks for reliable distributed energy access.',
            order: 6,
          },
          {
            title: 'Data-driven energy management',
            description:
              'Leveraging consumption analytics to reduce waste, peak demand stress, and operational downtime.',
            order: 7,
          },
        ],
        futurePublicationsNote:
          'Technical reports, working papers, and future research publications will be published and made downloadable here as they are finalised.',
      };
      await ResearchContentModel.create({
        singletonKey: 'default',
        isPublished: true,
        published: initialResearch,
        draft: initialResearch,
      });
    }

    const skillCount = await SkillModel.countDocuments();
    if (skillCount === 0) {
      await SkillModel.insertMany([
        { name: 'React & TypeScript', category: 'Website Development', order: 1, isPublished: true },
        { name: 'Node.js & Express', category: 'Website Development', order: 2, isPublished: true },
        { name: 'MongoDB & REST APIs', category: 'Website Development', order: 3, isPublished: true },
        { name: 'Tailwind CSS', category: 'Website Development', order: 4, isPublished: true },
        { name: 'Python (Pandas, NumPy)', category: 'Data Analytics & ML', order: 5, isPublished: true },
        { name: 'Scikit-learn', category: 'Data Analytics & ML', order: 6, isPublished: true },
        { name: 'Power BI & Excel Reporting', category: 'Data Analytics & ML', order: 7, isPublished: true },
        { name: 'Multiple Linear Regression', category: 'Data Analytics & ML', order: 8, isPublished: true },
        { name: 'Custom AI Assistants', category: 'AI Automation', order: 9, isPublished: true },
        { name: 'Workflow & Enquiry Automation', category: 'AI Automation', order: 10, isPublished: true },
        { name: 'Document Processing Agents', category: 'AI Automation', order: 11, isPublished: true },
        { name: 'MATLAB Simulation', category: 'Electrical Engineering', order: 12, isPublished: true },
        { name: 'Solar PV & Battery Storage', category: 'Electrical Engineering', order: 13, isPublished: true },
        { name: 'Power Systems & Microgrids', category: 'Electrical Engineering', order: 14, isPublished: true },
      ]);
    }

    seededOnce = true;
  } catch (err) {
    console.error('[Seed] Failed to initialize portfolio data:', err);
  }
}

-- Generated from data/sample_occupations.jsonl. Re-run npm run generate:platform-seed after source changes.
-- These are analyst-reviewed model records, not vacancy counts or national employment totals.

insert into public.data_sources (
  source_key, name, source_type, homepage_url, refresh_cadence, is_verified, last_checked_at
) values (
  'india-role-model-2026-08',
  'India role model 2026.08',
  'model',
  'https://global-ai-jobs-impact-dashboard.netlify.app/methodology',
  'versioned release',
  true,
  '2026-08-04T00:00:00Z'
) on conflict (source_key) do update set
  name = excluded.name,
  last_checked_at = excluded.last_checked_at;

insert into public.score_versions (version_key, label, methodology_url, rules, published_at)
values (
  '2026.08-v2',
  'India career outlook 2026.08 v2',
  'https://global-ai-jobs-impact-dashboard.netlify.app/methodology',
  '{"scale":"0-100","employment_basis":"modelled","vacancies_separate":true}'::jsonb,
  '2026-08-04T00:00:00Z'
) on conflict (version_key) do update set
  label = excluded.label,
  rules = excluded.rules,
  published_at = excluded.published_at;

insert into public.occupations (slug, title, sector, occupation_family, description, is_published)
values
(
  'software-developer',
  'Software Developer',
  'IT & Digital Services',
  'Engineering',
  'Software development remains a growing India role because every sector is digitizing, but AI coding assistants now automate boilerplate, refactoring, unit-test creation, and first-draft code. This is strong augmentation with medium disruption, especially for junior or repetitive implementation work.',
  true
),
(
  'frontend-developer',
  'Frontend Developer',
  'IT & Digital Services',
  'Engineering',
  'Frontend work is exposed because AI tools can generate UI scaffolds, components, tests, and copy quickly. Demand remains meaningful in India, but routine page-building is under higher pressure than architecture, product-quality, accessibility, and design-system work.',
  true
),
(
  'backend-developer',
  'Backend Developer',
  'IT & Digital Services',
  'Engineering',
  'Backend demand remains resilient where engineers own APIs, data models, reliability, security, and domain logic. AI raises productivity on boilerplate, tests, and refactoring, so this is medium disruption rather than no impact.',
  true
),
(
  'mobile-app-developer',
  'Mobile App Developer',
  'IT & Digital Services',
  'Engineering',
  'Mobile app demand continues across fintech, commerce, health, and consumer apps, but AI-assisted app builders and code assistants reduce effort for routine screens, integration snippets, and test cases. Stronger engineers move toward product architecture and AI-enabled mobile experiences.',
  true
),
(
  'qa-engineer-software-tester',
  'QA Engineer / Software Tester',
  'IT & Digital Services',
  'Quality Assurance',
  'Manual and repetitive software testing is highly exposed in India because AI and automation can generate test cases, run regression checks, create synthetic data, inspect logs, and summarize defects. Demand is shifting away from pure manual QA toward SDET, automation, API testing, AI evaluation, and product quality analytics.',
  true
),
(
  'sdet-test-automation-engineer',
  'SDET / Test Automation Engineer',
  'IT & Digital Services',
  'Quality Assurance',
  'SDET and test automation roles are safer than manual QA because they build the automation layer: CI/CD test suites, API checks, performance tests, observability, and AI-assisted quality gates. AI changes the tooling but can expand impact for engineers who own automation strategy.',
  true
),
(
  'ai-qa-engineer-model-evaluation-tester',
  'AI QA Engineer / Model Evaluation Tester',
  'IT & Digital Services',
  'Quality Assurance',
  'AI QA and model evaluation roles are an emerging safer move for testers: they evaluate prompts, model outputs, hallucination risk, safety, regression behavior, and human acceptance criteria. Demand is concentrated in AI product teams, GCCs, SaaS, fintech, and platform companies in Bengaluru, Hyderabad, Pune, Chennai, Delhi NCR, and Mumbai.',
  true
),
(
  'product-manager',
  'Product Manager',
  'IT & Digital Services',
  'Product',
  'Tech adoption is 10/10, remote feasibility is 9/10, growth outlook is 8/10, and automation risk is 4/10 based on task repeatability, physical presence, regulation, digitization, and India demand patterns.',
  true
),
(
  'associate-product-manager',
  'Associate Product Manager',
  'IT & Digital Services',
  'Product',
  'Tech adoption is 10/10, remote feasibility is 8/10, growth outlook is 8/10, and automation risk is 4/10 based on task repeatability, physical presence, regulation, digitization, and India demand patterns.',
  true
),
(
  'project-manager-it',
  'Project Manager - IT',
  'IT & Digital Services',
  'Project / Program Management',
  'Project/program management is AI-assisted for plans, summaries, and reporting, but stakeholder trade-offs and accountability remain resilient.',
  true
),
(
  'scrum-master',
  'Scrum Master',
  'IT & Digital Services',
  'Project / Program Management',
  'Standalone Scrum Master work is exposed where it is mainly ceremony coordination, note-taking, status reporting, and ticket hygiene. The safer path is toward delivery leadership, product operations, engineering program management, or AI-enabled workflow improvement.',
  true
),
(
  'engineering-manager-lead-engineer',
  'Engineering Manager / Lead Engineer',
  'IT & Digital Services',
  'Engineering Leadership',
  'Tech adoption is 10/10, remote feasibility is 9/10, growth outlook is 8/10, and automation risk is 4/10 based on task repeatability, physical presence, regulation, digitization, and India demand patterns.',
  true
),
(
  'devops-engineer-site-reliability-engineer',
  'DevOps Engineer / Site Reliability Engineer',
  'IT & Digital Services',
  'Infrastructure & Cloud',
  'Tech adoption is 10/10, remote feasibility is 9/10, growth outlook is 8/10, and automation risk is 4/10 based on task repeatability, physical presence, regulation, digitization, and India demand patterns.',
  true
),
(
  'cloud-solutions-architect',
  'Cloud Solutions Architect',
  'IT & Digital Services',
  'Infrastructure & Cloud',
  'Tech adoption is 10/10, remote feasibility is 9/10, growth outlook is 8/10, and automation risk is 4/10 based on task repeatability, physical presence, regulation, digitization, and India demand patterns.',
  true
),
(
  'data-analyst',
  'Data Analyst',
  'IT & Digital Services',
  'Data & Analytics',
  'Routine data analyst work is exposed because AI tools can now draft SQL, generate dashboards, summarize trends, and automate recurring reports. The safer path is toward analytics engineering, product analytics, experiment design, data quality, and decision support tied closely to business context.',
  true
),
(
  'data-engineer',
  'Data Engineer',
  'IT & Digital Services',
  'Data & Analytics',
  'Tech adoption is 10/10, remote feasibility is 9/10, growth outlook is 8/10, and automation risk is 4/10 based on task repeatability, physical presence, regulation, digitization, and India demand patterns.',
  true
),
(
  'machine-learning-engineer',
  'Machine Learning Engineer',
  'IT & Digital Services',
  'AI & Machine Learning',
  'Tech adoption is 10/10, remote feasibility is 9/10, growth outlook is 8/10, and automation risk is 4/10 based on task repeatability, physical presence, regulation, digitization, and India demand patterns.',
  true
),
(
  'cybersecurity-analyst',
  'Cybersecurity Analyst',
  'IT & Digital Services',
  'Security',
  'Tech adoption is 10/10, remote feasibility is 9/10, growth outlook is 8/10, and automation risk is 4/10 based on task repeatability, physical presence, regulation, digitization, and India demand patterns.',
  true
),
(
  'ui-ux-designer',
  'UI/UX Designer',
  'IT & Digital Services',
  'Design',
  'Design roles are exposed to generative design tools for first drafts and variants; research, systems thinking, and product context are safer.',
  true
),
(
  'business-analyst-it',
  'Business Analyst - IT',
  'IT & Digital Services',
  'Business Analysis',
  'IT business analysis is under pressure where the work is mostly meeting notes, basic documentation, dashboards, and ticket writing. BAs with domain depth, data fluency, process design, and AI workflow skills remain more resilient.',
  true
),
(
  'technical-support-engineer',
  'Technical Support Engineer',
  'IT & Digital Services',
  'Support & Operations',
  'Tier-1 technical support is exposed to chatbots, retrieval assistants, and automated troubleshooting. More resilient support roles move toward L2/L3 debugging, customer engineering, integrations, observability, and support automation ownership.',
  true
),
(
  'customer-support-executive',
  'Customer Support Executive',
  'BPO / KPO / Shared Services',
  'Customer Operations',
  'Tier-1 support and voice processes are exposed to chatbots, voice bots, knowledge-base retrieval, and automated ticket resolution.',
  true
),
(
  'voice-process-associate',
  'Voice Process Associate',
  'BPO / KPO / Shared Services',
  'Customer Operations',
  'Tier-1 support and voice processes are exposed to chatbots, voice bots, knowledge-base retrieval, and automated ticket resolution.',
  true
),
(
  'non-voice-process-associate',
  'Non-Voice Process Associate',
  'BPO / KPO / Shared Services',
  'Back Office Operations',
  'Document-heavy processing roles are exposed to OCR, KYC automation, rules engines, and AI-assisted exception handling.',
  true
),
(
  'kyc-operations-analyst',
  'KYC Operations Analyst',
  'BPO / KPO / Shared Services',
  'Back Office Operations',
  'Document-heavy processing roles are exposed to OCR, KYC automation, rules engines, and AI-assisted exception handling.',
  true
),
(
  'claims-processing-associate',
  'Claims Processing Associate',
  'BPO / KPO / Shared Services',
  'Back Office Operations',
  'Document-heavy processing roles are exposed to OCR, KYC automation, rules engines, and AI-assisted exception handling.',
  true
),
(
  'quality-analyst-bpo',
  'Quality Analyst - BPO',
  'BPO / KPO / Shared Services',
  'Quality Assurance',
  'BPO quality analysis is highly exposed because AI can review call transcripts, score interactions, detect compliance issues, summarize defects, and monitor large samples continuously. Human QA remains valuable for coaching, exceptions, and process redesign.',
  true
),
(
  'team-leader-bpo',
  'Team Leader - BPO',
  'BPO / KPO / Shared Services',
  'Operations Leadership',
  'Operations leadership is relatively resilient because it owns people, output, safety, trade-offs, and accountability.',
  true
),
(
  'bank-relationship-manager',
  'Bank Relationship Manager',
  'BFSI (Banking, Financial Services, Insurance & Fintech)',
  'Sales & Relationship Management',
  'Relationship-heavy sales is more resilient because trust, negotiation, local networks, and regulated advice still matter.',
  true
),
(
  'credit-analyst',
  'Credit Analyst',
  'BFSI (Banking, Financial Services, Insurance & Fintech)',
  'Risk & Underwriting',
  'Risk and underwriting roles are exposed to scoring models and automated document checks, while judgment, exceptions, and compliance remain important.',
  true
),
(
  'branch-operations-manager',
  'Branch Operations Manager',
  'BFSI (Banking, Financial Services, Insurance & Fintech)',
  'Branch Operations',
  'Branch operations are partially exposed to digital banking and self-service, but customer escalation and local execution remain important.',
  true
),
(
  'loan-officer',
  'Loan Officer',
  'BFSI (Banking, Financial Services, Insurance & Fintech)',
  'Sales & Relationship Management',
  'Relationship-heavy sales is more resilient because trust, negotiation, local networks, and regulated advice still matter.',
  true
),
(
  'insurance-advisor',
  'Insurance Advisor',
  'BFSI (Banking, Financial Services, Insurance & Fintech)',
  'Sales & Relationship Management',
  'Relationship-heavy sales is more resilient because trust, negotiation, local networks, and regulated advice still matter.',
  true
),
(
  'wealth-manager',
  'Wealth Manager',
  'BFSI (Banking, Financial Services, Insurance & Fintech)',
  'Sales & Relationship Management',
  'Relationship-heavy sales is more resilient because trust, negotiation, local networks, and regulated advice still matter.',
  true
),
(
  'risk-analyst',
  'Risk Analyst',
  'BFSI (Banking, Financial Services, Insurance & Fintech)',
  'Risk & Underwriting',
  'Risk and underwriting roles are exposed to scoring models and automated document checks, while judgment, exceptions, and compliance remain important.',
  true
),
(
  'compliance-officer-bfsi',
  'Compliance Officer - BFSI',
  'BFSI (Banking, Financial Services, Insurance & Fintech)',
  'Compliance & Legal',
  'Compliance and governance roles are relatively resilient because regulation, accountability, escalation, and interpretation matter.',
  true
),
(
  'fintech-operations-analyst',
  'Fintech Operations Analyst',
  'BFSI (Banking, Financial Services, Insurance & Fintech)',
  'Operations',
  'Operational analyst roles are exposed where work is rule-based monitoring, queue management, and process reporting.',
  true
),
(
  'field-sales-executive',
  'Field Sales Executive',
  'Other / Miscellaneous',
  'Sales',
  'Sales roles are AI-augmented through CRM, lead scoring, and outreach automation, but relationships, negotiation, and field presence keep risk moderate.',
  true
),
(
  'inside-sales-representative',
  'Inside Sales Representative',
  'Other / Miscellaneous',
  'Sales',
  'Sales roles are AI-augmented through CRM, lead scoring, and outreach automation, but relationships, negotiation, and field presence keep risk moderate.',
  true
),
(
  'key-account-manager',
  'Key Account Manager',
  'Other / Miscellaneous',
  'Sales',
  'Sales roles are AI-augmented through CRM, lead scoring, and outreach automation, but relationships, negotiation, and field presence keep risk moderate.',
  true
),
(
  'area-sales-manager',
  'Area Sales Manager',
  'Other / Miscellaneous',
  'Sales Leadership',
  'Tech adoption is 7/10, remote feasibility is 4/10, growth outlook is 7/10, and automation risk is 4/10 based on task repeatability, physical presence, regulation, digitization, and India demand patterns.',
  true
),
(
  'digital-marketing-specialist',
  'Digital Marketing Specialist',
  'Other / Miscellaneous',
  'Marketing',
  'Marketing is increasingly AI-assisted for content, campaign variants, targeting, and analytics; strategic brand and growth judgment remain valuable.',
  true
),
(
  'performance-marketing-manager',
  'Performance Marketing Manager',
  'Other / Miscellaneous',
  'Marketing',
  'Marketing is increasingly AI-assisted for content, campaign variants, targeting, and analytics; strategic brand and growth judgment remain valuable.',
  true
),
(
  'brand-manager',
  'Brand Manager',
  'Other / Miscellaneous',
  'Marketing',
  'Marketing is increasingly AI-assisted for content, campaign variants, targeting, and analytics; strategic brand and growth judgment remain valuable.',
  true
),
(
  'market-research-analyst',
  'Market Research Analyst',
  'Other / Miscellaneous',
  'Marketing Analytics',
  'Marketing analytics is exposed to automated dashboards and insight generation, but experiment design and business interpretation remain resilient.',
  true
),
(
  'content-marketing-specialist',
  'Content Marketing Specialist',
  'Other / Miscellaneous',
  'Marketing',
  'Routine content work is highly exposed to generative AI drafting, rewriting, summarization, translation, and creative variants.',
  true
),
(
  'accountant',
  'Accountant',
  'BFSI (Banking, Financial Services, Insurance & Fintech)',
  'Accounting',
  'Accounting is exposed to bookkeeping, reconciliation, and report automation; advisory, controls, taxation, and interpretation are safer.',
  true
),
(
  'accounts-payable-executive',
  'Accounts Payable Executive',
  'BFSI (Banking, Financial Services, Insurance & Fintech)',
  'Accounting Operations',
  'AP/AR roles are exposed to invoice capture, reconciliation, reminders, payment workflows, and ERP automation.',
  true
),
(
  'accounts-receivable-executive',
  'Accounts Receivable Executive',
  'BFSI (Banking, Financial Services, Insurance & Fintech)',
  'Accounting Operations',
  'AP/AR roles are exposed to invoice capture, reconciliation, reminders, payment workflows, and ERP automation.',
  true
),
(
  'gst-executive',
  'GST Executive',
  'BFSI (Banking, Financial Services, Insurance & Fintech)',
  'Taxation',
  'Tech adoption is 7/10, remote feasibility is 6/10, growth outlook is 7/10, and automation risk is 4/10 based on task repeatability, physical presence, regulation, digitization, and India demand patterns.',
  true
),
(
  'financial-analyst',
  'Financial Analyst',
  'BFSI (Banking, Financial Services, Insurance & Fintech)',
  'FP&A',
  'FP&A is exposed to automated reporting and forecasting, but scenario judgment and business partnering remain valuable.',
  true
),
(
  'internal-auditor',
  'Internal Auditor',
  'BFSI (Banking, Financial Services, Insurance & Fintech)',
  'Audit & Controls',
  'Audit is AI-assisted through anomaly detection and sampling, while controls judgment, evidence quality, and accountability keep risk moderate.',
  true
),
(
  'chartered-accountant',
  'Chartered Accountant',
  'BFSI (Banking, Financial Services, Insurance & Fintech)',
  'Accounting',
  'Accounting is exposed to bookkeeping, reconciliation, and report automation; advisory, controls, taxation, and interpretation are safer.',
  true
),
(
  'payroll-executive',
  'Payroll Executive',
  'BFSI (Banking, Financial Services, Insurance & Fintech)',
  'Payroll',
  'Payroll processing is exposed to HRMS automation, rule-based checks, self-service portals, and exception-based workflows.',
  true
),
(
  'hr-recruiter',
  'HR Recruiter',
  'Other / Miscellaneous',
  'Human Resources',
  'HR is exposed to screening, scheduling, and employee self-service automation, while people judgment and organizational context remain important.',
  true
),
(
  'hr-business-partner',
  'HR Business Partner',
  'Other / Miscellaneous',
  'Human Resources',
  'HR is exposed to screening, scheduling, and employee self-service automation, while people judgment and organizational context remain important.',
  true
),
(
  'learning-and-development-specialist',
  'Learning and Development Specialist',
  'Other / Miscellaneous',
  'Human Resources',
  'HR is exposed to screening, scheduling, and employee self-service automation, while people judgment and organizational context remain important.',
  true
),
(
  'office-administrator',
  'Office Administrator',
  'Other / Miscellaneous',
  'Administration',
  'Administrative coordination is exposed to scheduling, document, email, meeting-summary, and workflow automation.',
  true
),
(
  'executive-assistant',
  'Executive Assistant',
  'Other / Miscellaneous',
  'Administration',
  'Administrative coordination is exposed to scheduling, document, email, meeting-summary, and workflow automation.',
  true
),
(
  'legal-associate',
  'Legal Associate',
  'Other / Miscellaneous',
  'Legal',
  'Legal work is exposed to drafting and research automation, but interpretation, negotiation, risk ownership, and jurisdictional judgment remain resilient.',
  true
),
(
  'company-secretary',
  'Company Secretary',
  'Other / Miscellaneous',
  'Compliance & Legal',
  'Compliance and governance roles are relatively resilient because regulation, accountability, escalation, and interpretation matter.',
  true
),
(
  'cnc-machine-operator',
  'CNC Machine Operator',
  'Manufacturing & Engineering',
  'Production Operations',
  'Production operations benefit from manufacturing growth but face medium automation exposure from robotics, sensors, and process automation.',
  true
),
(
  'production-supervisor',
  'Production Supervisor',
  'Manufacturing & Engineering',
  'Production Operations',
  'Production operations benefit from manufacturing growth but face medium automation exposure from robotics, sensors, and process automation.',
  true
),
(
  'maintenance-engineer',
  'Maintenance Engineer',
  'Manufacturing & Engineering',
  'Plant Engineering',
  'Plant engineering is protected by physical assets, reliability responsibility, and site-specific troubleshooting; AI mainly augments maintenance planning.',
  true
),
(
  'quality-control-inspector',
  'Quality Control Inspector',
  'Manufacturing & Engineering',
  'Quality Assurance',
  'Tech adoption is 6/10, remote feasibility is 1/10, growth outlook is 7/10, and automation risk is 3/10 based on task repeatability, physical presence, regulation, digitization, and India demand patterns.',
  true
),
(
  'process-engineer',
  'Process Engineer',
  'Manufacturing & Engineering',
  'Industrial Engineering',
  'Industrial engineering is AI-augmented for simulation, optimization, and process analytics, but plant context and implementation remain human-led.',
  true
),
(
  'plant-manager',
  'Plant Manager',
  'Manufacturing & Engineering',
  'Operations Leadership',
  'Operations leadership is relatively resilient because it owns people, output, safety, trade-offs, and accountability.',
  true
),
(
  'tool-and-die-maker',
  'Tool and Die Maker',
  'Manufacturing & Engineering',
  'Skilled Trades',
  'Skilled trades are relatively protected because work is physical, site-specific, and judgment-heavy; AI mainly assists planning and diagnostics.',
  true
),
(
  'welder-fabricator',
  'Welder / Fabricator',
  'Manufacturing & Engineering',
  'Skilled Trades',
  'Physical skilled work is comparatively protected; AI mostly improves diagnostics, planning, training, and scheduling.',
  true
),
(
  'assembly-line-worker',
  'Assembly Line Worker',
  'Manufacturing & Engineering',
  'Production Operations',
  'Production operations benefit from manufacturing growth but face medium automation exposure from robotics, sensors, and process automation.',
  true
),
(
  'automobile-service-technician',
  'Automobile Service Technician',
  'Manufacturing & Engineering',
  'Field Service',
  'Physical skilled work is comparatively protected; AI mostly improves diagnostics, planning, training, and scheduling.',
  true
),
(
  'ev-battery-technician',
  'EV Battery Technician',
  'Manufacturing & Engineering',
  'Field Service',
  'Physical skilled work is comparatively protected; AI mostly improves diagnostics, planning, training, and scheduling.',
  true
),
(
  'automotive-design-engineer',
  'Automotive Design Engineer',
  'Manufacturing & Engineering',
  'Engineering',
  'Tech adoption is 8/10, remote feasibility is 4/10, growth outlook is 8/10, and automation risk is 4/10 based on task repeatability, physical presence, regulation, digitization, and India demand patterns.',
  true
),
(
  'ev-charging-station-technician',
  'EV Charging Station Technician',
  'Manufacturing & Engineering',
  'Field Service',
  'Physical skilled work is comparatively protected; AI mostly improves diagnostics, planning, training, and scheduling.',
  true
),
(
  'vehicle-sales-consultant',
  'Vehicle Sales Consultant',
  'Manufacturing & Engineering',
  'Sales',
  'Sales roles are AI-augmented through CRM, lead scoring, and outreach automation, but relationships, negotiation, and field presence keep risk moderate.',
  true
),
(
  'auto-parts-supply-planner',
  'Auto Parts Supply Planner',
  'Manufacturing & Engineering',
  'Supply Chain Planning',
  'Supply-chain planning is AI-assisted through forecasting and optimization, but exceptions, suppliers, and execution trade-offs keep risk medium.',
  true
),
(
  'civil-site-engineer',
  'Civil Site Engineer',
  'Construction & Infrastructure',
  'Site Engineering',
  'Site engineering is protected by physical delivery, safety, contractors, and local execution; AI mainly assists drawings, planning, and reporting.',
  true
),
(
  'quantity-surveyor',
  'Quantity Surveyor',
  'Construction & Infrastructure',
  'Commercial & Contracts',
  'Tech adoption is 6/10, remote feasibility is 1/10, growth outlook is 8/10, and automation risk is 3/10 based on task repeatability, physical presence, regulation, digitization, and India demand patterns.',
  true
),
(
  'project-planner',
  'Project Planner',
  'Construction & Infrastructure',
  'Project / Program Management',
  'Project/program management is AI-assisted for plans, summaries, and reporting, but stakeholder trade-offs and accountability remain resilient.',
  true
),
(
  'safety-officer',
  'Safety Officer',
  'Construction & Infrastructure',
  'Safety & Compliance',
  'Safety roles are relatively resilient because they require site presence, accountability, observation, and regulatory responsibility.',
  true
),
(
  'electrician',
  'Electrician',
  'Construction & Infrastructure',
  'Skilled Trades',
  'Physical skilled work is comparatively protected; AI mostly improves diagnostics, planning, training, and scheduling.',
  true
),
(
  'plumber',
  'Plumber',
  'Construction & Infrastructure',
  'Skilled Trades',
  'Physical skilled work is comparatively protected; AI mostly improves diagnostics, planning, training, and scheduling.',
  true
),
(
  'surveyor',
  'Surveyor',
  'Construction & Infrastructure',
  'Site Engineering',
  'Site engineering is protected by physical delivery, safety, contractors, and local execution; AI mainly assists drawings, planning, and reporting.',
  true
),
(
  'construction-project-manager',
  'Construction Project Manager',
  'Construction & Infrastructure',
  'Project / Program Management',
  'Project/program management is AI-assisted for plans, summaries, and reporting, but stakeholder trade-offs and accountability remain resilient.',
  true
),
(
  'staff-nurse',
  'Staff Nurse',
  'Healthcare & Pharma',
  'Clinical Care',
  'Clinical roles are AI-augmented but protected by care delivery, accountability, empathy, and regulated professional judgment.',
  true
),
(
  'doctor-medical-officer',
  'Doctor / Medical Officer',
  'Healthcare & Pharma',
  'Clinical Care',
  'Clinical roles are AI-augmented but protected by care delivery, accountability, empathy, and regulated professional judgment.',
  true
),
(
  'pharmacist',
  'Pharmacist',
  'Healthcare & Pharma',
  'Pharmacy',
  'Pharmacy is partially exposed through e-pharmacy and dispensing systems, but licensed judgment and patient interaction keep risk moderate.',
  true
),
(
  'medical-lab-technician',
  'Medical Lab Technician',
  'Healthcare & Pharma',
  'Diagnostics',
  'Physical skilled work is comparatively protected; AI mostly improves diagnostics, planning, training, and scheduling.',
  true
),
(
  'radiology-technician',
  'Radiology Technician',
  'Healthcare & Pharma',
  'Diagnostics',
  'Physical skilled work is comparatively protected; AI mostly improves diagnostics, planning, training, and scheduling.',
  true
),
(
  'hospital-administrator',
  'Hospital Administrator',
  'Healthcare & Pharma',
  'Healthcare Operations',
  'Healthcare operations are AI-assisted through scheduling, billing, and bed/capacity management, but local execution and accountability remain important.',
  true
),
(
  'medical-sales-representative',
  'Medical Sales Representative',
  'Healthcare & Pharma',
  'Sales',
  'Sales roles are AI-augmented through CRM, lead scoring, and outreach automation, but relationships, negotiation, and field presence keep risk moderate.',
  true
),
(
  'clinical-research-associate',
  'Clinical Research Associate',
  'Healthcare & Pharma',
  'Clinical Research',
  'Clinical research is AI-augmented for monitoring and document review, but protocol execution, site engagement, and compliance keep risk lower.',
  true
),
(
  'pharma-production-chemist',
  'Pharma Production Chemist',
  'Healthcare & Pharma',
  'Pharma Manufacturing',
  'Pharma manufacturing uses automation, but regulated production, validation, and quality processes keep the role resilient.',
  true
),
(
  'school-teacher',
  'School Teacher',
  'Education & Training',
  'Teaching',
  'Teaching is augmented by AI tutors and content generation, but human mentoring, trust, and classroom context keep risk moderate.',
  true
),
(
  'pre-primary-teacher',
  'Pre-primary Teacher',
  'Education & Training',
  'Teaching',
  'Teaching is augmented by AI tutors and content generation, but human mentoring, trust, and classroom context keep risk moderate.',
  true
),
(
  'college-lecturer',
  'College Lecturer',
  'Education & Training',
  'Teaching',
  'Teaching is augmented by AI tutors and content generation, but human mentoring, trust, and classroom context keep risk moderate.',
  true
),
(
  'tutor-coaching-faculty',
  'Tutor / Coaching Faculty',
  'Education & Training',
  'Teaching',
  'Teaching is augmented by AI tutors and content generation, but human mentoring, trust, and classroom context keep risk moderate.',
  true
),
(
  'edtech-content-developer',
  'EdTech Content Developer',
  'Education & Training',
  'Content & Curriculum',
  'Content and curriculum work is exposed to generative AI drafting, quiz creation, summarization, and localization; higher-value instructional design is safer.',
  true
),
(
  'instructional-designer',
  'Instructional Designer',
  'Education & Training',
  'Content & Curriculum',
  'Content and curriculum work is exposed to generative AI drafting, quiz creation, summarization, and localization; higher-value instructional design is safer.',
  true
),
(
  'academic-counsellor',
  'Academic Counsellor',
  'Education & Training',
  'Student Services',
  'Tech adoption is 5/10, remote feasibility is 3/10, growth outlook is 6/10, and automation risk is 4/10 based on task repeatability, physical presence, regulation, digitization, and India demand patterns.',
  true
),
(
  'training-coordinator',
  'Training Coordinator',
  'Education & Training',
  'Training Operations',
  'Tech adoption is 5/10, remote feasibility is 3/10, growth outlook is 6/10, and automation risk is 4/10 based on task repeatability, physical presence, regulation, digitization, and India demand patterns.',
  true
),
(
  'retail-store-manager',
  'Retail Store Manager',
  'Retail & E-commerce',
  'Store Operations',
  'Store operations still need people on-site, but billing, inventory, rostering, and customer-service tasks are increasingly automated.',
  true
),
(
  'sales-associate-retail',
  'Sales Associate - Retail',
  'Retail & E-commerce',
  'Store Operations',
  'Store operations still need people on-site, but billing, inventory, rostering, and customer-service tasks are increasingly automated.',
  true
),
(
  'cashier',
  'Cashier',
  'Retail & E-commerce',
  'Store Operations',
  'Cashier work is exposed to self-checkout, UPI/digital payments, POS automation, and automated reconciliation.',
  true
),
(
  'category-manager-e-commerce',
  'Category Manager - E-commerce',
  'Retail & E-commerce',
  'Category Management',
  'Category management is AI-assisted through pricing, assortment, and demand analytics, but commercial judgment and vendor decisions remain important.',
  true
),
(
  'merchandiser',
  'Merchandiser',
  'Retail & E-commerce',
  'Merchandising',
  'Merchandising is AI-assisted through planning and trend analytics, while vendor, store, and market judgment remain useful.',
  true
),
(
  'inventory-executive',
  'Inventory Executive',
  'Retail & E-commerce',
  'Inventory Operations',
  'Inventory operations are exposed to demand forecasting, automated replenishment, scanning, and warehouse-management systems.',
  true
),
(
  'customer-experience-manager',
  'Customer Experience Manager',
  'Retail & E-commerce',
  'Customer Operations',
  'Customer experience management is AI-assisted through feedback mining, journey analytics, chatbots, and support automation, but cross-functional improvement, escalation design, and customer empathy keep it in the transition zone rather than a pure replacement-risk role.',
  true
),
(
  'marketplace-operations-executive',
  'Marketplace Operations Executive',
  'Retail & E-commerce',
  'E-commerce Operations',
  'Marketplace operations are exposed to listing automation, catalog enrichment, repricing, reporting, and workflow bots.',
  true
),
(
  'warehouse-associate',
  'Warehouse Associate',
  'Logistics & Supply Chain',
  'Warehouse Operations',
  'Warehouse jobs benefit from ecommerce growth but face medium automation exposure from scanning, routing, robotics, and warehouse-management systems.',
  true
),
(
  'warehouse-manager',
  'Warehouse Manager',
  'Logistics & Supply Chain',
  'Warehouse Operations',
  'Warehouse jobs benefit from ecommerce growth but face medium automation exposure from scanning, routing, robotics, and warehouse-management systems.',
  true
),
(
  'supply-chain-analyst',
  'Supply Chain Analyst',
  'Logistics & Supply Chain',
  'Supply Chain Planning',
  'Supply-chain planning is AI-assisted through forecasting and optimization, but exceptions, suppliers, and execution trade-offs keep risk medium.',
  true
),
(
  'procurement-executive',
  'Procurement Executive',
  'Logistics & Supply Chain',
  'Procurement',
  'Procurement is exposed to sourcing tools and spend analytics, while negotiation, supplier risk, and judgment remain important.',
  true
),
(
  'logistics-coordinator',
  'Logistics Coordinator',
  'Logistics & Supply Chain',
  'Logistics Operations',
  'Logistics operations are AI-augmented through routing, tracking, and exception alerts, while local coordination remains important.',
  true
),
(
  'fleet-manager',
  'Fleet Manager',
  'Logistics & Supply Chain',
  'Fleet Operations',
  'Fleet operations use telematics and optimization, but people, assets, compliance, and on-ground exceptions keep risk moderate.',
  true
),
(
  'last-mile-delivery-supervisor',
  'Last-mile Delivery Supervisor',
  'Logistics & Supply Chain',
  'Delivery Operations',
  'Delivery roles are still growing in India, but platform optimization, routing automation, and eventual autonomous delivery create medium exposure.',
  true
),
(
  'import-export-executive',
  'Import Export Executive',
  'Logistics & Supply Chain',
  'Trade Operations',
  'Trade operations are exposed to documentation automation but retain compliance, exception handling, and coordination work.',
  true
),
(
  'agriculture-extension-officer',
  'Agriculture Extension Officer',
  'Agriculture & Allied Activities',
  'Field Advisory',
  'Field advisory is AI-augmented by crop intelligence and decision support, but local trust and farmer engagement remain important.',
  true
),
(
  'farm-supervisor',
  'Farm Supervisor',
  'Agriculture & Allied Activities',
  'Farm Operations',
  'Farm operations are physical and local, so AI mostly augments planning, monitoring, and advisory rather than replacing the role.',
  true
),
(
  'dairy-farm-manager',
  'Dairy Farm Manager',
  'Agriculture & Allied Activities',
  'Dairy Operations',
  'Dairy operations are protected by physical care, local operations, and quality control, with AI mainly supporting monitoring and logistics.',
  true
),
(
  'fisheries-technician',
  'Fisheries Technician',
  'Agriculture & Allied Activities',
  'Allied Activities',
  'Physical skilled work is comparatively protected; AI mostly improves diagnostics, planning, training, and scheduling.',
  true
),
(
  'food-processing-operator',
  'Food Processing Operator',
  'Agriculture & Allied Activities',
  'Production Operations',
  'Production operations benefit from manufacturing growth but face medium automation exposure from robotics, sensors, and process automation.',
  true
),
(
  'agri-input-sales-executive',
  'Agri Input Sales Executive',
  'Agriculture & Allied Activities',
  'Sales',
  'Sales roles are AI-augmented through CRM, lead scoring, and outreach automation, but relationships, negotiation, and field presence keep risk moderate.',
  true
),
(
  'agri-supply-chain-coordinator',
  'Agri Supply Chain Coordinator',
  'Agriculture & Allied Activities',
  'Supply Chain Planning',
  'Supply-chain planning is AI-assisted through forecasting and optimization, but exceptions, suppliers, and execution trade-offs keep risk medium.',
  true
),
(
  'government-clerk',
  'Government Clerk',
  'Govt & Public Administration',
  'Administration',
  'Administrative coordination is exposed to scheduling, document, email, meeting-summary, and workflow automation.',
  true
),
(
  'public-sector-bank-officer',
  'Public Sector Bank Officer',
  'Govt & Public Administration',
  'Branch Operations',
  'Branch operations are partially exposed to digital banking and self-service, but customer escalation and local execution remain important.',
  true
),
(
  'police-constable',
  'Police Constable',
  'Govt & Public Administration',
  'Public Safety',
  'Public-safety roles have low automation risk because physical presence, authority, and public trust are core to the job.',
  true
),
(
  'municipal-engineer',
  'Municipal Engineer',
  'Govt & Public Administration',
  'Public Works',
  'Public-works engineering is protected by local infrastructure delivery, approvals, and site accountability.',
  true
),
(
  'data-entry-operator-government',
  'Data Entry Operator - Government',
  'Govt & Public Administration',
  'Administration',
  'Data-entry work is among the most exposed because OCR, forms, workflow bots, and validation models can automate much of the task flow.',
  true
),
(
  'program-officer-ngo-development',
  'Program Officer - NGO / Development',
  'Govt & Public Administration',
  'Program Management',
  'Program roles are AI-assisted for reporting and coordination but remain dependent on field context, stakeholders, and delivery ownership.',
  true
),
(
  'delivery-partner',
  'Delivery Partner',
  'Gig & Platform Work',
  'Delivery Operations',
  'Delivery roles are still growing in India, but platform optimization, routing automation, and eventual autonomous delivery create medium exposure.',
  true
),
(
  'ride-hailing-driver',
  'Ride-hailing Driver',
  'Gig & Platform Work',
  'Mobility Operations',
  'Ride-hailing remains demand-led in India, but platform automation, EV transition, and future autonomy create medium disruption risk.',
  true
),
(
  'quick-commerce-picker',
  'Quick Commerce Picker',
  'Gig & Platform Work',
  'Warehouse Operations',
  'Warehouse jobs benefit from ecommerce growth but face medium automation exposure from scanning, routing, robotics, and warehouse-management systems.',
  true
),
(
  'home-service-technician',
  'Home Service Technician',
  'Gig & Platform Work',
  'Field Service',
  'Physical skilled work is comparatively protected; AI mostly improves diagnostics, planning, training, and scheduling.',
  true
),
(
  'freelance-graphic-designer',
  'Freelance Graphic Designer',
  'Gig & Platform Work',
  'Design',
  'Graphic design is exposed to generative image tools and automated layout variants; brand judgment and art direction are safer.',
  true
),
(
  'freelance-content-writer',
  'Freelance Content Writer',
  'Gig & Platform Work',
  'Content & Curriculum',
  'Routine content work is highly exposed to generative AI drafting, rewriting, summarization, translation, and creative variants.',
  true
),
(
  'hotel-front-office-executive',
  'Hotel Front Office Executive',
  'Hospitality & Tourism',
  'Guest Services',
  'Guest services use kiosks and chatbots, but hospitality still depends on human service, escalation, and experience quality.',
  true
),
(
  'chef-commis-chef',
  'Chef / Commis Chef',
  'Hospitality & Tourism',
  'Food Production',
  'Physical skilled work is comparatively protected; AI mostly improves diagnostics, planning, training, and scheduling.',
  true
),
(
  'housekeeping-supervisor',
  'Housekeeping Supervisor',
  'Hospitality & Tourism',
  'Housekeeping',
  'Housekeeping is physical and location-bound, so AI mainly affects scheduling, checklists, and inspection workflows.',
  true
),
(
  'restaurant-manager',
  'Restaurant Manager',
  'Hospitality & Tourism',
  'Food & Beverage Operations',
  'Food and beverage operations are AI-assisted in demand planning and rostering, but service and operations leadership remain human-led.',
  true
),
(
  'travel-consultant',
  'Travel Consultant',
  'Hospitality & Tourism',
  'Travel Operations',
  'Travel consulting is exposed to online booking, itinerary generation, and travel chatbots; complex/premium travel advisory is safer.',
  true
),
(
  'tour-guide',
  'Tour Guide',
  'Hospitality & Tourism',
  'Travel Operations',
  'Tour guides use digital itinerary and translation tools, but local presence, group management, storytelling, safety, and live adaptation protect much of the role. Risk is moderate rather than high.',
  true
),
(
  'cabin-crew',
  'Cabin Crew',
  'Hospitality & Tourism',
  'Guest Services',
  'Guest services use kiosks and chatbots, but hospitality still depends on human service, escalation, and experience quality.',
  true
),
(
  'video-editor',
  'Video Editor',
  'Media & Entertainment',
  'Creative Production',
  'Video and animation work is exposed to AI editing, generation, cleanup, and templating tools; storytelling and direction remain differentiators.',
  true
),
(
  'graphic-designer',
  'Graphic Designer',
  'Media & Entertainment',
  'Design',
  'Graphic design is exposed to generative image tools and automated layout variants; brand judgment and art direction are safer.',
  true
),
(
  'journalist-reporter',
  'Journalist / Reporter',
  'Media & Entertainment',
  'Editorial',
  'Editorial work is exposed to AI drafting and summarization, while original reporting, source judgment, and credibility remain human differentiators.',
  true
),
(
  'social-media-manager',
  'Social Media Manager',
  'Media & Entertainment',
  'Marketing',
  'Marketing is increasingly AI-assisted for content, campaign variants, targeting, and analytics; strategic brand and growth judgment remain valuable.',
  true
),
(
  'content-creator',
  'Content Creator',
  'Media & Entertainment',
  'Creative Production',
  'Routine content work is highly exposed to generative AI drafting, rewriting, summarization, translation, and creative variants.',
  true
),
(
  'animation-artist',
  'Animation Artist',
  'Media & Entertainment',
  'Creative Production',
  'Video and animation work is exposed to AI editing, generation, cleanup, and templating tools; storytelling and direction remain differentiators.',
  true
),
(
  'ad-operations-executive',
  'Ad Operations Executive',
  'Media & Entertainment',
  'Marketing Operations',
  'Marketing operations is exposed to campaign automation, ad-platform AI, tagging, trafficking, and reporting automation.',
  true
),
(
  'solar-pv-technician',
  'Solar PV Technician',
  'Other / Miscellaneous',
  'Field Service',
  'Physical skilled work is comparatively protected; AI mostly improves diagnostics, planning, training, and scheduling.',
  true
),
(
  'electrical-engineer-utilities',
  'Electrical Engineer - Utilities',
  'Other / Miscellaneous',
  'Engineering',
  'Tech adoption is 8/10, remote feasibility is 3/10, growth outlook is 8/10, and automation risk is 4/10 based on task repeatability, physical presence, regulation, digitization, and India demand patterns.',
  true
),
(
  'telecom-tower-technician',
  'Telecom Tower Technician',
  'Other / Miscellaneous',
  'Field Service',
  'Physical skilled work is comparatively protected; AI mostly improves diagnostics, planning, training, and scheduling.',
  true
),
(
  'network-operations-center-engineer',
  'Network Operations Center Engineer',
  'Other / Miscellaneous',
  'Infrastructure & Cloud',
  'NOC roles are exposed where the work is alert monitoring, runbook execution, and routine incident triage because AIOps tools can correlate alerts and suggest remediation. More resilient roles move toward SRE, network automation, security operations, and complex incident ownership.',
  true
),
(
  'field-service-engineer',
  'Field Service Engineer',
  'Other / Miscellaneous',
  'Field Service',
  'Field-service work is protected by physical presence and troubleshooting, while AI mainly augments diagnostics, scheduling, and knowledge lookup.',
  true
),
(
  'renewable-energy-project-manager',
  'Renewable Energy Project Manager',
  'Other / Miscellaneous',
  'Project / Program Management',
  'Project/program management is AI-assisted for plans, summaries, and reporting, but stakeholder trade-offs and accountability remain resilient.',
  true
),
(
  'smart-meter-installation-technician',
  'Smart Meter Installation Technician',
  'Other / Miscellaneous',
  'Field Service',
  'Physical skilled work is comparatively protected; AI mostly improves diagnostics, planning, training, and scheduling.',
  true
)
on conflict (slug) do update set
  title = excluded.title,
  sector = excluded.sector,
  occupation_family = excluded.occupation_family,
  description = excluded.description,
  is_published = excluded.is_published,
  updated_at = now();

with score_input (slug, ai_exposure, layoff_pressure, demand_outlook, remote_feasibility, confidence, rationale) as (
  values
(
  'software-developer',
  60,
  50,
  74,
  90,
  0.72,
  'Software development remains a growing India role because every sector is digitizing, but AI coding assistants now automate boilerplate, refactoring, unit-test creation, and first-draft code. This is strong augmentation with medium disruption, especially for junior or repetitive implementation work.'
),
(
  'frontend-developer',
  70,
  60,
  69,
  90,
  0.72,
  'Frontend work is exposed because AI tools can generate UI scaffolds, components, tests, and copy quickly. Demand remains meaningful in India, but routine page-building is under higher pressure than architecture, product-quality, accessibility, and design-system work.'
),
(
  'backend-developer',
  60,
  50,
  74,
  90,
  0.72,
  'Backend demand remains resilient where engineers own APIs, data models, reliability, security, and domain logic. AI raises productivity on boilerplate, tests, and refactoring, so this is medium disruption rather than no impact.'
),
(
  'mobile-app-developer',
  60,
  50,
  69,
  90,
  0.72,
  'Mobile app demand continues across fintech, commerce, health, and consumer apps, but AI-assisted app builders and code assistants reduce effort for routine screens, integration snippets, and test cases. Stronger engineers move toward product architecture and AI-enabled mobile experiences.'
),
(
  'qa-engineer-software-tester',
  90,
  70,
  46,
  70,
  0.72,
  'Manual and repetitive software testing is highly exposed in India because AI and automation can generate test cases, run regression checks, create synthetic data, inspect logs, and summarize defects. Demand is shifting away from pure manual QA toward SDET, automation, API testing, AI evaluation, and product quality analytics.'
),
(
  'sdet-test-automation-engineer',
  50,
  40,
  69,
  90,
  0.72,
  'SDET and test automation roles are safer than manual QA because they build the automation layer: CI/CD test suites, API checks, performance tests, observability, and AI-assisted quality gates. AI changes the tooling but can expand impact for engineers who own automation strategy.'
),
(
  'ai-qa-engineer-model-evaluation-tester',
  40,
  40,
  74,
  90,
  0.72,
  'AI QA and model evaluation roles are an emerging safer move for testers: they evaluate prompts, model outputs, hallucination risk, safety, regression behavior, and human acceptance criteria. Demand is concentrated in AI product teams, GCCs, SaaS, fintech, and platform companies in Bengaluru, Hyderabad, Pune, Chennai, Delhi NCR, and Mumbai.'
),
(
  'product-manager',
  40,
  30,
  69,
  90,
  0.72,
  'Tech adoption is 10/10, remote feasibility is 9/10, growth outlook is 8/10, and automation risk is 4/10 based on task repeatability, physical presence, regulation, digitization, and India demand patterns.'
),
(
  'associate-product-manager',
  40,
  40,
  73,
  80,
  0.72,
  'Tech adoption is 10/10, remote feasibility is 8/10, growth outlook is 8/10, and automation risk is 4/10 based on task repeatability, physical presence, regulation, digitization, and India demand patterns.'
),
(
  'project-manager-it',
  40,
  40,
  67,
  80,
  0.72,
  'Project/program management is AI-assisted for plans, summaries, and reporting, but stakeholder trade-offs and accountability remain resilient.'
),
(
  'scrum-master',
  70,
  60,
  56,
  80,
  0.72,
  'Standalone Scrum Master work is exposed where it is mainly ceremony coordination, note-taking, status reporting, and ticket hygiene. The safer path is toward delivery leadership, product operations, engineering program management, or AI-enabled workflow improvement.'
),
(
  'engineering-manager-lead-engineer',
  40,
  30,
  69,
  90,
  0.72,
  'Tech adoption is 10/10, remote feasibility is 9/10, growth outlook is 8/10, and automation risk is 4/10 based on task repeatability, physical presence, regulation, digitization, and India demand patterns.'
),
(
  'devops-engineer-site-reliability-engineer',
  40,
  30,
  72,
  90,
  0.72,
  'Tech adoption is 10/10, remote feasibility is 9/10, growth outlook is 8/10, and automation risk is 4/10 based on task repeatability, physical presence, regulation, digitization, and India demand patterns.'
),
(
  'cloud-solutions-architect',
  40,
  30,
  72,
  90,
  0.72,
  'Tech adoption is 10/10, remote feasibility is 9/10, growth outlook is 8/10, and automation risk is 4/10 based on task repeatability, physical presence, regulation, digitization, and India demand patterns.'
),
(
  'data-analyst',
  70,
  60,
  65,
  90,
  0.72,
  'Routine data analyst work is exposed because AI tools can now draft SQL, generate dashboards, summarize trends, and automate recurring reports. The safer path is toward analytics engineering, product analytics, experiment design, data quality, and decision support tied closely to business context.'
),
(
  'data-engineer',
  40,
  30,
  72,
  90,
  0.72,
  'Tech adoption is 10/10, remote feasibility is 9/10, growth outlook is 8/10, and automation risk is 4/10 based on task repeatability, physical presence, regulation, digitization, and India demand patterns.'
),
(
  'machine-learning-engineer',
  40,
  30,
  76,
  90,
  0.72,
  'Tech adoption is 10/10, remote feasibility is 9/10, growth outlook is 8/10, and automation risk is 4/10 based on task repeatability, physical presence, regulation, digitization, and India demand patterns.'
),
(
  'cybersecurity-analyst',
  40,
  40,
  79,
  90,
  0.72,
  'Tech adoption is 10/10, remote feasibility is 9/10, growth outlook is 8/10, and automation risk is 4/10 based on task repeatability, physical presence, regulation, digitization, and India demand patterns.'
),
(
  'ui-ux-designer',
  70,
  60,
  56,
  80,
  0.72,
  'Design roles are exposed to generative design tools for first drafts and variants; research, systems thinking, and product context are safer.'
),
(
  'business-analyst-it',
  70,
  60,
  61,
  80,
  0.72,
  'IT business analysis is under pressure where the work is mostly meeting notes, basic documentation, dashboards, and ticket writing. BAs with domain depth, data fluency, process design, and AI workflow skills remain more resilient.'
),
(
  'technical-support-engineer',
  80,
  70,
  56,
  80,
  0.72,
  'Tier-1 technical support is exposed to chatbots, retrieval assistants, and automated troubleshooting. More resilient support roles move toward L2/L3 debugging, customer engineering, integrations, observability, and support automation ownership.'
),
(
  'customer-support-executive',
  80,
  70,
  60,
  50,
  0.72,
  'Tier-1 support and voice processes are exposed to chatbots, voice bots, knowledge-base retrieval, and automated ticket resolution.'
),
(
  'voice-process-associate',
  80,
  70,
  60,
  50,
  0.72,
  'Tier-1 support and voice processes are exposed to chatbots, voice bots, knowledge-base retrieval, and automated ticket resolution.'
),
(
  'non-voice-process-associate',
  80,
  70,
  53,
  50,
  0.72,
  'Document-heavy processing roles are exposed to OCR, KYC automation, rules engines, and AI-assisted exception handling.'
),
(
  'kyc-operations-analyst',
  80,
  70,
  53,
  50,
  0.72,
  'Document-heavy processing roles are exposed to OCR, KYC automation, rules engines, and AI-assisted exception handling.'
),
(
  'claims-processing-associate',
  80,
  70,
  53,
  50,
  0.72,
  'Document-heavy processing roles are exposed to OCR, KYC automation, rules engines, and AI-assisted exception handling.'
),
(
  'quality-analyst-bpo',
  80,
  70,
  51,
  50,
  0.72,
  'BPO quality analysis is highly exposed because AI can review call transcripts, score interactions, detect compliance issues, summarize defects, and monitor large samples continuously. Human QA remains valuable for coaching, exceptions, and process redesign.'
),
(
  'team-leader-bpo',
  30,
  30,
  67,
  50,
  0.72,
  'Operations leadership is relatively resilient because it owns people, output, safety, trade-offs, and accountability.'
),
(
  'bank-relationship-manager',
  40,
  40,
  77,
  50,
  0.72,
  'Relationship-heavy sales is more resilient because trust, negotiation, local networks, and regulated advice still matter.'
),
(
  'credit-analyst',
  60,
  50,
  61,
  50,
  0.72,
  'Risk and underwriting roles are exposed to scoring models and automated document checks, while judgment, exceptions, and compliance remain important.'
),
(
  'branch-operations-manager',
  50,
  50,
  61,
  50,
  0.72,
  'Branch operations are partially exposed to digital banking and self-service, but customer escalation and local execution remain important.'
),
(
  'loan-officer',
  40,
  50,
  79,
  50,
  0.72,
  'Relationship-heavy sales is more resilient because trust, negotiation, local networks, and regulated advice still matter.'
),
(
  'insurance-advisor',
  40,
  50,
  79,
  50,
  0.72,
  'Relationship-heavy sales is more resilient because trust, negotiation, local networks, and regulated advice still matter.'
),
(
  'wealth-manager',
  40,
  40,
  74,
  60,
  0.72,
  'Relationship-heavy sales is more resilient because trust, negotiation, local networks, and regulated advice still matter.'
),
(
  'risk-analyst',
  60,
  50,
  61,
  50,
  0.72,
  'Risk and underwriting roles are exposed to scoring models and automated document checks, while judgment, exceptions, and compliance remain important.'
),
(
  'compliance-officer-bfsi',
  40,
  40,
  59,
  60,
  0.72,
  'Compliance and governance roles are relatively resilient because regulation, accountability, escalation, and interpretation matter.'
),
(
  'fintech-operations-analyst',
  70,
  60,
  56,
  50,
  0.72,
  'Operational analyst roles are exposed where work is rule-based monitoring, queue management, and process reporting.'
),
(
  'field-sales-executive',
  40,
  50,
  79,
  40,
  0.72,
  'Sales roles are AI-augmented through CRM, lead scoring, and outreach automation, but relationships, negotiation, and field presence keep risk moderate.'
),
(
  'inside-sales-representative',
  40,
  50,
  79,
  40,
  0.72,
  'Sales roles are AI-augmented through CRM, lead scoring, and outreach automation, but relationships, negotiation, and field presence keep risk moderate.'
),
(
  'key-account-manager',
  40,
  40,
  77,
  40,
  0.72,
  'Sales roles are AI-augmented through CRM, lead scoring, and outreach automation, but relationships, negotiation, and field presence keep risk moderate.'
),
(
  'area-sales-manager',
  40,
  40,
  67,
  40,
  0.72,
  'Tech adoption is 7/10, remote feasibility is 4/10, growth outlook is 7/10, and automation risk is 4/10 based on task repeatability, physical presence, regulation, digitization, and India demand patterns.'
),
(
  'digital-marketing-specialist',
  60,
  50,
  61,
  40,
  0.72,
  'Marketing is increasingly AI-assisted for content, campaign variants, targeting, and analytics; strategic brand and growth judgment remain valuable.'
),
(
  'performance-marketing-manager',
  60,
  50,
  59,
  50,
  0.72,
  'Marketing is increasingly AI-assisted for content, campaign variants, targeting, and analytics; strategic brand and growth judgment remain valuable.'
),
(
  'brand-manager',
  60,
  50,
  61,
  40,
  0.72,
  'Marketing is increasingly AI-assisted for content, campaign variants, targeting, and analytics; strategic brand and growth judgment remain valuable.'
),
(
  'market-research-analyst',
  60,
  50,
  61,
  40,
  0.72,
  'Marketing analytics is exposed to automated dashboards and insight generation, but experiment design and business interpretation remain resilient.'
),
(
  'content-marketing-specialist',
  80,
  70,
  51,
  40,
  0.72,
  'Routine content work is highly exposed to generative AI drafting, rewriting, summarization, translation, and creative variants.'
),
(
  'accountant',
  60,
  60,
  56,
  60,
  0.72,
  'Accounting is exposed to bookkeeping, reconciliation, and report automation; advisory, controls, taxation, and interpretation are safer.'
),
(
  'accounts-payable-executive',
  80,
  70,
  53,
  60,
  0.72,
  'AP/AR roles are exposed to invoice capture, reconciliation, reminders, payment workflows, and ERP automation.'
),
(
  'accounts-receivable-executive',
  80,
  70,
  53,
  60,
  0.72,
  'AP/AR roles are exposed to invoice capture, reconciliation, reminders, payment workflows, and ERP automation.'
),
(
  'gst-executive',
  40,
  40,
  67,
  60,
  0.72,
  'Tech adoption is 7/10, remote feasibility is 6/10, growth outlook is 7/10, and automation risk is 4/10 based on task repeatability, physical presence, regulation, digitization, and India demand patterns.'
),
(
  'financial-analyst',
  60,
  50,
  61,
  60,
  0.72,
  'FP&A is exposed to automated reporting and forecasting, but scenario judgment and business partnering remain valuable.'
),
(
  'internal-auditor',
  50,
  40,
  59,
  70,
  0.72,
  'Audit is AI-assisted through anomaly detection and sampling, while controls judgment, evidence quality, and accountability keep risk moderate.'
),
(
  'chartered-accountant',
  60,
  50,
  54,
  70,
  0.72,
  'Accounting is exposed to bookkeeping, reconciliation, and report automation; advisory, controls, taxation, and interpretation are safer.'
),
(
  'payroll-executive',
  70,
  60,
  51,
  60,
  0.72,
  'Payroll processing is exposed to HRMS automation, rule-based checks, self-service portals, and exception-based workflows.'
),
(
  'hr-recruiter',
  60,
  60,
  58,
  40,
  0.72,
  'HR is exposed to screening, scheduling, and employee self-service automation, while people judgment and organizational context remain important.'
),
(
  'hr-business-partner',
  60,
  60,
  56,
  40,
  0.72,
  'HR is exposed to screening, scheduling, and employee self-service automation, while people judgment and organizational context remain important.'
),
(
  'learning-and-development-specialist',
  60,
  60,
  56,
  40,
  0.72,
  'HR is exposed to screening, scheduling, and employee self-service automation, while people judgment and organizational context remain important.'
),
(
  'office-administrator',
  70,
  70,
  53,
  40,
  0.72,
  'Administrative coordination is exposed to scheduling, document, email, meeting-summary, and workflow automation.'
),
(
  'executive-assistant',
  70,
  60,
  51,
  40,
  0.72,
  'Administrative coordination is exposed to scheduling, document, email, meeting-summary, and workflow automation.'
),
(
  'legal-associate',
  50,
  50,
  56,
  40,
  0.72,
  'Legal work is exposed to drafting and research automation, but interpretation, negotiation, risk ownership, and jurisdictional judgment remain resilient.'
),
(
  'company-secretary',
  40,
  40,
  59,
  50,
  0.72,
  'Compliance and governance roles are relatively resilient because regulation, accountability, escalation, and interpretation matter.'
),
(
  'cnc-machine-operator',
  50,
  50,
  69,
  0,
  0.72,
  'Production operations benefit from manufacturing growth but face medium automation exposure from robotics, sensors, and process automation.'
),
(
  'production-supervisor',
  50,
  50,
  69,
  0,
  0.72,
  'Production operations benefit from manufacturing growth but face medium automation exposure from robotics, sensors, and process automation.'
),
(
  'maintenance-engineer',
  30,
  30,
  70,
  10,
  0.72,
  'Plant engineering is protected by physical assets, reliability responsibility, and site-specific troubleshooting; AI mainly augments maintenance planning.'
),
(
  'quality-control-inspector',
  30,
  40,
  68,
  10,
  0.72,
  'Tech adoption is 6/10, remote feasibility is 1/10, growth outlook is 7/10, and automation risk is 3/10 based on task repeatability, physical presence, regulation, digitization, and India demand patterns.'
),
(
  'process-engineer',
  40,
  40,
  67,
  10,
  0.72,
  'Industrial engineering is AI-augmented for simulation, optimization, and process analytics, but plant context and implementation remain human-led.'
),
(
  'plant-manager',
  30,
  30,
  64,
  20,
  0.72,
  'Operations leadership is relatively resilient because it owns people, output, safety, trade-offs, and accountability.'
),
(
  'tool-and-die-maker',
  30,
  30,
  82,
  0,
  0.72,
  'Skilled trades are relatively protected because work is physical, site-specific, and judgment-heavy; AI mainly assists planning and diagnostics.'
),
(
  'welder-fabricator',
  30,
  40,
  79,
  0,
  0.72,
  'Physical skilled work is comparatively protected; AI mostly improves diagnostics, planning, training, and scheduling.'
),
(
  'assembly-line-worker',
  50,
  50,
  70,
  0,
  0.72,
  'Production operations benefit from manufacturing growth but face medium automation exposure from robotics, sensors, and process automation.'
),
(
  'automobile-service-technician',
  30,
  30,
  74,
  0,
  0.72,
  'Physical skilled work is comparatively protected; AI mostly improves diagnostics, planning, training, and scheduling.'
),
(
  'ev-battery-technician',
  30,
  30,
  74,
  0,
  0.72,
  'Physical skilled work is comparatively protected; AI mostly improves diagnostics, planning, training, and scheduling.'
),
(
  'automotive-design-engineer',
  40,
  30,
  76,
  40,
  0.72,
  'Tech adoption is 8/10, remote feasibility is 4/10, growth outlook is 8/10, and automation risk is 4/10 based on task repeatability, physical presence, regulation, digitization, and India demand patterns.'
),
(
  'ev-charging-station-technician',
  30,
  40,
  75,
  0,
  0.72,
  'Physical skilled work is comparatively protected; AI mostly improves diagnostics, planning, training, and scheduling.'
),
(
  'vehicle-sales-consultant',
  40,
  50,
  79,
  20,
  0.72,
  'Sales roles are AI-augmented through CRM, lead scoring, and outreach automation, but relationships, negotiation, and field presence keep risk moderate.'
),
(
  'auto-parts-supply-planner',
  50,
  50,
  67,
  20,
  0.72,
  'Supply-chain planning is AI-assisted through forecasting and optimization, but exceptions, suppliers, and execution trade-offs keep risk medium.'
),
(
  'civil-site-engineer',
  30,
  30,
  79,
  10,
  0.72,
  'Site engineering is protected by physical delivery, safety, contractors, and local execution; AI mainly assists drawings, planning, and reporting.'
),
(
  'quantity-surveyor',
  30,
  30,
  72,
  10,
  0.72,
  'Tech adoption is 6/10, remote feasibility is 1/10, growth outlook is 8/10, and automation risk is 3/10 based on task repeatability, physical presence, regulation, digitization, and India demand patterns.'
),
(
  'project-planner',
  40,
  40,
  67,
  10,
  0.72,
  'Project/program management is AI-assisted for plans, summaries, and reporting, but stakeholder trade-offs and accountability remain resilient.'
),
(
  'safety-officer',
  30,
  30,
  67,
  10,
  0.72,
  'Safety roles are relatively resilient because they require site presence, accountability, observation, and regulatory responsibility.'
),
(
  'electrician',
  30,
  40,
  79,
  0,
  0.72,
  'Physical skilled work is comparatively protected; AI mostly improves diagnostics, planning, training, and scheduling.'
),
(
  'plumber',
  30,
  40,
  79,
  0,
  0.72,
  'Physical skilled work is comparatively protected; AI mostly improves diagnostics, planning, training, and scheduling.'
),
(
  'surveyor',
  30,
  30,
  79,
  10,
  0.72,
  'Site engineering is protected by physical delivery, safety, contractors, and local execution; AI mainly assists drawings, planning, and reporting.'
),
(
  'construction-project-manager',
  40,
  40,
  64,
  20,
  0.72,
  'Project/program management is AI-assisted for plans, summaries, and reporting, but stakeholder trade-offs and accountability remain resilient.'
),
(
  'staff-nurse',
  20,
  30,
  86,
  0,
  0.72,
  'Clinical roles are AI-augmented but protected by care delivery, accountability, empathy, and regulated professional judgment.'
),
(
  'doctor-medical-officer',
  20,
  20,
  83,
  10,
  0.72,
  'Clinical roles are AI-augmented but protected by care delivery, accountability, empathy, and regulated professional judgment.'
),
(
  'pharmacist',
  40,
  40,
  70,
  20,
  0.72,
  'Pharmacy is partially exposed through e-pharmacy and dispensing systems, but licensed judgment and patient interaction keep risk moderate.'
),
(
  'medical-lab-technician',
  30,
  40,
  74,
  20,
  0.72,
  'Physical skilled work is comparatively protected; AI mostly improves diagnostics, planning, training, and scheduling.'
),
(
  'radiology-technician',
  30,
  40,
  74,
  20,
  0.72,
  'Physical skilled work is comparatively protected; AI mostly improves diagnostics, planning, training, and scheduling.'
),
(
  'hospital-administrator',
  40,
  40,
  67,
  20,
  0.72,
  'Healthcare operations are AI-assisted through scheduling, billing, and bed/capacity management, but local execution and accountability remain important.'
),
(
  'medical-sales-representative',
  40,
  50,
  79,
  20,
  0.72,
  'Sales roles are AI-augmented through CRM, lead scoring, and outreach automation, but relationships, negotiation, and field presence keep risk moderate.'
),
(
  'clinical-research-associate',
  30,
  30,
  69,
  30,
  0.72,
  'Clinical research is AI-augmented for monitoring and document review, but protocol execution, site engagement, and compliance keep risk lower.'
),
(
  'pharma-production-chemist',
  40,
  40,
  67,
  20,
  0.72,
  'Pharma manufacturing uses automation, but regulated production, validation, and quality processes keep the role resilient.'
),
(
  'school-teacher',
  40,
  40,
  72,
  30,
  0.72,
  'Teaching is augmented by AI tutors and content generation, but human mentoring, trust, and classroom context keep risk moderate.'
),
(
  'pre-primary-teacher',
  40,
  50,
  74,
  30,
  0.72,
  'Teaching is augmented by AI tutors and content generation, but human mentoring, trust, and classroom context keep risk moderate.'
),
(
  'college-lecturer',
  40,
  40,
  69,
  40,
  0.72,
  'Teaching is augmented by AI tutors and content generation, but human mentoring, trust, and classroom context keep risk moderate.'
),
(
  'tutor-coaching-faculty',
  40,
  40,
  72,
  30,
  0.72,
  'Teaching is augmented by AI tutors and content generation, but human mentoring, trust, and classroom context keep risk moderate.'
),
(
  'edtech-content-developer',
  70,
  60,
  56,
  30,
  0.72,
  'Content and curriculum work is exposed to generative AI drafting, quiz creation, summarization, and localization; higher-value instructional design is safer.'
),
(
  'instructional-designer',
  70,
  60,
  56,
  30,
  0.72,
  'Content and curriculum work is exposed to generative AI drafting, quiz creation, summarization, and localization; higher-value instructional design is safer.'
),
(
  'academic-counsellor',
  40,
  50,
  63,
  30,
  0.72,
  'Tech adoption is 5/10, remote feasibility is 3/10, growth outlook is 6/10, and automation risk is 4/10 based on task repeatability, physical presence, regulation, digitization, and India demand patterns.'
),
(
  'training-coordinator',
  40,
  40,
  61,
  30,
  0.72,
  'Tech adoption is 5/10, remote feasibility is 3/10, growth outlook is 6/10, and automation risk is 4/10 based on task repeatability, physical presence, regulation, digitization, and India demand patterns.'
),
(
  'retail-store-manager',
  60,
  50,
  69,
  0,
  0.72,
  'Store operations still need people on-site, but billing, inventory, rostering, and customer-service tasks are increasingly automated.'
),
(
  'sales-associate-retail',
  60,
  60,
  70,
  0,
  0.72,
  'Store operations still need people on-site, but billing, inventory, rostering, and customer-service tasks are increasingly automated.'
),
(
  'cashier',
  80,
  70,
  60,
  0,
  0.72,
  'Cashier work is exposed to self-checkout, UPI/digital payments, POS automation, and automated reconciliation.'
),
(
  'category-manager-e-commerce',
  50,
  50,
  67,
  20,
  0.72,
  'Category management is AI-assisted through pricing, assortment, and demand analytics, but commercial judgment and vendor decisions remain important.'
),
(
  'merchandiser',
  50,
  50,
  61,
  20,
  0.72,
  'Merchandising is AI-assisted through planning and trend analytics, while vendor, store, and market judgment remain useful.'
),
(
  'inventory-executive',
  70,
  60,
  63,
  20,
  0.72,
  'Inventory operations are exposed to demand forecasting, automated replenishment, scanning, and warehouse-management systems.'
),
(
  'customer-experience-manager',
  60,
  50,
  69,
  20,
  0.72,
  'Customer experience management is AI-assisted through feedback mining, journey analytics, chatbots, and support automation, but cross-functional improvement, escalation design, and customer empathy keep it in the transition zone rather than a pure replacement-risk role.'
),
(
  'marketplace-operations-executive',
  70,
  60,
  63,
  20,
  0.72,
  'Marketplace operations are exposed to listing automation, catalog enrichment, repricing, reporting, and workflow bots.'
),
(
  'warehouse-associate',
  60,
  60,
  75,
  0,
  0.72,
  'Warehouse jobs benefit from ecommerce growth but face medium automation exposure from scanning, routing, robotics, and warehouse-management systems.'
),
(
  'warehouse-manager',
  60,
  50,
  74,
  0,
  0.72,
  'Warehouse jobs benefit from ecommerce growth but face medium automation exposure from scanning, routing, robotics, and warehouse-management systems.'
),
(
  'supply-chain-analyst',
  50,
  50,
  67,
  10,
  0.72,
  'Supply-chain planning is AI-assisted through forecasting and optimization, but exceptions, suppliers, and execution trade-offs keep risk medium.'
),
(
  'procurement-executive',
  50,
  50,
  61,
  10,
  0.72,
  'Procurement is exposed to sourcing tools and spend analytics, while negotiation, supplier risk, and judgment remain important.'
),
(
  'logistics-coordinator',
  50,
  50,
  75,
  10,
  0.72,
  'Logistics operations are AI-augmented through routing, tracking, and exception alerts, while local coordination remains important.'
),
(
  'fleet-manager',
  40,
  40,
  67,
  10,
  0.72,
  'Fleet operations use telematics and optimization, but people, assets, compliance, and on-ground exceptions keep risk moderate.'
),
(
  'last-mile-delivery-supervisor',
  50,
  50,
  81,
  0,
  0.72,
  'Delivery roles are still growing in India, but platform optimization, routing automation, and eventual autonomous delivery create medium exposure.'
),
(
  'import-export-executive',
  50,
  50,
  61,
  10,
  0.72,
  'Trade operations are exposed to documentation automation but retain compliance, exception handling, and coordination work.'
),
(
  'agriculture-extension-officer',
  40,
  40,
  61,
  10,
  0.72,
  'Field advisory is AI-augmented by crop intelligence and decision support, but local trust and farmer engagement remain important.'
),
(
  'farm-supervisor',
  30,
  40,
  69,
  10,
  0.72,
  'Farm operations are physical and local, so AI mostly augments planning, monitoring, and advisory rather than replacing the role.'
),
(
  'dairy-farm-manager',
  30,
  40,
  61,
  10,
  0.72,
  'Dairy operations are protected by physical care, local operations, and quality control, with AI mainly supporting monitoring and logistics.'
),
(
  'fisheries-technician',
  30,
  30,
  67,
  10,
  0.72,
  'Physical skilled work is comparatively protected; AI mostly improves diagnostics, planning, training, and scheduling.'
),
(
  'food-processing-operator',
  40,
  50,
  70,
  0,
  0.72,
  'Production operations benefit from manufacturing growth but face medium automation exposure from robotics, sensors, and process automation.'
),
(
  'agri-input-sales-executive',
  40,
  50,
  79,
  10,
  0.72,
  'Sales roles are AI-augmented through CRM, lead scoring, and outreach automation, but relationships, negotiation, and field presence keep risk moderate.'
),
(
  'agri-supply-chain-coordinator',
  40,
  40,
  67,
  10,
  0.72,
  'Supply-chain planning is AI-assisted through forecasting and optimization, but exceptions, suppliers, and execution trade-offs keep risk medium.'
),
(
  'government-clerk',
  70,
  70,
  53,
  20,
  0.72,
  'Administrative coordination is exposed to scheduling, document, email, meeting-summary, and workflow automation.'
),
(
  'public-sector-bank-officer',
  50,
  50,
  61,
  20,
  0.72,
  'Branch operations are partially exposed to digital banking and self-service, but customer escalation and local execution remain important.'
),
(
  'police-constable',
  20,
  40,
  63,
  0,
  0.72,
  'Public-safety roles have low automation risk because physical presence, authority, and public trust are core to the job.'
),
(
  'municipal-engineer',
  30,
  40,
  67,
  20,
  0.72,
  'Public-works engineering is protected by local infrastructure delivery, approvals, and site accountability.'
),
(
  'data-entry-operator-government',
  90,
  80,
  43,
  20,
  0.72,
  'Data-entry work is among the most exposed because OCR, forms, workflow bots, and validation models can automate much of the task flow.'
),
(
  'program-officer-ngo-development',
  40,
  40,
  61,
  20,
  0.72,
  'Program roles are AI-assisted for reporting and coordination but remain dependent on field context, stakeholders, and delivery ownership.'
),
(
  'delivery-partner',
  50,
  50,
  82,
  0,
  0.72,
  'Delivery roles are still growing in India, but platform optimization, routing automation, and eventual autonomous delivery create medium exposure.'
),
(
  'ride-hailing-driver',
  50,
  50,
  63,
  0,
  0.72,
  'Ride-hailing remains demand-led in India, but platform automation, EV transition, and future autonomy create medium disruption risk.'
),
(
  'quick-commerce-picker',
  60,
  60,
  75,
  0,
  0.72,
  'Warehouse jobs benefit from ecommerce growth but face medium automation exposure from scanning, routing, robotics, and warehouse-management systems.'
),
(
  'home-service-technician',
  30,
  30,
  74,
  0,
  0.72,
  'Physical skilled work is comparatively protected; AI mostly improves diagnostics, planning, training, and scheduling.'
),
(
  'freelance-graphic-designer',
  80,
  70,
  51,
  0,
  0.72,
  'Graphic design is exposed to generative image tools and automated layout variants; brand judgment and art direction are safer.'
),
(
  'freelance-content-writer',
  80,
  70,
  51,
  0,
  0.72,
  'Routine content work is highly exposed to generative AI drafting, rewriting, summarization, translation, and creative variants.'
),
(
  'hotel-front-office-executive',
  50,
  50,
  63,
  10,
  0.72,
  'Guest services use kiosks and chatbots, but hospitality still depends on human service, escalation, and experience quality.'
),
(
  'chef-commis-chef',
  30,
  30,
  67,
  10,
  0.72,
  'Physical skilled work is comparatively protected; AI mostly improves diagnostics, planning, training, and scheduling.'
),
(
  'housekeeping-supervisor',
  30,
  40,
  61,
  10,
  0.72,
  'Housekeeping is physical and location-bound, so AI mainly affects scheduling, checklists, and inspection workflows.'
),
(
  'restaurant-manager',
  40,
  40,
  61,
  10,
  0.72,
  'Food and beverage operations are AI-assisted in demand planning and rostering, but service and operations leadership remain human-led.'
),
(
  'travel-consultant',
  70,
  70,
  53,
  10,
  0.72,
  'Travel consulting is exposed to online booking, itinerary generation, and travel chatbots; complex/premium travel advisory is safer.'
),
(
  'tour-guide',
  40,
  50,
  63,
  10,
  0.72,
  'Tour guides use digital itinerary and translation tools, but local presence, group management, storytelling, safety, and live adaptation protect much of the role. Risk is moderate rather than high.'
),
(
  'cabin-crew',
  50,
  50,
  63,
  10,
  0.72,
  'Guest services use kiosks and chatbots, but hospitality still depends on human service, escalation, and experience quality.'
),
(
  'video-editor',
  70,
  60,
  56,
  60,
  0.72,
  'Video and animation work is exposed to AI editing, generation, cleanup, and templating tools; storytelling and direction remain differentiators.'
),
(
  'graphic-designer',
  80,
  70,
  51,
  60,
  0.72,
  'Graphic design is exposed to generative image tools and automated layout variants; brand judgment and art direction are safer.'
),
(
  'journalist-reporter',
  60,
  60,
  56,
  60,
  0.72,
  'Editorial work is exposed to AI drafting and summarization, while original reporting, source judgment, and credibility remain human differentiators.'
),
(
  'social-media-manager',
  60,
  50,
  61,
  60,
  0.72,
  'Marketing is increasingly AI-assisted for content, campaign variants, targeting, and analytics; strategic brand and growth judgment remain valuable.'
),
(
  'content-creator',
  80,
  70,
  53,
  60,
  0.72,
  'Routine content work is highly exposed to generative AI drafting, rewriting, summarization, translation, and creative variants.'
),
(
  'animation-artist',
  70,
  60,
  56,
  60,
  0.72,
  'Video and animation work is exposed to AI editing, generation, cleanup, and templating tools; storytelling and direction remain differentiators.'
),
(
  'ad-operations-executive',
  70,
  60,
  58,
  60,
  0.72,
  'Marketing operations is exposed to campaign automation, ad-platform AI, tagging, trafficking, and reporting automation.'
),
(
  'solar-pv-technician',
  30,
  30,
  74,
  0,
  0.72,
  'Physical skilled work is comparatively protected; AI mostly improves diagnostics, planning, training, and scheduling.'
),
(
  'electrical-engineer-utilities',
  40,
  40,
  79,
  30,
  0.72,
  'Tech adoption is 8/10, remote feasibility is 3/10, growth outlook is 8/10, and automation risk is 4/10 based on task repeatability, physical presence, regulation, digitization, and India demand patterns.'
),
(
  'telecom-tower-technician',
  30,
  40,
  75,
  0,
  0.72,
  'Physical skilled work is comparatively protected; AI mostly improves diagnostics, planning, training, and scheduling.'
),
(
  'network-operations-center-engineer',
  70,
  60,
  65,
  30,
  0.72,
  'NOC roles are exposed where the work is alert monitoring, runbook execution, and routine incident triage because AIOps tools can correlate alerts and suggest remediation. More resilient roles move toward SRE, network automation, security operations, and complex incident ownership.'
),
(
  'field-service-engineer',
  30,
  30,
  79,
  0,
  0.72,
  'Field-service work is protected by physical presence and troubleshooting, while AI mainly augments diagnostics, scheduling, and knowledge lookup.'
),
(
  'renewable-energy-project-manager',
  40,
  40,
  64,
  30,
  0.72,
  'Project/program management is AI-assisted for plans, summaries, and reporting, but stakeholder trade-offs and accountability remain resilient.'
),
(
  'smart-meter-installation-technician',
  30,
  40,
  75,
  0,
  0.72,
  'Physical skilled work is comparatively protected; AI mostly improves diagnostics, planning, training, and scheduling.'
)
), resolved as (
  select
    o.id as occupation_id,
    sv.id as score_version_id,
    ds.id as source_id,
    si.ai_exposure,
    si.layoff_pressure,
    si.demand_outlook,
    si.remote_feasibility,
    si.confidence,
    si.rationale
  from score_input si
  join public.occupations o on o.slug = si.slug
  cross join public.score_versions sv
  cross join public.data_sources ds
  where sv.version_key = '2026.08-v2'
    and ds.source_key = 'india-role-model-2026-08'
)
insert into public.occupation_scores (
  occupation_id, location_id, score_version_id, source_id, evidence_kind, as_of_date,
  ai_exposure, layoff_pressure, demand_outlook, remote_feasibility, confidence, rationale
)
select
  occupation_id, null, score_version_id, source_id, 'analyst_reviewed', '2026-08-04',
  ai_exposure, layoff_pressure, demand_outlook, remote_feasibility, confidence, rationale
from resolved
on conflict (occupation_id, location_id, score_version_id, as_of_date) do update set
  source_id = excluded.source_id,
  evidence_kind = excluded.evidence_kind,
  ai_exposure = excluded.ai_exposure,
  layoff_pressure = excluded.layoff_pressure,
  demand_outlook = excluded.demand_outlook,
  remote_feasibility = excluded.remote_feasibility,
  confidence = excluded.confidence,
  rationale = excluded.rationale;

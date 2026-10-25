import fs from 'node:fs'

const sectorByCategory = {
  'Software / Tech': 'IT & Digital Services',
  'BPO / Shared Services': 'BPO / KPO / Shared Services',
  BFSI: 'BFSI (Banking, Financial Services, Insurance & Fintech)',
  'Sales & Marketing': 'Other / Miscellaneous',
  'Finance & Accounting': 'BFSI (Banking, Financial Services, Insurance & Fintech)',
  'HR, Admin & Legal': 'Other / Miscellaneous',
  Manufacturing: 'Manufacturing & Engineering',
  'Automotive & EV': 'Manufacturing & Engineering',
  'Construction & Infrastructure': 'Construction & Infrastructure',
  'Healthcare & Pharma': 'Healthcare & Pharma',
  'Education & Training': 'Education & Training',
  'Retail & E-commerce': 'Retail & E-commerce',
  'Logistics & Supply Chain': 'Logistics & Supply Chain',
  'Agriculture & Allied': 'Agriculture & Allied Activities',
  'Government & Public Administration': 'Govt & Public Administration',
  'Gig & Platform Work': 'Gig & Platform Work',
  'Hospitality & Tourism': 'Hospitality & Tourism',
  'Media & Entertainment': 'Media & Entertainment',
  'Energy, Utilities & Telecom': 'Other / Miscellaneous',
}

const categoryProfiles = {
  'Software / Tech': { metro: 9, tech: 10, remote: 8, growth: 8, locations: 'Bengaluru, Hyderabad, Pune, Chennai, Delhi NCR, Mumbai, Gurugram, and satellite hubs such as Coimbatore, Kochi, Indore, Jaipur, and Ahmedabad' },
  'BPO / Shared Services': { metro: 6, tech: 7, remote: 5, growth: 7, locations: 'Delhi NCR, Bengaluru, Hyderabad, Chennai, Pune, Mumbai, Kolkata, Jaipur, Indore, Lucknow, Bhubaneswar, Kochi, and Coimbatore' },
  BFSI: { metro: 6, tech: 8, remote: 5, growth: 8, locations: 'Mumbai, Delhi NCR, Bengaluru, Chennai, Hyderabad, Pune, and expanding tier-2/3 banking markets such as Jaipur, Surat, Lucknow, Nagpur, Indore, and Coimbatore' },
  'Sales & Marketing': { metro: 5, tech: 7, remote: 4, growth: 7, locations: 'metros for corporate teams and broad tier-2/3 markets for field sales, channel sales, FMCG, pharma, BFSI, telecom, and retail distribution' },
  'Finance & Accounting': { metro: 6, tech: 7, remote: 6, growth: 7, locations: 'Mumbai, Bengaluru, Pune, Hyderabad, Chennai, Delhi NCR, and shared-services hubs including Jaipur, Coimbatore, Kochi, and Ahmedabad' },
  'HR, Admin & Legal': { metro: 5, tech: 6, remote: 4, growth: 6, locations: 'corporate offices in metros and large employers across tier-2/3 cities, industrial clusters, universities, hospitals, and public institutions' },
  Manufacturing: { metro: 3, tech: 6, remote: 1, growth: 7, locations: 'industrial belts around Pune-Chakan, Sanand, Hosur, Coimbatore, Rajkot, Faridabad, Manesar, Aurangabad, Sriperumbudur, Noida, and tier-2 manufacturing clusters' },
  'Automotive & EV': { metro: 4, tech: 7, remote: 2, growth: 8, locations: 'auto and EV clusters around Chennai, Pune, Sanand, Gurugram-Manesar, Hosur, Bengaluru, Noida, Coimbatore, and emerging component hubs' },
  'Construction & Infrastructure': { metro: 5, tech: 6, remote: 1, growth: 8, locations: 'metro infrastructure corridors, roads, ports, housing, industrial parks, airports, utilities, and tier-2/3 public works projects' },
  'Healthcare & Pharma': { metro: 5, tech: 6, remote: 2, growth: 8, locations: 'metro hospitals and pharma hubs plus district hospitals, medical colleges, diagnostics networks, and tier-2/3 healthcare expansion markets' },
  'Education & Training': { metro: 3, tech: 5, remote: 3, growth: 6, locations: 'schools, colleges, coaching centers, universities, and training institutions across metros, districts, tier-2/3 cities, and small towns' },
  'Retail & E-commerce': { metro: 5, tech: 7, remote: 2, growth: 8, locations: 'metros, malls, high streets, ecommerce hubs, quick-commerce dark stores, and fast-growing tier-2/3 consumption centers' },
  'Logistics & Supply Chain': { metro: 5, tech: 7, remote: 1, growth: 8, locations: 'metro logistics corridors, ports, airports, industrial parks, highway nodes, fulfillment centers, and tier-2/3 warehouse clusters' },
  'Agriculture & Allied': { metro: 1, tech: 4, remote: 1, growth: 6, locations: 'rural districts, mandis, agri-input markets, food-processing clusters, dairy belts, fisheries regions, and small towns' },
  'Government & Public Administration': { metro: 4, tech: 5, remote: 2, growth: 6, locations: 'central, state, district, municipal, public-sector, and local administrative offices across India' },
  'Gig & Platform Work': { metro: 5, tech: 8, remote: 0, growth: 7, locations: 'metros and rapidly expanding tier-2/3 platform markets for food delivery, ride-hailing, quick commerce, ecommerce, and home services' },
  'Hospitality & Tourism': { metro: 4, tech: 5, remote: 1, growth: 7, locations: 'metros, airports, business travel centers, tourism states, pilgrimage towns, resorts, and tier-2 hospitality markets' },
  'Media & Entertainment': { metro: 7, tech: 8, remote: 6, growth: 7, locations: 'Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Pune, Kochi, and creator/media production clusters' },
  'Energy, Utilities & Telecom': { metro: 4, tech: 7, remote: 2, growth: 8, locations: 'power, renewables, telecom, utilities, field-service, and infrastructure networks across metros, industrial corridors, districts, and rural coverage areas' },
}

const categoryRoles = {
  'Software / Tech': [
    ['Software Developer', 'Engineering', 'MID_LEVEL', 'Graduate'],
    ['Frontend Developer', 'Engineering', 'MID_LEVEL', 'Graduate'],
    ['Backend Developer', 'Engineering', 'MID_LEVEL', 'Graduate'],
    ['Mobile App Developer', 'Engineering', 'MID_LEVEL', 'Graduate'],
    ['QA Engineer / Software Tester', 'Quality Assurance', 'MID_LEVEL', 'Graduate'],
    ['SDET / Test Automation Engineer', 'Quality Assurance', 'SENIOR_SPECIALIST', 'Graduate'],
    ['AI QA Engineer / Model Evaluation Tester', 'Quality Assurance', 'SENIOR_SPECIALIST', 'Graduate'],
    ['Product Manager', 'Product', 'SENIOR_SPECIALIST', 'Postgraduate / Professional'],
    ['Associate Product Manager', 'Product', 'ENTRY_LEVEL', 'Graduate'],
    ['Project Manager - IT', 'Project / Program Management', 'MID_LEVEL', 'Graduate'],
    ['Scrum Master', 'Project / Program Management', 'MID_LEVEL', 'Graduate'],
    ['Engineering Manager / Lead Engineer', 'Engineering Leadership', 'SENIOR_SPECIALIST', 'Graduate'],
    ['DevOps Engineer / Site Reliability Engineer', 'Infrastructure & Cloud', 'SENIOR_SPECIALIST', 'Graduate'],
    ['Cloud Solutions Architect', 'Infrastructure & Cloud', 'SENIOR_SPECIALIST', 'Graduate'],
    ['Data Analyst', 'Data & Analytics', 'MID_LEVEL', 'Graduate'],
    ['Data Engineer', 'Data & Analytics', 'SENIOR_SPECIALIST', 'Graduate'],
    ['Machine Learning Engineer', 'AI & Machine Learning', 'SENIOR_SPECIALIST', 'Postgraduate / Professional'],
    ['Cybersecurity Analyst', 'Security', 'MID_LEVEL', 'Graduate'],
    ['UI/UX Designer', 'Design', 'MID_LEVEL', 'Graduate'],
    ['Business Analyst - IT', 'Business Analysis', 'MID_LEVEL', 'Graduate'],
    ['Technical Support Engineer', 'Support & Operations', 'ENTRY_LEVEL', 'Graduate'],
  ],
  'BPO / Shared Services': [
    ['Customer Support Executive', 'Customer Operations', 'ENTRY_LEVEL', 'Graduate'],
    ['Voice Process Associate', 'Customer Operations', 'ENTRY_LEVEL', 'Graduate'],
    ['Non-Voice Process Associate', 'Back Office Operations', 'ENTRY_LEVEL', 'Graduate'],
    ['KYC Operations Analyst', 'Back Office Operations', 'ENTRY_LEVEL', 'Graduate'],
    ['Claims Processing Associate', 'Back Office Operations', 'ENTRY_LEVEL', 'Graduate'],
    ['Quality Analyst - BPO', 'Quality Assurance', 'MID_LEVEL', 'Graduate'],
    ['Team Leader - BPO', 'Operations Leadership', 'MID_LEVEL', 'Graduate'],
  ],
  BFSI: [
    ['Bank Relationship Manager', 'Sales & Relationship Management', 'MID_LEVEL', 'Graduate'],
    ['Credit Analyst', 'Risk & Underwriting', 'MID_LEVEL', 'Graduate'],
    ['Branch Operations Manager', 'Branch Operations', 'MID_LEVEL', 'Graduate'],
    ['Loan Officer', 'Sales & Relationship Management', 'ENTRY_LEVEL', 'Graduate'],
    ['Insurance Advisor', 'Sales & Relationship Management', 'ENTRY_LEVEL', 'Up to 10th / 12th'],
    ['Wealth Manager', 'Sales & Relationship Management', 'SENIOR_SPECIALIST', 'Postgraduate / Professional'],
    ['Risk Analyst', 'Risk & Underwriting', 'MID_LEVEL', 'Graduate'],
    ['Compliance Officer - BFSI', 'Compliance & Legal', 'SENIOR_SPECIALIST', 'Postgraduate / Professional'],
    ['Fintech Operations Analyst', 'Operations', 'MID_LEVEL', 'Graduate'],
  ],
  'Sales & Marketing': [
    ['Field Sales Executive', 'Sales', 'ENTRY_LEVEL', 'Graduate'],
    ['Inside Sales Representative', 'Sales', 'ENTRY_LEVEL', 'Graduate'],
    ['Key Account Manager', 'Sales', 'MID_LEVEL', 'Graduate'],
    ['Area Sales Manager', 'Sales Leadership', 'MID_LEVEL', 'Graduate'],
    ['Digital Marketing Specialist', 'Marketing', 'MID_LEVEL', 'Graduate'],
    ['Performance Marketing Manager', 'Marketing', 'SENIOR_SPECIALIST', 'Graduate'],
    ['Brand Manager', 'Marketing', 'MID_LEVEL', 'Postgraduate / Professional'],
    ['Market Research Analyst', 'Marketing Analytics', 'MID_LEVEL', 'Graduate'],
    ['Content Marketing Specialist', 'Marketing', 'MID_LEVEL', 'Graduate'],
  ],
  'Finance & Accounting': [
    ['Accountant', 'Accounting', 'MID_LEVEL', 'Graduate'],
    ['Accounts Payable Executive', 'Accounting Operations', 'ENTRY_LEVEL', 'Graduate'],
    ['Accounts Receivable Executive', 'Accounting Operations', 'ENTRY_LEVEL', 'Graduate'],
    ['GST Executive', 'Taxation', 'MID_LEVEL', 'Graduate'],
    ['Financial Analyst', 'FP&A', 'MID_LEVEL', 'Graduate'],
    ['Internal Auditor', 'Audit & Controls', 'SENIOR_SPECIALIST', 'Postgraduate / Professional'],
    ['Chartered Accountant', 'Accounting', 'SENIOR_SPECIALIST', 'Postgraduate / Professional'],
    ['Payroll Executive', 'Payroll', 'MID_LEVEL', 'Graduate'],
  ],
  'HR, Admin & Legal': [
    ['HR Recruiter', 'Human Resources', 'ENTRY_LEVEL', 'Graduate'],
    ['HR Business Partner', 'Human Resources', 'MID_LEVEL', 'Postgraduate / Professional'],
    ['Learning and Development Specialist', 'Human Resources', 'MID_LEVEL', 'Graduate'],
    ['Office Administrator', 'Administration', 'ENTRY_LEVEL', 'Graduate'],
    ['Executive Assistant', 'Administration', 'MID_LEVEL', 'Graduate'],
    ['Legal Associate', 'Legal', 'MID_LEVEL', 'Postgraduate / Professional'],
    ['Company Secretary', 'Compliance & Legal', 'SENIOR_SPECIALIST', 'Postgraduate / Professional'],
  ],
  Manufacturing: [
    ['CNC Machine Operator', 'Production Operations', 'MID_LEVEL', 'Diploma / ITI'],
    ['Production Supervisor', 'Production Operations', 'MID_LEVEL', 'Diploma / ITI'],
    ['Maintenance Engineer', 'Plant Engineering', 'MID_LEVEL', 'Diploma / ITI'],
    ['Quality Control Inspector', 'Quality Assurance', 'ENTRY_LEVEL', 'Diploma / ITI'],
    ['Process Engineer', 'Industrial Engineering', 'MID_LEVEL', 'Graduate'],
    ['Plant Manager', 'Operations Leadership', 'SENIOR_SPECIALIST', 'Graduate'],
    ['Tool and Die Maker', 'Skilled Trades', 'MID_LEVEL', 'Diploma / ITI'],
    ['Welder / Fabricator', 'Skilled Trades', 'ENTRY_LEVEL', 'Diploma / ITI'],
    ['Assembly Line Worker', 'Production Operations', 'ENTRY_LEVEL', 'Up to 10th / 12th'],
  ],
  'Automotive & EV': [
    ['Automobile Service Technician', 'Field Service', 'MID_LEVEL', 'Diploma / ITI'],
    ['EV Battery Technician', 'Field Service', 'MID_LEVEL', 'Diploma / ITI'],
    ['Automotive Design Engineer', 'Engineering', 'SENIOR_SPECIALIST', 'Graduate'],
    ['EV Charging Station Technician', 'Field Service', 'ENTRY_LEVEL', 'Diploma / ITI'],
    ['Vehicle Sales Consultant', 'Sales', 'ENTRY_LEVEL', 'Graduate'],
    ['Auto Parts Supply Planner', 'Supply Chain Planning', 'MID_LEVEL', 'Graduate'],
  ],
  'Construction & Infrastructure': [
    ['Civil Site Engineer', 'Site Engineering', 'MID_LEVEL', 'Graduate'],
    ['Quantity Surveyor', 'Commercial & Contracts', 'MID_LEVEL', 'Graduate'],
    ['Project Planner', 'Project / Program Management', 'MID_LEVEL', 'Graduate'],
    ['Safety Officer', 'Safety & Compliance', 'MID_LEVEL', 'Diploma / ITI'],
    ['Electrician', 'Skilled Trades', 'ENTRY_LEVEL', 'Diploma / ITI'],
    ['Plumber', 'Skilled Trades', 'ENTRY_LEVEL', 'Diploma / ITI'],
    ['Surveyor', 'Site Engineering', 'MID_LEVEL', 'Diploma / ITI'],
    ['Construction Project Manager', 'Project / Program Management', 'SENIOR_SPECIALIST', 'Graduate'],
  ],
  'Healthcare & Pharma': [
    ['Staff Nurse', 'Clinical Care', 'MID_LEVEL', 'Diploma / ITI'],
    ['Doctor / Medical Officer', 'Clinical Care', 'SENIOR_SPECIALIST', 'Postgraduate / Professional'],
    ['Pharmacist', 'Pharmacy', 'MID_LEVEL', 'Diploma / ITI'],
    ['Medical Lab Technician', 'Diagnostics', 'MID_LEVEL', 'Diploma / ITI'],
    ['Radiology Technician', 'Diagnostics', 'MID_LEVEL', 'Diploma / ITI'],
    ['Hospital Administrator', 'Healthcare Operations', 'MID_LEVEL', 'Graduate'],
    ['Medical Sales Representative', 'Sales', 'ENTRY_LEVEL', 'Graduate'],
    ['Clinical Research Associate', 'Clinical Research', 'SENIOR_SPECIALIST', 'Graduate'],
    ['Pharma Production Chemist', 'Pharma Manufacturing', 'MID_LEVEL', 'Graduate'],
  ],
  'Education & Training': [
    ['School Teacher', 'Teaching', 'MID_LEVEL', 'Postgraduate / Professional'],
    ['Pre-primary Teacher', 'Teaching', 'ENTRY_LEVEL', 'Graduate'],
    ['College Lecturer', 'Teaching', 'SENIOR_SPECIALIST', 'Postgraduate / Professional'],
    ['Tutor / Coaching Faculty', 'Teaching', 'MID_LEVEL', 'Graduate'],
    ['EdTech Content Developer', 'Content & Curriculum', 'MID_LEVEL', 'Graduate'],
    ['Instructional Designer', 'Content & Curriculum', 'MID_LEVEL', 'Graduate'],
    ['Academic Counsellor', 'Student Services', 'ENTRY_LEVEL', 'Graduate'],
    ['Training Coordinator', 'Training Operations', 'MID_LEVEL', 'Graduate'],
  ],
  'Retail & E-commerce': [
    ['Retail Store Manager', 'Store Operations', 'MID_LEVEL', 'Graduate'],
    ['Sales Associate - Retail', 'Store Operations', 'ENTRY_LEVEL', 'Up to 10th / 12th'],
    ['Cashier', 'Store Operations', 'ENTRY_LEVEL', 'Up to 10th / 12th'],
    ['Category Manager - E-commerce', 'Category Management', 'MID_LEVEL', 'Graduate'],
    ['Merchandiser', 'Merchandising', 'MID_LEVEL', 'Graduate'],
    ['Inventory Executive', 'Inventory Operations', 'ENTRY_LEVEL', 'Graduate'],
    ['Customer Experience Manager', 'Customer Operations', 'MID_LEVEL', 'Graduate'],
    ['Marketplace Operations Executive', 'E-commerce Operations', 'ENTRY_LEVEL', 'Graduate'],
  ],
  'Logistics & Supply Chain': [
    ['Warehouse Associate', 'Warehouse Operations', 'ENTRY_LEVEL', 'Up to 10th / 12th'],
    ['Warehouse Manager', 'Warehouse Operations', 'MID_LEVEL', 'Graduate'],
    ['Supply Chain Analyst', 'Supply Chain Planning', 'MID_LEVEL', 'Graduate'],
    ['Procurement Executive', 'Procurement', 'MID_LEVEL', 'Graduate'],
    ['Logistics Coordinator', 'Logistics Operations', 'ENTRY_LEVEL', 'Graduate'],
    ['Fleet Manager', 'Fleet Operations', 'MID_LEVEL', 'Graduate'],
    ['Last-mile Delivery Supervisor', 'Delivery Operations', 'MID_LEVEL', 'Graduate'],
    ['Import Export Executive', 'Trade Operations', 'MID_LEVEL', 'Graduate'],
  ],
  'Agriculture & Allied': [
    ['Agriculture Extension Officer', 'Field Advisory', 'MID_LEVEL', 'Graduate'],
    ['Farm Supervisor', 'Farm Operations', 'MID_LEVEL', 'Diploma / ITI'],
    ['Dairy Farm Manager', 'Dairy Operations', 'MID_LEVEL', 'Graduate'],
    ['Fisheries Technician', 'Allied Activities', 'MID_LEVEL', 'Diploma / ITI'],
    ['Food Processing Operator', 'Production Operations', 'ENTRY_LEVEL', 'Up to 10th / 12th'],
    ['Agri Input Sales Executive', 'Sales', 'ENTRY_LEVEL', 'Graduate'],
    ['Agri Supply Chain Coordinator', 'Supply Chain Planning', 'MID_LEVEL', 'Graduate'],
  ],
  'Government & Public Administration': [
    ['Government Clerk', 'Administration', 'ENTRY_LEVEL', 'Graduate'],
    ['Public Sector Bank Officer', 'Branch Operations', 'MID_LEVEL', 'Graduate'],
    ['Police Constable', 'Public Safety', 'ENTRY_LEVEL', 'Up to 10th / 12th'],
    ['Municipal Engineer', 'Public Works', 'MID_LEVEL', 'Graduate'],
    ['Data Entry Operator - Government', 'Administration', 'ENTRY_LEVEL', 'Up to 10th / 12th'],
    ['Program Officer - NGO / Development', 'Program Management', 'MID_LEVEL', 'Graduate'],
  ],
  'Gig & Platform Work': [
    ['Delivery Partner', 'Delivery Operations', 'ENTRY_LEVEL', 'Up to 10th / 12th'],
    ['Ride-hailing Driver', 'Mobility Operations', 'ENTRY_LEVEL', 'Up to 10th / 12th'],
    ['Quick Commerce Picker', 'Warehouse Operations', 'ENTRY_LEVEL', 'Up to 10th / 12th'],
    ['Home Service Technician', 'Field Service', 'MID_LEVEL', 'Diploma / ITI'],
    ['Freelance Graphic Designer', 'Design', 'MID_LEVEL', 'Graduate'],
    ['Freelance Content Writer', 'Content & Curriculum', 'MID_LEVEL', 'Graduate'],
  ],
  'Hospitality & Tourism': [
    ['Hotel Front Office Executive', 'Guest Services', 'ENTRY_LEVEL', 'Graduate'],
    ['Chef / Commis Chef', 'Food Production', 'MID_LEVEL', 'Diploma / ITI'],
    ['Housekeeping Supervisor', 'Housekeeping', 'MID_LEVEL', 'Up to 10th / 12th'],
    ['Restaurant Manager', 'Food & Beverage Operations', 'MID_LEVEL', 'Graduate'],
    ['Travel Consultant', 'Travel Operations', 'ENTRY_LEVEL', 'Graduate'],
    ['Tour Guide', 'Travel Operations', 'ENTRY_LEVEL', 'Graduate'],
    ['Cabin Crew', 'Guest Services', 'ENTRY_LEVEL', 'Graduate'],
  ],
  'Media & Entertainment': [
    ['Video Editor', 'Creative Production', 'MID_LEVEL', 'Graduate'],
    ['Graphic Designer', 'Design', 'MID_LEVEL', 'Graduate'],
    ['Journalist / Reporter', 'Editorial', 'MID_LEVEL', 'Graduate'],
    ['Social Media Manager', 'Marketing', 'MID_LEVEL', 'Graduate'],
    ['Content Creator', 'Creative Production', 'ENTRY_LEVEL', 'Graduate'],
    ['Animation Artist', 'Creative Production', 'MID_LEVEL', 'Graduate'],
    ['Ad Operations Executive', 'Marketing Operations', 'ENTRY_LEVEL', 'Graduate'],
  ],
  'Energy, Utilities & Telecom': [
    ['Solar PV Technician', 'Field Service', 'MID_LEVEL', 'Diploma / ITI'],
    ['Electrical Engineer - Utilities', 'Engineering', 'MID_LEVEL', 'Graduate'],
    ['Telecom Tower Technician', 'Field Service', 'ENTRY_LEVEL', 'Diploma / ITI'],
    ['Network Operations Center Engineer', 'Infrastructure & Cloud', 'MID_LEVEL', 'Graduate'],
    ['Field Service Engineer', 'Field Service', 'MID_LEVEL', 'Diploma / ITI'],
    ['Renewable Energy Project Manager', 'Project / Program Management', 'SENIOR_SPECIALIST', 'Graduate'],
    ['Smart Meter Installation Technician', 'Field Service', 'ENTRY_LEVEL', 'Diploma / ITI'],
  ],
}

const roleOverrides = {
  'Software Developer': {
    growth: 7,
    automation_risk_score: 6,
    scores_rationale: 'Software development remains a growing India role because every sector is digitizing, but AI coding assistants now automate boilerplate, refactoring, unit-test creation, and first-draft code. This is strong augmentation with medium disruption, especially for junior or repetitive implementation work.',
  },
  'Frontend Developer': {
    growth: 6,
    automation_risk_score: 7,
    scores_rationale: 'Frontend work is exposed because AI tools can generate UI scaffolds, components, tests, and copy quickly. Demand remains meaningful in India, but routine page-building is under higher pressure than architecture, product-quality, accessibility, and design-system work.',
  },
  'Backend Developer': {
    growth: 7,
    automation_risk_score: 6,
    scores_rationale: 'Backend demand remains resilient where engineers own APIs, data models, reliability, security, and domain logic. AI raises productivity on boilerplate, tests, and refactoring, so this is medium disruption rather than no impact.',
  },
  'Mobile App Developer': {
    growth: 6,
    automation_risk_score: 6,
    scores_rationale: 'Mobile app demand continues across fintech, commerce, health, and consumer apps, but AI-assisted app builders and code assistants reduce effort for routine screens, integration snippets, and test cases. Stronger engineers move toward product architecture and AI-enabled mobile experiences.',
  },
  'QA Engineer / Software Tester': {
    tech: 9,
    remote: 7,
    growth: 3,
    automation_risk_score: 9,
    scores_rationale: 'Manual and repetitive software testing is highly exposed in India because AI and automation can generate test cases, run regression checks, create synthetic data, inspect logs, and summarize defects. Demand is shifting away from pure manual QA toward SDET, automation, API testing, AI evaluation, and product quality analytics.',
  },
  'SDET / Test Automation Engineer': {
    growth: 8,
    automation_risk_score: 5,
    scores_rationale: 'SDET and test automation roles are safer than manual QA because they build the automation layer: CI/CD test suites, API checks, performance tests, observability, and AI-assisted quality gates. AI changes the tooling but can expand impact for engineers who own automation strategy.',
  },
  'AI QA Engineer / Model Evaluation Tester': {
    metro: 10,
    tech: 10,
    remote: 9,
    growth: 9,
    automation_risk_score: 4,
    scores_rationale: 'AI QA and model evaluation roles are an emerging safer move for testers: they evaluate prompts, model outputs, hallucination risk, safety, regression behavior, and human acceptance criteria. Demand is concentrated in AI product teams, GCCs, SaaS, fintech, and platform companies in Bengaluru, Hyderabad, Pune, Chennai, Delhi NCR, and Mumbai.',
  },
  'Business Analyst - IT': {
    growth: 6,
    automation_risk_score: 7,
    scores_rationale: 'IT business analysis is under pressure where the work is mostly meeting notes, basic documentation, dashboards, and ticket writing. BAs with domain depth, data fluency, process design, and AI workflow skills remain more resilient.',
  },
  'Technical Support Engineer': {
    growth: 4,
    automation_risk_score: 8,
    scores_rationale: 'Tier-1 technical support is exposed to chatbots, retrieval assistants, and automated troubleshooting. More resilient support roles move toward L2/L3 debugging, customer engineering, integrations, observability, and support automation ownership.',
  },
  'Data Analyst': {
    growth: 6,
    automation_risk_score: 7,
    scores_rationale: 'Routine data analyst work is exposed because AI tools can now draft SQL, generate dashboards, summarize trends, and automate recurring reports. The safer path is toward analytics engineering, product analytics, experiment design, data quality, and decision support tied closely to business context.',
  },
  'Quality Analyst - BPO': {
    growth: 4,
    automation_risk_score: 8,
    scores_rationale: 'BPO quality analysis is highly exposed because AI can review call transcripts, score interactions, detect compliance issues, summarize defects, and monitor large samples continuously. Human QA remains valuable for coaching, exceptions, and process redesign.',
  },
  'Scrum Master': {
    growth: 5,
    automation_risk_score: 7,
    scores_rationale: 'Standalone Scrum Master work is exposed where it is mainly ceremony coordination, note-taking, status reporting, and ticket hygiene. The safer path is toward delivery leadership, product operations, engineering program management, or AI-enabled workflow improvement.',
  },
  'Network Operations Center Engineer': {
    growth: 6,
    automation_risk_score: 7,
    scores_rationale: 'NOC roles are exposed where the work is alert monitoring, runbook execution, and routine incident triage because AIOps tools can correlate alerts and suggest remediation. More resilient roles move toward SRE, network automation, security operations, and complex incident ownership.',
  },
  'Customer Experience Manager': {
    growth: 6,
    automation_risk_score: 6,
    scores_rationale: 'Customer experience management is AI-assisted through feedback mining, journey analytics, chatbots, and support automation, but cross-functional improvement, escalation design, and customer empathy keep it in the transition zone rather than a pure replacement-risk role.',
  },
  'Tour Guide': {
    growth: 6,
    automation_risk_score: 4,
    scores_rationale: 'Tour guides use digital itinerary and translation tools, but local presence, group management, storytelling, safety, and live adaptation protect much of the role. Risk is moderate rather than high.',
  },
}

const familyExposureRules = {
  'Customer Operations': { growth: 4, automation_risk_score: 8, note: 'High-volume customer operations are exposed to chatbots, voice bots, self-service workflows, and AI-assisted ticket routing.' },
  'Back Office Operations': { growth: 4, automation_risk_score: 8, note: 'Back-office processing has high exposure because document intake, validation, classification, and workflow routing are increasingly automated.' },
  'Accounting Operations': { growth: 4, automation_risk_score: 8, note: 'Routine accounting operations are exposed to invoice automation, reconciliation tools, OCR, and ERP workflow automation.' },
  Payroll: { growth: 4, automation_risk_score: 7, note: 'Payroll processing is exposed to HRMS automation, rule-based checks, self-service portals, and exception-based workflows.' },
  Administration: { growth: 4, automation_risk_score: 7, note: 'Administrative roles are exposed where the work is scheduling, document handling, basic coordination, data entry, and routine communication.' },
  'Store Operations': { growth: 6, automation_risk_score: 6, note: 'Store operations still need people on-site, but billing, inventory, rostering, and customer-service tasks are increasingly automated.' },
  'Warehouse Operations': { growth: 7, automation_risk_score: 6, note: 'Warehouse jobs benefit from ecommerce growth but face medium automation exposure from scanning, routing, robotics, and warehouse-management systems.' },
  'Delivery Operations': { growth: 7, automation_risk_score: 5, note: 'Delivery roles are still growing in India, but platform optimization, routing automation, and eventual autonomous delivery create medium exposure.' },
  'Mobility Operations': { growth: 6, automation_risk_score: 5, note: 'Ride-hailing remains demand-led in India, but platform automation, EV transition, and future autonomy create medium disruption risk.' },
  'Field Service': { growth: 8, automation_risk_score: 3, note: 'Field-service work is protected by physical presence and troubleshooting, while AI mainly augments diagnostics, scheduling, and knowledge lookup.' },
  'Skilled Trades': { growth: 8, automation_risk_score: 3, note: 'Skilled trades are relatively protected because work is physical, site-specific, and judgment-heavy; AI mainly assists planning and diagnostics.' },
  'Clinical Care': { growth: 8, automation_risk_score: 2, note: 'Clinical-care roles have low full-automation risk because they require human care, responsibility, and local delivery; AI mainly augments documentation and decision support.' },
  Diagnostics: { growth: 8, automation_risk_score: 4, note: 'Diagnostics roles use more automation and AI image/lab support, but still require clinical context, equipment handling, and validation.' },
  Pharmacy: { growth: 7, automation_risk_score: 4, note: 'Pharmacy is partially exposed through e-pharmacy, inventory systems, and dispensing support, but licensed judgment and patient interaction keep risk moderate.' },
  Teaching: { growth: 6, automation_risk_score: 4, note: 'Teaching is augmented by AI lesson tools and tutors, but classroom management, mentoring, and trust keep full automation risk moderate.' },
  'Content & Curriculum': { growth: 5, automation_risk_score: 7, note: 'Content and curriculum work is exposed to generative AI drafting, quiz creation, summarization, and localization; higher-value instructional design is safer.' },
  'Creative Production': { growth: 5, automation_risk_score: 7, note: 'Creative production is exposed to generative image, video, editing, animation, and copy tools; direction, taste, and client context remain differentiators.' },
  Design: { growth: 5, automation_risk_score: 7, note: 'Design roles are exposed to generative design tools for first drafts and variants; research, systems thinking, and product context are safer.' },
  Editorial: { growth: 5, automation_risk_score: 6, note: 'Editorial work is exposed to AI drafting and summarization, while original reporting, source judgment, and credibility remain human differentiators.' },
  Marketing: { growth: 6, automation_risk_score: 6, note: 'Marketing is increasingly AI-assisted for content, campaign variants, targeting, and analytics; strategic brand and growth judgment remain valuable.' },
  'Marketing Analytics': { growth: 6, automation_risk_score: 6, note: 'Marketing analytics is exposed to automated dashboards and insight generation, but experiment design and business interpretation remain resilient.' },
  'Marketing Operations': { growth: 5, automation_risk_score: 7, note: 'Marketing operations is exposed to campaign automation, ad-platform AI, tagging, trafficking, and reporting automation.' },
  Sales: { growth: 7, automation_risk_score: 4, note: 'Sales roles are AI-augmented through CRM, lead scoring, and outreach automation, but relationships, negotiation, and field presence keep risk moderate.' },
  'Sales & Relationship Management': { growth: 7, automation_risk_score: 4, note: 'Relationship-heavy sales is more resilient because trust, negotiation, local networks, and regulated advice still matter.' },
  'Risk & Underwriting': { growth: 6, automation_risk_score: 6, note: 'Risk and underwriting roles are exposed to scoring models and automated document checks, while judgment, exceptions, and compliance remain important.' },
  Operations: { growth: 5, automation_risk_score: 7, note: 'Operational analyst roles are exposed where work is rule-based monitoring, queue management, and process reporting.' },
  'Branch Operations': { growth: 6, automation_risk_score: 5, note: 'Branch operations are partially exposed to digital banking and self-service, but customer escalation and local execution remain important.' },
  Accounting: { growth: 5, automation_risk_score: 6, note: 'Accounting is exposed to bookkeeping, reconciliation, and report automation; advisory, controls, taxation, and interpretation are safer.' },
  'FP&A': { growth: 6, automation_risk_score: 6, note: 'FP&A is exposed to automated reporting and forecasting, but scenario judgment and business partnering remain valuable.' },
  'Audit & Controls': { growth: 6, automation_risk_score: 5, note: 'Audit is AI-assisted through anomaly detection and sampling, while controls judgment, evidence quality, and accountability keep risk moderate.' },
  'Human Resources': { growth: 5, automation_risk_score: 6, note: 'HR is exposed to screening, scheduling, and employee self-service automation, while people judgment and organizational context remain important.' },
  Legal: { growth: 5, automation_risk_score: 5, note: 'Legal work is exposed to drafting and research automation, but interpretation, negotiation, risk ownership, and jurisdictional judgment remain resilient.' },
  'Compliance & Legal': { growth: 6, automation_risk_score: 4, note: 'Compliance and governance roles are relatively resilient because regulation, accountability, escalation, and interpretation matter.' },
  'Production Operations': { growth: 6, automation_risk_score: 5, note: 'Production operations benefit from manufacturing growth but face medium automation exposure from robotics, sensors, and process automation.' },
  'Plant Engineering': { growth: 7, automation_risk_score: 3, note: 'Plant engineering is protected by physical assets, reliability responsibility, and site-specific troubleshooting; AI mainly augments maintenance planning.' },
  'Industrial Engineering': { growth: 7, automation_risk_score: 4, note: 'Industrial engineering is AI-augmented for simulation, optimization, and process analytics, but plant context and implementation remain human-led.' },
  'Operations Leadership': { growth: 7, automation_risk_score: 3, note: 'Operations leadership is relatively resilient because it owns people, output, safety, trade-offs, and accountability.' },
  'Supply Chain Planning': { growth: 7, automation_risk_score: 5, note: 'Supply-chain planning is AI-assisted through forecasting and optimization, but exceptions, suppliers, and execution trade-offs keep risk medium.' },
  Procurement: { growth: 6, automation_risk_score: 5, note: 'Procurement is exposed to sourcing tools and spend analytics, while negotiation, supplier risk, and judgment remain important.' },
  'Logistics Operations': { growth: 7, automation_risk_score: 5, note: 'Logistics operations are AI-augmented through routing, tracking, and exception alerts, while local coordination remains important.' },
  'Fleet Operations': { growth: 7, automation_risk_score: 4, note: 'Fleet operations use telematics and optimization, but people, assets, compliance, and on-ground exceptions keep risk moderate.' },
  'Trade Operations': { growth: 6, automation_risk_score: 5, note: 'Trade operations are exposed to documentation automation but retain compliance, exception handling, and coordination work.' },
  'Site Engineering': { growth: 8, automation_risk_score: 3, note: 'Site engineering is protected by physical delivery, safety, contractors, and local execution; AI mainly assists drawings, planning, and reporting.' },
  'Project / Program Management': { growth: 7, automation_risk_score: 4, note: 'Project/program management is AI-assisted for plans, summaries, and reporting, but stakeholder trade-offs and accountability remain resilient.' },
  'Safety & Compliance': { growth: 7, automation_risk_score: 3, note: 'Safety roles are relatively resilient because they require site presence, accountability, observation, and regulatory responsibility.' },
  'Public Safety': { growth: 6, automation_risk_score: 2, note: 'Public-safety roles have low automation risk because physical presence, authority, and public trust are core to the job.' },
  'Public Works': { growth: 7, automation_risk_score: 3, note: 'Public-works engineering is protected by local infrastructure delivery, approvals, and site accountability.' },
  'Program Management': { growth: 6, automation_risk_score: 4, note: 'Program roles are AI-assisted for reporting and coordination but remain dependent on field context, stakeholders, and delivery ownership.' },
  'Farm Operations': { growth: 6, automation_risk_score: 3, note: 'Farm operations are physical and local, so AI mostly augments planning, monitoring, and advisory rather than replacing the role.' },
  'Dairy Operations': { growth: 6, automation_risk_score: 3, note: 'Dairy operations are protected by physical care, local operations, and quality control, with AI mainly supporting monitoring and logistics.' },
  'Allied Activities': { growth: 6, automation_risk_score: 3, note: 'Allied agriculture work is physical and site-specific, with AI mainly helping monitoring, diagnostics, and planning.' },
  'Field Advisory': { growth: 6, automation_risk_score: 4, note: 'Field advisory is AI-augmented by crop intelligence and decision support, but local trust and farmer engagement remain important.' },
  'Guest Services': { growth: 6, automation_risk_score: 5, note: 'Guest services use kiosks and chatbots, but hospitality still depends on human service, escalation, and experience quality.' },
  'Food Production': { growth: 7, automation_risk_score: 3, note: 'Food production roles are protected by physical craft and kitchen execution, with AI mainly helping menus, costing, and planning.' },
  Housekeeping: { growth: 6, automation_risk_score: 3, note: 'Housekeeping is physical and location-bound, so AI mainly affects scheduling, checklists, and inspection workflows.' },
  'Food & Beverage Operations': { growth: 6, automation_risk_score: 4, note: 'Food and beverage operations are AI-assisted in demand planning and rostering, but service and operations leadership remain human-led.' },
  'Travel Operations': { growth: 5, automation_risk_score: 6, note: 'Travel operations are exposed to online booking, itinerary generation, and customer-service automation; premium advisory and local expertise are safer.' },
  'Healthcare Operations': { growth: 7, automation_risk_score: 4, note: 'Healthcare operations are AI-assisted through scheduling, billing, and bed/capacity management, but local execution and accountability remain important.' },
  'Clinical Research': { growth: 8, automation_risk_score: 3, note: 'Clinical research is AI-augmented for monitoring and document review, but protocol execution, site engagement, and compliance keep risk lower.' },
  'Pharma Manufacturing': { growth: 7, automation_risk_score: 4, note: 'Pharma manufacturing uses automation, but regulated production, validation, and quality processes keep the role resilient.' },
  'Pharmacy': { growth: 7, automation_risk_score: 4, note: 'Pharmacy is partially exposed through e-pharmacy and dispensing systems, but licensed judgment and patient interaction keep risk moderate.' },
  'Category Management': { growth: 7, automation_risk_score: 5, note: 'Category management is AI-assisted through pricing, assortment, and demand analytics, but commercial judgment and vendor decisions remain important.' },
  Merchandising: { growth: 6, automation_risk_score: 5, note: 'Merchandising is AI-assisted through planning and trend analytics, while vendor, store, and market judgment remain useful.' },
  'Inventory Operations': { growth: 6, automation_risk_score: 7, note: 'Inventory operations are exposed to demand forecasting, automated replenishment, scanning, and warehouse-management systems.' },
  'E-commerce Operations': { growth: 6, automation_risk_score: 7, note: 'Marketplace operations are exposed to listing automation, catalog enrichment, repricing, reporting, and workflow bots.' },
}

const keywordExposureRules = [
  { test: /data entry/, values: { growth: 2, automation_risk_score: 9, note: 'Data-entry work is among the most exposed because OCR, forms, workflow bots, and validation models can automate much of the task flow.' } },
  { test: /cashier/, values: { growth: 4, automation_risk_score: 8, note: 'Cashier work is exposed to self-checkout, UPI/digital payments, POS automation, and automated reconciliation.' } },
  { test: /accounts payable|accounts receivable/, values: { growth: 4, automation_risk_score: 8, note: 'AP/AR roles are exposed to invoice capture, reconciliation, reminders, payment workflows, and ERP automation.' } },
  { test: /non-voice|claims processing|kyc operations/, values: { growth: 4, automation_risk_score: 8, note: 'Document-heavy processing roles are exposed to OCR, KYC automation, rules engines, and AI-assisted exception handling.' } },
  { test: /voice process|customer support executive/, values: { growth: 4, automation_risk_score: 8, note: 'Tier-1 support and voice processes are exposed to chatbots, voice bots, knowledge-base retrieval, and automated ticket resolution.' } },
  { test: /content writer|content marketing|content creator/, values: { growth: 4, automation_risk_score: 8, note: 'Routine content work is highly exposed to generative AI drafting, rewriting, summarization, translation, and creative variants.' } },
  { test: /graphic designer/, values: { growth: 4, automation_risk_score: 8, note: 'Graphic design is exposed to generative image tools and automated layout variants; brand judgment and art direction are safer.' } },
  { test: /video editor|animation artist/, values: { growth: 5, automation_risk_score: 7, note: 'Video and animation work is exposed to AI editing, generation, cleanup, and templating tools; storytelling and direction remain differentiators.' } },
  { test: /travel consultant/, values: { growth: 4, automation_risk_score: 7, note: 'Travel consulting is exposed to online booking, itinerary generation, and travel chatbots; complex/premium travel advisory is safer.' } },
  { test: /executive assistant|office administrator|government clerk/, values: { growth: 4, automation_risk_score: 7, note: 'Administrative coordination is exposed to scheduling, document, email, meeting-summary, and workflow automation.' } },
  { test: /school teacher|pre-primary teacher|college lecturer|tutor/, values: { growth: 6, automation_risk_score: 4, note: 'Teaching is augmented by AI tutors and content generation, but human mentoring, trust, and classroom context keep risk moderate.' } },
  { test: /doctor|medical officer|staff nurse/, values: { growth: 8, automation_risk_score: 2, note: 'Clinical roles are AI-augmented but protected by care delivery, accountability, empathy, and regulated professional judgment.' } },
  { test: /electrician|plumber|welder|technician|mechanic|chef/, values: { growth: 7, automation_risk_score: 3, note: 'Physical skilled work is comparatively protected; AI mostly improves diagnostics, planning, training, and scheduling.' } },
]

function categoryFromScore(score) {
  if (score <= 3) return 'NON_METRO_HEAVY'
  if (score <= 6) return 'MIXED'
  return 'METRO_HEAVY'
}

function tuneProfile(category, family, skill) {
  const profile = { ...categoryProfiles[category] }
  if (['Engineering', 'Data & Analytics', 'AI & Machine Learning', 'Infrastructure & Cloud', 'Security'].includes(family)) {
    profile.tech = Math.min(10, profile.tech + 1)
    profile.remote = Math.min(9, profile.remote + 1)
  }
  if (['Skilled Trades', 'Field Service', 'Production Operations', 'Warehouse Operations', 'Delivery Operations', 'Store Operations', 'Clinical Care', 'Public Safety'].includes(family)) {
    profile.remote = Math.max(0, profile.remote - 2)
  }
  if (['Sales', 'Sales & Relationship Management'].includes(family)) {
    profile.metro = Math.max(4, profile.metro - 1)
  }
  if (skill === 'SENIOR_SPECIALIST') {
    profile.metro = Math.min(10, profile.metro + 1)
    profile.remote = Math.min(9, profile.remote + 1)
  }
  return profile
}

function applyExposureModel(profile, category, role, family) {
  const familyRule = familyExposureRules[family]
  if (familyRule) {
    Object.assign(profile, familyRule)
  }

  const roleKey = role.toLowerCase()
  const keywordRule = keywordExposureRules.find(({ test }) => test.test(roleKey))
  if (keywordRule) {
    Object.assign(profile, keywordRule.values)
  }

  if (!profile.automation_risk_score) {
    profile.automation_risk_score = Math.min(8, Math.max(2, Math.round((profile.tech * 0.35) + ((10 - profile.growth) * 0.45))))
  }

  if (category === 'Agriculture & Allied' && profile.tech <= 4) {
    profile.automation_risk_score = Math.min(profile.automation_risk_score, 4)
  }

  return profile
}

function rationale(category, role, family, profile, sector) {
  return {
    metro_rationale: `${role} jobs in India are typically found across ${profile.locations}. The metro score reflects how much this function is concentrated in tier-1 corporate clusters versus tier-2/3, industrial, district, or rural markets.`,
    sector_rationale: `This role maps to ${sector}; hiring is usually organized through ${category} employers and the ${family.toLowerCase()} function, with education and experience requirements varying by seniority.`,
    scores_rationale: profile.note ?? `Tech adoption is ${profile.tech}/10, remote feasibility is ${profile.remote}/10, growth outlook is ${profile.growth}/10, and automation risk is ${profile.automation_risk_score}/10 based on task repeatability, physical presence, regulation, digitization, and India demand patterns.`,
  }
}

const rows = []
for (const [category, roles] of Object.entries(categoryRoles)) {
  const sector = sectorByCategory[category]
  for (const [role, family, skill, education] of roles) {
    const profile = tuneProfile(category, family, skill)
    applyExposureModel(profile, category, role, family)
    const override = roleOverrides[role] ?? {}
    Object.assign(profile, override)
    const copy = rationale(category, role, family, profile, sector)
    rows.push({
      occupation_title: role,
      job_category: category,
      job_role: role,
      industry_type: category,
      job_family: family,
      india_sector: sector,
      metro_category: categoryFromScore(profile.metro),
      metro_score: profile.metro,
      india_skill_level: skill,
      india_education_band: education,
      tech_adoption_score: profile.tech,
      remote_work_score: profile.remote,
      growth_outlook_score: profile.growth,
      ...(profile.automation_risk_score ? { automation_risk_score: profile.automation_risk_score } : {}),
      scoring_model_version: '2026.10-v1',
      scoring_model_updated_at: '2026-10-14',
      scoring_evidence_basis: ['ILO GenAI occupational exposure 2025', 'WEF Future of Jobs 2025', 'Layoffs.fyi role-family signals', 'NCS 2025 demand benchmark'],
      ...copy,
      ...(override.scores_rationale ? { scores_rationale: override.scores_rationale } : {}),
    })
  }
}

const taxonomy = Object.entries(categoryRoles).map(([job_category, roles]) => ({
  job_category,
  functions: Array.from(new Set(roles.map(([, family]) => family))).sort(),
  job_roles: roles.map(([role]) => role),
}))

fs.writeFileSync('data/sample_occupations.jsonl', `${rows.map((row) => JSON.stringify(row)).join('\n')}\n`)
fs.writeFileSync('data/job_categories.json', `${JSON.stringify(taxonomy, null, 2)}\n`)
console.log(`Generated ${rows.length} job roles across ${taxonomy.length} job categories.`)

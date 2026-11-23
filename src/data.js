// Pick-lists for the job search. Everything is a dropdown: roles, and locations grouped by country.

export const roleGroups = [
  ['Software and IT', ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Mobile App Developer', 'iOS Developer', 'Android Developer', 'DevOps Engineer', 'Site Reliability Engineer', 'Cloud Engineer', 'Cloud Architect', 'Solutions Architect', 'Software Architect', 'QA Engineer', 'Test Automation Engineer', 'Embedded Software Engineer', 'Game Developer', 'Blockchain Developer', 'Security Engineer', 'Cybersecurity Analyst', 'Penetration Tester', 'Network Engineer', 'Systems Administrator', 'Database Administrator', 'IT Support Specialist', 'Technical Support Engineer', 'Engineering Manager', 'Technical Program Manager', 'Web Developer', 'WordPress Developer', 'Salesforce Developer', 'SAP Consultant']],
  ['Data and AI', ['Data Analyst', 'Data Scientist', 'Data Engineer', 'Machine Learning Engineer', 'AI Engineer', 'Business Intelligence Analyst', 'Analytics Engineer', 'Research Scientist', 'NLP Engineer', 'Computer Vision Engineer', 'Statistician', 'Quantitative Analyst', 'Data Architect', 'MLOps Engineer', 'Prompt Engineer']],
  ['Product and design', ['Product Manager', 'Product Owner', 'Project Manager', 'Program Manager', 'Scrum Master', 'Business Analyst', 'UX Designer', 'UI Designer', 'Product Designer', 'UX Researcher', 'Graphic Designer', 'Visual Designer', 'Interaction Designer', 'Motion Designer', 'Design Manager']],
  ['Marketing and content', ['Digital Marketing Manager', 'Marketing Manager', 'SEO Specialist', 'Content Writer', 'Copywriter', 'Content Strategist', 'Social Media Manager', 'Community Manager', 'Growth Marketer', 'Performance Marketing Manager', 'Email Marketing Specialist', 'Brand Manager', 'Public Relations Specialist', 'Marketing Analyst', 'Product Marketing Manager', 'Technical Writer', 'Video Editor', 'Photographer', 'Journalist', 'Editor']],
  ['Sales and business', ['Sales Representative', 'Account Executive', 'Sales Development Representative', 'Business Development Manager', 'Account Manager', 'Customer Success Manager', 'Sales Manager', 'Inside Sales Representative', 'Pre-Sales Engineer', 'Retail Sales Associate', 'Real Estate Agent', 'Insurance Agent', 'Procurement Specialist', 'Partnerships Manager']],
  ['Finance and accounting', ['Accountant', 'Financial Analyst', 'Auditor', 'Tax Consultant', 'Bookkeeper', 'Investment Banking Analyst', 'Credit Analyst', 'Risk Analyst', 'Financial Controller', 'Payroll Specialist', 'Actuary', 'Investment Analyst', 'Compliance Officer', 'Treasury Analyst', 'Loan Officer']],
  ['People and administration', ['Human Resources Manager', 'Recruiter', 'Talent Acquisition Specialist', 'HR Generalist', 'Learning and Development Specialist', 'Office Manager', 'Executive Assistant', 'Administrative Assistant', 'Receptionist', 'Data Entry Clerk', 'Operations Manager', 'Office Administrator']],
  ['Operations and supply chain', ['Operations Analyst', 'Supply Chain Manager', 'Logistics Coordinator', 'Warehouse Manager', 'Procurement Manager', 'Inventory Planner', 'Production Manager', 'Quality Assurance Manager', 'Quality Control Inspector', 'Process Engineer', 'Demand Planner', 'Fleet Manager', 'Store Manager', 'Facilities Manager']],
  ['Customer service', ['Customer Service Representative', 'Customer Support Specialist', 'Call Center Agent', 'Technical Support Specialist', 'Client Services Manager', 'Help Desk Technician']],
  ['Engineering', ['Mechanical Engineer', 'Electrical Engineer', 'Civil Engineer', 'Chemical Engineer', 'Industrial Engineer', 'Manufacturing Engineer', 'Structural Engineer', 'Electronics Engineer', 'Aerospace Engineer', 'Biomedical Engineer', 'Environmental Engineer', 'Petroleum Engineer', 'Hardware Engineer', 'Robotics Engineer', 'Automotive Engineer', 'Project Engineer', 'Site Engineer', 'Architect', 'Quantity Surveyor', 'Mining Engineer']],
  ['Healthcare and science', ['Registered Nurse', 'Nurse Practitioner', 'Physician', 'Doctor', 'Pharmacist', 'Dentist', 'Physiotherapist', 'Medical Assistant', 'Lab Technician', 'Clinical Research Associate', 'Radiologic Technologist', 'Medical Coder', 'Healthcare Administrator', 'Psychologist', 'Therapist', 'Dietitian', 'Veterinarian', 'Biologist', 'Chemist', 'Research Associate']],
  ['Education', ['Teacher', 'Teaching Assistant', 'Professor', 'Lecturer', 'Tutor', 'Instructional Designer', 'School Principal', 'Academic Advisor', 'Curriculum Developer', 'ESL Teacher']],
  ['Legal and public sector', ['Lawyer', 'Paralegal', 'Legal Counsel', 'Legal Assistant', 'Policy Analyst', 'Social Worker', 'Program Coordinator', 'Grant Writer', 'NGO Project Officer']],
  ['Hospitality, trades and other', ['Chef', 'Cook', 'Restaurant Manager', 'Hotel Manager', 'Barista', 'Bartender', 'Event Planner', 'Travel Agent', 'Flight Attendant', 'Electrician', 'Plumber', 'Carpenter', 'Welder', 'HVAC Technician', 'Mechanic', 'Truck Driver', 'Delivery Driver', 'Security Guard', 'Fitness Trainer', 'Cleaner', 'Construction Worker', 'Machine Operator']]
];
export const roles = roleGroups.flatMap(([, list]) => list);

// [country, extra names a job post may use for it, [city, extra names...]...]
const places = [
  ['India', ['india'], [['Bengaluru', 'bangalore'], ['Mumbai', 'bombay'], ['Delhi', 'new delhi'], ['Hyderabad'], ['Chennai', 'madras'], ['Pune'], ['Kolkata', 'calcutta'], ['Ahmedabad'], ['Gurugram', 'gurgaon'], ['Noida']]],
  ['United States', ['united states', 'usa', 'us', 'u s'], [['New York', 'nyc'], ['San Francisco', 'bay area'], ['Los Angeles'], ['Chicago'], ['Seattle'], ['Austin'], ['Boston'], ['Atlanta'], ['Dallas'], ['Denver'], ['Washington DC', 'washington'], ['Miami']]],
  ['United Kingdom', ['united kingdom', 'uk', 'england', 'scotland', 'wales'], [['London'], ['Manchester'], ['Birmingham'], ['Edinburgh'], ['Bristol'], ['Leeds']]],
  ['Canada', ['canada'], [['Toronto'], ['Vancouver'], ['Montreal', 'montréal'], ['Calgary'], ['Ottawa']]],
  ['Australia', ['australia'], [['Sydney'], ['Melbourne'], ['Brisbane'], ['Perth']]],
  ['Germany', ['germany', 'deutschland'], [['Berlin'], ['Munich', 'münchen'], ['Hamburg'], ['Frankfurt'], ['Cologne', 'köln']]],
  ['France', ['france'], [['Paris'], ['Lyon'], ['Toulouse']]],
  ['Netherlands', ['netherlands', 'nederland'], [['Amsterdam'], ['Rotterdam'], ['Utrecht']]],
  ['Spain', ['spain', 'españa'], [['Madrid'], ['Barcelona'], ['Valencia']]],
  ['Italy', ['italy', 'italia'], [['Milan', 'milano'], ['Rome', 'roma']]],
  ['Ireland', ['ireland'], [['Dublin']]],
  ['Switzerland', ['switzerland'], [['Zurich', 'zürich'], ['Geneva']]],
  ['Sweden', ['sweden'], [['Stockholm']]],
  ['Poland', ['poland'], [['Warsaw'], ['Krakow', 'kraków']]],
  ['Portugal', ['portugal'], [['Lisbon']]],
  ['Singapore', ['singapore'], []],
  ['United Arab Emirates', ['united arab emirates', 'uae'], [['Dubai'], ['Abu Dhabi']]],
  ['Saudi Arabia', ['saudi arabia'], [['Riyadh']]],
  ['Pakistan', ['pakistan'], [['Karachi'], ['Lahore'], ['Islamabad']]],
  ['Bangladesh', ['bangladesh'], [['Dhaka']]],
  ['Sri Lanka', ['sri lanka'], [['Colombo']]],
  ['Philippines', ['philippines'], [['Manila']]],
  ['Indonesia', ['indonesia'], [['Jakarta']]],
  ['Malaysia', ['malaysia'], [['Kuala Lumpur']]],
  ['Japan', ['japan'], [['Tokyo'], ['Osaka']]],
  ['South Korea', ['south korea', 'korea'], [['Seoul']]],
  ['China', ['china'], [['Shanghai'], ['Beijing'], ['Shenzhen']]],
  ['Hong Kong', ['hong kong'], []],
  ['New Zealand', ['new zealand'], [['Auckland']]],
  ['Brazil', ['brazil', 'brasil'], [['São Paulo', 'sao paulo'], ['Rio de Janeiro']]],
  ['Mexico', ['mexico', 'méxico'], [['Mexico City', 'ciudad de méxico']]],
  ['Argentina', ['argentina'], [['Buenos Aires']]],
  ['South Africa', ['south africa'], [['Johannesburg'], ['Cape Town']]],
  ['Nigeria', ['nigeria'], [['Lagos']]],
  ['Kenya', ['kenya'], [['Nairobi']]],
  ['Egypt', ['egypt'], [['Cairo']]]
];

export const remoteLocation = {id: 'remote', label: 'Remote (work from anywhere)', query: 'Remote', remote: true, match: []};

export const locationGroups = places.map(([country, names, cities]) => {
  const countryEntry = {id: country, label: 'All of ' + country, query: country, remote: false, match: [country, ...names]};
  const cityEntries = cities.map(([city, ...alts]) => ({id: city + ', ' + country, label: city, query: city + ', ' + country, remote: false, match: [city, ...alts]}));
  return [country, [countryEntry, ...cityEntries]];
});

const locationIndex = new Map([[remoteLocation.id, remoteLocation], ...locationGroups.flatMap(([, list]) => list.map(l => [l.id, l]))]);
export const findLocation = id => locationIndex.get(id);
export const defaultLocation = 'India';

// Pick the closest role to a CV from the headline and first lines.
export function suggestRole(cv) {
  const head = cv.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 12).join(' ').toLowerCase();
  const full = cv.toLowerCase();
  let best = '', score = 0;
  for (const role of roles) {
    const r = role.toLowerCase();
    let s = head.includes(r) ? 10 : 0;
    const words = r.split(/\s+/);
    s += words.filter(w => w.length > 3 && head.includes(w)).length;
    if (full.includes(r)) s += 3;
    if (s > score) { score = s; best = role; }
  }
  return score >= 3 ? best : '';
}

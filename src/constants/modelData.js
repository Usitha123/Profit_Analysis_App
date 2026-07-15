export const MKT_CHANNELS = [
  { id: 'social', label: 'Social Media Ads', cost: 340, enrollments: 4, active: true },
  { id: 'local', label: 'Local Flyers', cost: 120, enrollments: 2, active: true },
  { id: 'referral', label: 'Referral Bonus', cost: 200, enrollments: 3, active: true },
  { id: 'open', label: 'Open House', cost: 180, enrollments: 2, active: false },
  { id: 'seo', label: 'SEO / Website', cost: 150, enrollments: 1, active: false },
  { id: 'partners', label: 'Local Partners', cost: 100, enrollments: 2, active: false },
];

export const ROADMAP = [
  {
    phase: 'Planning & Licensing',
    time: 'Months 1–3',
    actions: 'Licensing, zoning, business plan',
    cost: 2500,
  },
  {
    phase: 'Facility Setup',
    time: 'Months 2–5',
    actions: 'Renovation, furniture, equipment',
    cost: 28000,
  },
  {
    phase: 'Staff Hiring & Training',
    time: 'Months 4–6',
    actions: 'Recruit, train, policies',
    cost: 6000,
  },
  {
    phase: 'Pre-Enrolment',
    time: 'Months 5–7',
    actions: 'Marketing, tours, registration',
    cost: 3000,
  },
  {
    phase: 'Operations Launch',
    time: 'Month 7',
    actions: 'Open doors, first children',
    cost: 2000,
  },
  {
    phase: 'Growth & Expansion',
    time: 'Months 8–12',
    actions: 'Scale cohorts, hire more',
    cost: 5000,
  },
];

export const DEP_ASSETS = [
  { id: 'renovation', label: 'Renovation & Build-out', cost: 35000, life: 15 },
  { id: 'furniture', label: 'Furniture & Fixtures', cost: 12000, life: 8 },
  { id: 'playground', label: 'Playground Equipment', cost: 8000, life: 10 },
  { id: 'kitchen', label: 'Kitchen Equipment', cost: 6000, life: 7 },
  { id: 'it', label: 'IT & Security Systems', cost: 4000, life: 5 },
  { id: 'vehicles', label: 'Centre Vehicle', cost: 15000, life: 10 },
];

export const AGE_GROUPS = [
  { id: 'infant', label: 'Infant (0–12 mo)', ratio: 4, rate: 65, color: '#5b9bd5' },
  { id: 'toddler', label: 'Toddler (12–24 mo)', ratio: 5, rate: 55, color: '#70ad47' },
  { id: 'preschool', label: 'Pre-School (2–4 yr)', ratio: 8, rate: 45, color: '#ffc000' },
  { id: 'schoolage', label: 'School-Age (5–12 yr)', ratio: 12, rate: 35, color: '#ed7d31' },
];

export const FIXED_COSTS = [
  { id: 'rent', label: 'Rent / Mortgage', value: 4200 },
  { id: 'utilities', label: 'Utilities & Internet', value: 850 },
  { id: 'insurance', label: 'Insurance', value: 1100 },
  { id: 'admin', label: 'Admin Salaries', value: 4500 },
  { id: 'supplies', label: 'Classroom Supplies', value: 600 },
  { id: 'maintenance', label: 'Maintenance', value: 400 },
];

export const TUITION_RATE = 1100;
export const ENROLMENT_CAPACITY = 60;
export const OPERATING_WEEKS = 48;

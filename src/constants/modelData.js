export const MKT_CHANNELS = [
  { id: 'social', label: 'Social media ads', cost: 18000, enrollments: 8, active: true },
  { id: 'referral', label: 'Referral rewards', cost: 9000, enrollments: 5, active: true },
  { id: 'openhouse', label: 'Open-day events', cost: 12000, enrollments: 4, active: true },
  { id: 'partners', label: 'School and employer partners', cost: 7000, enrollments: 3, active: false },
  { id: 'flyers', label: 'Flyers and local boards', cost: 5000, enrollments: 2, active: false },
];

export const ROADMAP = [
  { phase: 'Phase 0 - Planning', time: 'Months -6 to -3', actions: 'Registration, licensing, lease signed, bank account opened', cost: 50000, color: '#3d6ea5' },
  { phase: 'Phase 1 - Build-out', time: 'Months -3 to 0', actions: 'Renovation, furniture, security, playground, staff hired', cost: 3200000, color: '#3f7d5c' },
  { phase: 'Phase 2 - Launch', time: 'Months 1-3', actions: 'Grand opening, open days, first 30 enrolments', cost: 350000, color: '#c98a1f' },
  { phase: 'Phase 3 - Growth', time: 'Months 4-12', actions: 'Scale to 60+ children, full activity calendar', cost: 200000, color: '#8a4a86' },
  { phase: 'Phase 4 - Expansion', time: 'Year 2+', actions: 'Reach 90-child capacity, evaluate a second site', cost: 200000, color: '#c0574f' },
];

export const DEP_ASSETS = [
  { id: 'reno', label: 'Renovation and interior design', cost: 800000, life: 10 },
  { id: 'furniture', label: 'Furniture, cots, chairs, shelving', cost: 450000, life: 7 },
  { id: 'cctv', label: 'CCTV and access control', cost: 180000, life: 5 },
  { id: 'education', label: 'Educational equipment and toys', cost: 350000, life: 5 },
  { id: 'kitchen', label: 'Kitchen equipment and appliances', cost: 200000, life: 7 },
  { id: 'it', label: 'IT infrastructure', cost: 250000, life: 3 },
  { id: 'playground', label: 'Outdoor playground equipment', cost: 400000, life: 7 },
  { id: 'branding', label: 'Signage and branding', cost: 80000, life: 5 },
];

export const NON_DEPRECIABLE_OUTLAY = [
  { id: 'legal', label: 'Legal, licensing, and registration', cost: 120000 },
  { id: 'launch', label: 'Initial marketing launch campaign', cost: 200000 },
  { id: 'reserve', label: 'Working capital reserve (3 months)', cost: 370000 },
];

export const AGE_GROUPS = [
  { id: 'infant', label: 'Infants (0-12 mo)', ratio: 3, rate: 26000, color: '#5b9bd5' },
  { id: 'toddler', label: 'Toddlers (1-2 yr)', ratio: 5, rate: 30000, color: '#70ad47' },
  { id: 'preschool', label: 'Pre-school (2-4 yr)', ratio: 8, rate: 34000, color: '#ffc000' },
  { id: 'schoolage', label: 'School-age (5-12 yr)', ratio: 12, rate: 34000, color: '#ed7d31' },
];

export const STAFF_ROLES = [
  { id: 'manager', label: 'Manager / admin', salary: 46000, required: 1, note: 'Fixed operating role' },
  { id: 'teacher', label: 'Lead teacher / coordinator', salary: 34000, required: 0, note: 'Driven by pre-school and school-age ratios' },
  { id: 'baby', label: 'Baby caretaker', salary: 26000, required: 0, note: 'Driven by infant ratio' },
  { id: 'helper', label: 'Nursery helper', salary: 30000, required: 0, note: 'Driven by toddler ratio' },
  { id: 'security', label: 'Security', salary: 28000, required: 1, note: 'Research separately if outsourced' },
];

export const STAFFING_REFERENCE = [
  { icon: 'account-tie-outline', label: 'Manager salaries', value: 'Small centres typically budget around Rs. 46,000 per month for admin coverage.' },
  { icon: 'human-male-board', label: 'Lead teachers', value: 'A practical planning floor is Rs. 34,000 per month per lead teacher or coordinator.' },
  { icon: 'baby-face-outline', label: 'Baby caretakers', value: 'Infant care roles usually sit closer to Rs. 26,000 per month.' },
  { icon: 'shield-account-outline', label: 'Security coverage', value: 'Treat security as a separate cost line even if it is contracted rather than hired.' },
];

export const COST_REFERENCE = [
  { icon: 'home-city-outline', label: 'Rent', value: 'Surveyed centres averaged about Rs. 68,000 per month, with a wide spread by location and size.' },
  { icon: 'flash-outline', label: 'Utilities', value: 'Utilities often land around Rs. 17,500 per month in the baseline case.' },
  { icon: 'bullhorn-outline', label: 'Marketing', value: 'Social media and referrals dominate. Newspaper spend is usually not a starter-channel priority.' },
  { icon: 'book-open-page-variant-outline', label: 'Educational supplies', value: 'A realistic planning band is about Rs. 200-300 per child per month.' },
  { icon: 'puzzle-outline', label: 'Activity materials', value: 'Wear and replenishment for toys, puzzles, and sports gear usually sits around Rs. 140-190 per child.' },
  { icon: 'wrench-outline', label: 'Maintenance', value: 'Cleaning, repairs, and contingency generally need Rs. 180-240 per child per month.' },
];

export const FIXED_COST_RANGES = [
  { id: 'rent', label: 'Rent', min: 50000, max: 90000 },
  { id: 'utilities', label: 'Utilities', min: 10000, max: 25000 },
  { id: 'insurance', label: 'Insurance and other', min: 7500, max: 20000 },
  { id: 'marketing', label: 'Marketing', min: 5000, max: 30000 },
  { id: 'activities', label: 'Activities (monthly)', min: 0, max: 25000 },
];

export const PER_CHILD_COST_RANGES = [
  { id: 'food', label: 'Food and supplies', min: 250, max: 350 },
  { id: 'education', label: 'Educational supplies', min: 200, max: 300 },
  { id: 'activity', label: 'Activity materials', min: 140, max: 190 },
  { id: 'maintenance', label: 'Maintenance and contingency', min: 180, max: 240 },
];

export const BREAKDOWN_COLORS = ['#3d6ea5', '#2f8f83', '#c98a1f', '#8a4a86', '#c0574f', '#6f8f3f'];

export const TUITION_RATE = 35000;
export const ENROLMENT_CAPACITY = 90;
export const OPERATING_WEEKS = 4;

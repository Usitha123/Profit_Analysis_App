import { CHART_PALETTE } from './theme';

export const MKT_CHANNELS = [
  { id: 'social', label: 'Social media ads', cost: 18000, enrollments: 8, active: true },
  { id: 'referral', label: 'Referral rewards', cost: 9000, enrollments: 5, active: true },
  { id: 'openhouse', label: 'Open-day events', cost: 12000, enrollments: 4, active: true },
  { id: 'partners', label: 'School and employer partners', cost: 7000, enrollments: 3, active: false },
  { id: 'flyers', label: 'Flyers and local boards', cost: 5000, enrollments: 2, active: false },
];

// Marketing mix used inside Break-even tab. Weights split the total marketing budget across channels.
export const BE_MKT_CHANNELS = [
  { id: 'social', label: 'Facebook and Instagram ads', weight: 9000, reach: '92% of surveyed centres' },
  { id: 'whatsapp', label: 'WhatsApp / word of mouth', weight: 6000, reach: '83% of surveyed centres' },
  { id: 'flyers', label: 'Printed flyers and banners', weight: 4000, reach: '42% of surveyed centres' },
  { id: 'openday', label: 'Open days and events', weight: 2500, reach: '20-40 families per event' },
  { id: 'website', label: 'Website and blog', weight: 2000, reach: '300 visits/mo' },
  { id: 'seo', label: 'Google Business and SEO', weight: 1000, reach: '500 local searches/mo' },
  { id: 'hr', label: 'Corporate HR tie-ups', weight: 500, reach: 'Targeted B2B reach' },
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
  { id: 'infant', label: 'Infants (below 2 yrs)', ratio: 3, rate: 26000, color: CHART_PALETTE[0], min: 0, max: 15, default: 5 },
  { id: 'toddler', label: 'Toddlers (2-3 yrs)', ratio: 4, rate: 30000, color: CHART_PALETTE[1], min: 0, max: 20, default: 7 },
  { id: 'preschool', label: 'Pre-schoolers (3-5 yrs)', ratio: 6, rate: 34000, color: CHART_PALETTE[2], min: 0, max: 25, default: 9 },
  { id: 'schoolage', label: 'School-age (5-10 yrs)', ratio: 10, rate: 34000, color: CHART_PALETTE[3], min: 0, max: 20, default: 7 },
];

// Age-group mix used by CO tab to size the staff floor for a target enrolment.
export const CO_AGE_MIX = { infant: 0.178, toddler: 0.267, preschool: 0.333, schoolage: 0.222 };

export const STAFF_ROLES = [
  { id: 'manager', label: 'Manager / admin', salary: 46000, required: 1, fixedCount: true, note: 'Fixed operating role' },
  { id: 'teacher', label: 'Lead teacher / coordinator', salary: 34000, required: 0, driver: 'teacher', note: 'Driven by pre-school and school-age ratios' },
  { id: 'baby', label: 'Baby caretaker', salary: 26000, required: 0, driver: 'infant', note: 'Driven by infant ratio' },
  { id: 'helper', label: 'Nursery helper', salary: 30000, required: 0, driver: 'toddler', note: 'Driven by toddler ratio' },
  { id: 'security', label: 'Security', salary: 28000, required: 1, fixedCount: true, note: 'Treat as a separate line even if outsourced' },
];

export const STAFFING_REFERENCE = [
  { icon: 'account-tie-outline', label: 'Manager salaries', value: 'Small centres typically budget around Rs. 46,000 per month for admin coverage.' },
  { icon: 'human-male-board', label: 'Lead teachers', value: 'A practical planning floor is Rs. 34,000 per month per lead teacher or coordinator.' },
  { icon: 'baby-face-outline', label: 'Baby caretakers', value: 'Infant care roles usually sit closer to Rs. 26,000 per month.' },
  { icon: 'shield-account-outline', label: 'Security coverage', value: 'Treat security as a separate cost line even if it is contracted rather than hired.' },
];

export const COST_REFERENCE = [
  { icon: 'home-city-outline', label: 'Rent', value: 'Surveyed centres averaged Rs. 68,000 per month; range Rs. 17,500 - 180,000.' },
  { icon: 'flash-outline', label: 'Utilities', value: 'Utilities often land around Rs. 17,500 per month, median Rs. 12,500.' },
  { icon: 'shield-check-outline', label: 'Insurance and other', value: 'Average Rs. 11,500 per month, median Rs. 7,500.' },
  { icon: 'bullhorn-outline', label: 'Marketing', value: 'Average Rs. 7,300 per month. 92% use social media, 83% word of mouth.' },
  { icon: 'party-popper', label: 'Activities', value: '100% run play group and field trips; 92% concerts; 58% workshops; 25% swimming.' },
  { icon: 'silverware-fork-knife', label: 'Food and supplies', value: 'Rs. 400-600 per child per month is a realistic band.' },
  { icon: 'book-open-page-variant-outline', label: 'Educational supplies', value: 'Rs. 200-300 per child per month.' },
  { icon: 'puzzle-outline', label: 'Activity materials', value: 'Rs. 140-190 per child per month for wear and replenishment.' },
  { icon: 'wrench-outline', label: 'Maintenance', value: 'Cleaning, repairs, and contingency generally need Rs. 180-240 per child.' },
];

export const FURNITURE_REFERENCE = [
  { label: 'Cot / crib', range: 'Rs. 12,000 - 18,000' },
  { label: 'Chair (set of 4)', range: 'Rs. 8,000 - 14,000' },
  { label: 'Activity table', range: 'Rs. 10,000 - 16,000' },
  { label: 'Storage shelving', range: 'Rs. 6,000 - 11,000' },
  { label: 'Play mats (set)', range: 'Rs. 4,000 - 7,500' },
  { label: 'Beds', range: 'Rs. 4,000 - 7,500' },
];

export const FIXED_COST_RANGES = [
  { id: 'rent', label: 'Rent', min: 55000, max: 85000 },
  { id: 'utilities', label: 'Utilities', min: 12500, max: 20000 },
  { id: 'insurance', label: 'Insurance and other', min: 7500, max: 15000 },
  { id: 'marketing', label: 'Marketing', min: 3500, max: 10000 },
  { id: 'activities', label: 'Activities amortised', min: 12000, max: 20000 },
];

export const PER_CHILD_COST_RANGES = [
  { id: 'food', label: 'Food and supplies', min: 400, max: 600 },
  { id: 'education', label: 'Educational supplies', min: 200, max: 300 },
  { id: 'activity', label: 'Activity materials', min: 140, max: 190 },
  { id: 'maintenance', label: 'Maintenance and contingency', min: 180, max: 240 },
];

// Activities used inside Break-even tab. Costs are annual; app divides by 12 for monthly fixed cost.
export const ACTIVITIES = [
  { id: 'play', label: 'Play group sessions', annual: 20000, defaultOn: true },
  { id: 'swim', label: 'Swimming', annual: 150000, defaultOn: false },
  { id: 'concert', label: 'Concerts', annual: 60000, defaultOn: true },
  { id: 'workshop', label: 'Workshops', annual: 40000, defaultOn: true },
  { id: 'field', label: 'Field trips', annual: 80000, defaultOn: true },
];

export const BREAKDOWN_COLORS = ['#3d6ea5', '#2f8f83', '#c98a1f', '#8a4a86', '#c0574f', '#6f8f3f', '#70ad47', '#ed7d31'];

export const TUITION_RATE = 11000;
export const ENROLMENT_CAPACITY = 90;
export const OPERATING_WEEKS = 4;

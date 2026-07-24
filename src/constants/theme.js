export const COLORS = {
  backgroundPrimary: '#ffffff',
  backgroundSecondary: '#f4f5f7',
  backgroundPage: '#f7f8fa',
  backgroundElevated: '#ffffff',
  backgroundInverse: '#0f172a',
  backgroundSuccess: '#eaf7ef',
  backgroundWarning: '#fdf3e0',
  backgroundDanger: '#fdecec',

  textPrimary: '#0d0f14',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  textOnDark: '#ffffff',
  textSuccess: '#137048',
  textWarning: '#a06510',
  textDanger: '#b91c1c',

  borderPrimary: '#e5e7eb',
  borderSecondary: '#eef0f3',
  borderTertiary: '#f3f4f6',
  borderSuccess: '#bbf0cd',
  borderWarning: '#f5d8a4',

  // solid accents per tab
  accentLP: '#2563eb',
  accentCO: '#0891b2',
  accentBE: '#059669',
  accentGR: '#d97706',
  accentPF: '#7c3aed',
  accentRed: '#dc2626',
  accentLime: '#cbf24e',
  shadow: 'rgba(15, 23, 42, 0.06)',
};

// Categorical chart palette. Fixed order - assign slot by series index, never
// cycle or recolour when a series is filtered out. Validated on a #ffffff
// surface for lightness band, chroma floor, colour-blind separation (worst
// adjacent pair dE 9.1 protan) and normal-vision separation (worst 19.6).
// Slots 2, 4 and 5 sit under 3:1 contrast, so every chart using this palette
// must carry visible text labels - never colour alone.
export const CHART_PALETTE = [
  '#2a78d6', // blue
  '#eb6834', // orange
  '#1baf7a', // aqua
  '#eda100', // yellow
  '#e87ba4', // magenta
  '#008300', // green
  '#4a3aa7', // violet
  '#e34948', // red
];

// soft pastel background tints paired with each accent (for cards / active pills)
export const ACCENT_TINTS = {
  lp: '#e6efff',
  co: '#dff5f7',
  be: '#e1f5eb',
  gr: '#fdecd0',
  pf: '#efe6fd',
};

export const RADIUS = {
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const SPACE = {
  xs: 6, sm: 10, md: 14, lg: 18, xl: 24, xxl: 32,
};

export const SIZES = {
  radius: RADIUS.lg,
  padding: 18,
  smallPadding: 12,
};

export const getAccent = (tabId) => {
  const accents = {
    lp: COLORS.accentLP, co: COLORS.accentCO, be: COLORS.accentBE,
    gr: COLORS.accentGR, pf: COLORS.accentPF,
  };
  return accents[tabId] || COLORS.accentLP;
};

export const getTint = (tabId) => ACCENT_TINTS[tabId] || ACCENT_TINTS.lp;

export const TAB_CONFIG = [
  { id: 'lp', label: 'Staffing',   heading: 'Staff optimisation', subtitle: 'Staffing decision model',   accent: COLORS.accentLP, tint: ACCENT_TINTS.lp },
  { id: 'co', label: 'Cost',       heading: 'Cost allocation',    subtitle: 'Cost decision model',       accent: COLORS.accentCO, tint: ACCENT_TINTS.co },
  { id: 'be', label: 'Break-Even', heading: 'Break-even point',   subtitle: 'Break-even decision model', accent: COLORS.accentBE, tint: ACCENT_TINTS.be },
  { id: 'gr', label: 'Growth',     heading: 'Growth projection',  subtitle: 'Growth decision model',     accent: COLORS.accentGR, tint: ACCENT_TINTS.gr },
  { id: 'pf', label: 'Profit',     heading: 'Profit and ROI',     subtitle: 'Profit decision model',     accent: COLORS.accentPF, tint: ACCENT_TINTS.pf },
];

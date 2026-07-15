export const COLORS = {
  backgroundPrimary: '#ffffff',
  backgroundSecondary: '#f6f2e8',
  backgroundPage: '#f1ece0',
  backgroundSuccess: '#eaf6ee',
  backgroundWarning: '#fdf3e2',
  textPrimary: '#232a2e',
  textSecondary: '#6b7178',
  textSuccess: '#2f7a4f',
  textWarning: '#a06a12',
  textDanger: '#a83e3e',
  borderPrimary: '#d8d1bf',
  borderSecondary: '#e6e0d0',
  borderTertiary: '#eee9dc',
  borderSuccess: '#bfe2ca',
  borderWarning: '#f0dcae',

  accentLP: '#3d6ea5',    // denim — staffing
  accentCO: '#2f8f83',    // teal — cost optimisation
  accentBE: '#3f7d5c',    // green — break-even
  accentGR: '#c98a1f',    // marigold — growth
  accentPF: '#8a4a86',    // plum — profit
  accentRed: '#c0574f',
};

export const SIZES = {
  radius: 10,
  padding: 16,
  smallPadding: 12,
};

export const getAccent = (tabId) => {
  const accents = {
    lp: COLORS.accentLP,
    co: COLORS.accentCO,
    be: COLORS.accentBE,
    gr: COLORS.accentGR,
    pf: COLORS.accentPF,
  };
  return accents[tabId] || COLORS.accentLP;
};

export const TAB_CONFIG = [
  { id: 'lp', label: 'Staffing', accent: COLORS.accentLP },
  { id: 'co', label: 'Cost', accent: COLORS.accentCO },
  { id: 'be', label: 'Break-Even', accent: COLORS.accentBE },
  { id: 'gr', label: 'Growth', accent: COLORS.accentGR },
  { id: 'pf', label: 'Profit', accent: COLORS.accentPF },
];

export const COLORS = {
  backgroundPrimary: '#ffffff',
  backgroundSecondary: '#f8fafc',
  backgroundPage: '#f4f7fb',
  backgroundElevated: '#ffffff',
  backgroundSuccess: '#ecfdf3',
  backgroundWarning: '#fff7ed',
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  textSuccess: '#166534',
  textWarning: '#c2410c',
  textDanger: '#b91c1c',
  borderPrimary: '#cbd5e1',
  borderSecondary: '#e2e8f0',
  borderTertiary: '#eef2f7',
  borderSuccess: '#bbf7d0',
  borderWarning: '#fed7aa',

  accentLP: '#2563eb',
  accentCO: '#0891b2',
  accentBE: '#059669',
  accentGR: '#d97706',
  accentPF: '#7c3aed',
  accentRed: '#dc2626',
  shadow: 'rgba(15, 23, 42, 0.08)',
};

export const SIZES = {
  radius: 12,
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

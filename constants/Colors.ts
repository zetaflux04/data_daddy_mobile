export const Colors = {
  primary: '#2563EB', // Electric royal blue
  primaryDark: '#1D4ED8',
  primaryDeep: '#0F172A',
  primaryLight: '#60A5FA',
  primaryGlow: 'rgba(37, 99, 235, 0.18)',
  primaryGlowStrong: 'rgba(37, 99, 235, 0.35)',

  accent: '#06B6D4', // Cyan
  accentGlow: 'rgba(6, 182, 212, 0.2)',
  emerald: '#10B981', // Success / Repaired
  emeraldLight: 'rgba(16, 185, 129, 0.12)',
  emeraldDark: '#059669',
  amber: '#F59E0B', // Pending / Warning
  amberLight: 'rgba(245, 158, 11, 0.12)',
  amberDark: '#D97706',
  purple: '#8B5CF6', // In progress / Parts delayed
  purpleLight: 'rgba(139, 92, 246, 0.12)',
  rose: '#EF4444', // Danger / Unpaid
  roseLight: 'rgba(239, 68, 68, 0.12)',

  gradients: {
    primary: ['#2563EB', '#1D4ED8'] as const,
    primaryDark: ['#1E3A8A', '#0F172A'] as const,
    electric: ['#3B82F6', '#1D4ED8', '#1E1B4B'] as const,
    accent: ['#06B6D4', '#2563EB'] as const,
    emerald: ['#10B981', '#059669'] as const,
    amber: ['#F59E0B', '#D97706'] as const,
    purple: ['#8B5CF6', '#6D28D9'] as const,
    card: ['#FFFFFF', '#F8FAFC'] as const,
    splash: ['#0B1120', '#1E3A8A', '#0F172A'] as const,
    badge: ['#EFF6FF', '#DBEAFE'] as const,
  },

  light: {
    text: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    background: '#F8FAFC',
    card: '#FFFFFF',
    cardElevated: '#FFFFFF',
    border: '#E2E8F0',
    borderSubtle: '#F1F5F9',
    tint: '#2563EB',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#2563EB',
    cardShadow: 'rgba(15, 23, 42, 0.06)',
  },
  dark: {
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    background: '#0B1120',
    card: '#131D31',
    cardElevated: '#1E293B',
    border: '#1E293B',
    borderSubtle: '#172033',
    tint: '#3B82F6',
    tabIconDefault: '#64748B',
    tabIconSelected: '#3B82F6',
    cardShadow: 'rgba(0, 0, 0, 0.3)',
  },
};

export default Colors;

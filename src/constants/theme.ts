export const COLORS = {
  // Backgrounds
  background: '#090D16',
  cardBackground: '#121826',
  cardBackgroundSecondary: '#182235',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  cardBorderActive: 'rgba(0, 122, 255, 0.35)',

  // Apple HIG System Accents
  primary: '#0A84FF', // iOS Blue (Dark Mode)
  primaryLight: '#47A3FF',
  primaryMuted: 'rgba(10, 132, 255, 0.15)',

  success: '#30D158', // iOS Green
  successMuted: 'rgba(48, 209, 88, 0.15)',

  warning: '#FFD60A', // iOS Yellow
  warningOrange: '#FF9F0A', // iOS Orange
  warningMuted: 'rgba(255, 159, 10, 0.15)',

  danger: '#FF453A', // iOS Red
  dangerMuted: 'rgba(255, 69, 58, 0.15)',

  purple: '#BF5AF2',
  purpleMuted: 'rgba(191, 90, 242, 0.15)',

  cyan: '#64D2FF',
  cyanMuted: 'rgba(100, 210, 255, 0.15)',

  // Typography
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textLight: '#CBD5E1',

  // UI Elements
  inputBackground: '#1A2338',
  inputBorder: 'rgba(255, 255, 255, 0.12)',
  divider: 'rgba(255, 255, 255, 0.08)',
  tabBarBackground: '#0D1322',
  tabBarBorder: 'rgba(255, 255, 255, 0.07)',
  tabBarActive: '#0A84FF',
  tabBarInactive: '#64748B',

  // Gradients
  gradientPrimary: ['#0A84FF', '#0055D4'] as const,
  gradientGreen: ['#30D158', '#1B9A38'] as const,
  gradientOrange: ['#FF9F0A', '#D47400'] as const,
  gradientRed: ['#FF453A', '#C91D12'] as const,
  gradientDarkCard: ['#141D2F', '#0E1524'] as const,
  gradientHero: ['#16233B', '#0E1726'] as const,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
};

export const SHADOWS = {
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  glowPrimary: {
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  glowSuccess: {
    shadowColor: '#30D158',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  glowWarning: {
    shadowColor: '#FF9F0A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
};

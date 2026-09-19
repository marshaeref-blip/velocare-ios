export const COLORS = {
  // Pure Clean Apple Light Backgrounds
  background: '#F4F6FA',
  backgroundSecondary: '#FFFFFF',
  cardBackground: '#FFFFFF',
  cardBackgroundSecondary: '#F8FAFC',
  cardBorder: '#E6EBF2',
  cardBorderActive: '#007AFF',

  // Apple HIG Light Accents
  primary: '#007AFF', // Apple iOS Blue
  primaryLight: '#47A3FF',
  primaryMuted: '#EBF4FF',

  success: '#34C759', // Apple Emerald Green
  successMuted: '#EAF8EE',

  warning: '#FF9500', // Apple Orange
  warningOrange: '#FF9500',
  warningMuted: '#FFF5E6',

  danger: '#FF3B30', // Apple Red
  dangerMuted: '#FDEEEB',

  purple: '#AF52DE',
  purpleMuted: '#F6ECFA',

  cyan: '#32ADE6',
  cyanMuted: '#EBF7FD',

  // Typography (Crisp Slate & Charcoal)
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textLight: '#64748B',

  // UI Elements
  inputBackground: '#F1F5F9',
  inputBorder: '#E2E8F0',
  divider: '#E2E8F0',
  tabBarBackground: '#FFFFFF',
  tabBarBorder: '#E5E9F0',
  tabBarActive: '#007AFF',
  tabBarInactive: '#94A3B8',

  // Gradients for Light Theme
  gradientPrimary: ['#007AFF', '#0055D4'] as const,
  gradientHero: ['#FFFFFF', '#F0F4FA'] as const,
  gradientCockpit: ['#1E293B', '#0F172A'] as const, // Sleek dark digital cockpit inside white card
  gradientCockpitLight: ['#FFFFFF', '#F6F8FC'] as const,
  gradientGreen: ['#34C759', '#248A3D'] as const,
  gradientOrange: ['#FF9500', '#D47400'] as const,
  gradientRed: ['#FF3B30', '#C91D12'] as const,
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
  xxl: 24,
  pill: 999,
};

export const SHADOWS = {
  subtle: {
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  glowPrimary: {
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  glowSuccess: {
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  glowDanger: {
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
};

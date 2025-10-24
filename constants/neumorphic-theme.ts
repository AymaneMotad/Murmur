export interface NeumorphicTheme {
  background: string;
  cardBackground: string;
  primaryText: string;
  secondaryText: string;
  accentColor: string;
  shadowColor: string;
  highlightColor: string;
  deleteBackground: string;
  deleteText: string;
  buttonBackground: string;
  buttonShadow: string;
}

export const lightTheme: NeumorphicTheme = {
  background: '#E8EDF3',
  cardBackground: '#F5F7FA',
  primaryText: '#2C3E50',
  secondaryText: '#7B8794',
  accentColor: '#3498DB',
  shadowColor: '#BDC3C7',
  highlightColor: '#FFFFFF',
  deleteBackground: '#E74C3C',
  deleteText: '#ffffff',
  buttonBackground: '#F5F7FA',
  buttonShadow: '#BDC3C7',
};

export const darkTheme: NeumorphicTheme = {
  background: '#1a1d2e',
  cardBackground: '#2C3E50',
  primaryText: '#ECF0F1',
  secondaryText: '#BDC3C7',
  accentColor: '#3498DB',
  shadowColor: '#0f1419',
  highlightColor: '#34495E',
  deleteBackground: '#E74C3C',
  deleteText: '#ffffff',
  buttonBackground: '#2C3E50',
  buttonShadow: '#0f1419',
};

// Neumorphic shadow configurations
export const neumorphicShadows = {
  // Raised elements (cards, buttons)
  raised: (theme: NeumorphicTheme) => ({
    shadowColor: theme.shadowColor,
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  }),
  
  // Pressed elements (inputs, pressed buttons)
  pressed: (theme: NeumorphicTheme) => ({
    shadowColor: theme.shadowColor,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: -4,
  }),
  
  // Medium raised elements
  medium: (theme: NeumorphicTheme) => ({
    shadowColor: theme.shadowColor,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6,
  }),
  
  // Small raised elements
  small: (theme: NeumorphicTheme) => ({
    shadowColor: theme.shadowColor,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  }),
};

// Typography scale
export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  },
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 26,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
  },
};

// Spacing system (8px base unit)
export const spacing = {
  xs: 4,    // 0.5 units
  sm: 8,    // 1 unit  
  md: 16,   // 2 units
  lg: 24,   // 3 units
  xl: 32,   // 4 units
  xxl: 48,  // 6 units
};

export const createNeumorphicStyles = (theme: NeumorphicTheme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: spacing.md,
    paddingTop: 60,
    paddingBottom: spacing.lg,
    backgroundColor: theme.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.buttonBackground,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    ...neumorphicShadows.medium(theme),
    borderWidth: 0,
  },
  backText: {
    color: theme.primaryText,
    fontSize: 18,
    fontWeight: '600' as const,
  },
  headerTitle: {
    color: theme.primaryText,
    ...typography.h2,
  },
  headerSubtitle: {
    color: theme.secondaryText,
    ...typography.bodySmall,
    marginTop: 2,
  },
  noteCard: {
    backgroundColor: theme.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.shadowColor,
    position: 'relative' as const,
    zIndex: 2,
    ...neumorphicShadows.raised(theme),
  },
  noteText: {
    color: theme.primaryText,
    ...typography.body,
  },
  noteDate: {
    color: theme.secondaryText,
    ...typography.caption,
  },
  drawingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.buttonBackground,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    ...neumorphicShadows.medium(theme),
  },
  emptyTitle: {
    color: theme.primaryText,
    ...typography.h1,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    color: theme.secondaryText,
    ...typography.body,
    textAlign: 'center' as const,
  },
  loadingText: {
    color: theme.secondaryText,
    ...typography.body,
  },
  
  // New comprehensive neumorphic components
  card: {
    backgroundColor: theme.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.shadowColor,
    ...neumorphicShadows.raised(theme),
  },
  
  button: {
    backgroundColor: theme.buttonBackground,
    borderRadius: 20,
    ...neumorphicShadows.medium(theme),
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  
  buttonPressed: {
    backgroundColor: theme.buttonBackground,
    borderRadius: 20,
    ...neumorphicShadows.pressed(theme),
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  
  input: {
    backgroundColor: theme.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.shadowColor,
    ...neumorphicShadows.pressed(theme),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  
  inputFocused: {
    backgroundColor: theme.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.accentColor,
    ...neumorphicShadows.pressed(theme),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  
  modal: {
    backgroundColor: theme.cardBackground,
    borderRadius: 28,
    ...neumorphicShadows.raised(theme),
    padding: spacing.xl,
  },
  
  listItem: {
    backgroundColor: theme.cardBackground,
    borderRadius: 16,
    marginBottom: spacing.md,
    ...neumorphicShadows.medium(theme),
    padding: spacing.md,
  },
  
  toggle: {
    backgroundColor: theme.buttonBackground,
    borderRadius: 20,
    ...neumorphicShadows.medium(theme),
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  
  toggleActive: {
    backgroundColor: theme.accentColor,
    borderRadius: 20,
    ...neumorphicShadows.medium(theme),
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
});

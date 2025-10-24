# Neumorphic Design System for Murmur App

## Design Philosophy
**"Soft Shadows, Hard Functionality"** - A modern neumorphic design system that combines tactile, soft visual elements with clear functionality and excellent usability.

## Core Design Principles

### 1. Neumorphism
- **Raised Elements**: Cards, buttons, and interactive elements appear to "float" above the surface
- **Pressed Elements**: Input fields and active states appear "pressed into" the surface
- **Soft Shadows**: Multiple shadow layers create depth without harsh edges
- **Rounded Corners**: Consistent 20px radius for all major UI elements

### 2. Color System

#### Light Theme
```css
/* Primary Colors */
--background: #E8EDF3          /* Soft blue-gray background */
--card-background: #F5F7FA     /* Lighter card surface */
--primary-text: #2C3E50        /* Dark blue-gray text */
--secondary-text: #7B8794       /* Medium gray for secondary info */
--accent: #3498DB              /* Blue accent for highlights */

/* Neumorphic Shadows */
--shadow-color: #BDC3C7        /* Soft gray shadows */
--highlight-color: #FFFFFF     /* White highlights */

/* Interactive States */
--delete-bg: #E74C3C           /* Red for delete actions */
--button-bg: #F5F7FA          /* Button background */
```

#### Dark Theme
```css
/* Primary Colors */
--background: #1a1d2e           /* Deep dark background */
--card-background: #2C3E50     /* Darker card surface */
--primary-text: #ECF0F1        /* Light gray text */
--secondary-text: #BDC3C7       /* Medium gray for secondary info */
--accent: #3498DB              /* Blue accent (consistent) */

/* Neumorphic Shadows */
--shadow-color: #0f1419        /* Deep black shadows */
--highlight-color: #34495E     /* Dark gray highlights */

/* Interactive States */
--delete-bg: #E74C3C           /* Red for delete actions */
--button-bg: #2C3E50          /* Button background */
```

### 3. Typography Scale
```css
/* Headers */
--h1: 28px, weight: 700, color: primary-text
--h2: 24px, weight: 600, color: primary-text
--h3: 20px, weight: 600, color: primary-text

/* Body Text */
--body-large: 18px, weight: 400, color: primary-text
--body: 16px, weight: 400, color: primary-text
--body-small: 14px, weight: 400, color: secondary-text

/* Captions */
--caption: 12px, weight: 500, color: secondary-text
```

### 4. Spacing System
```css
/* Base Unit: 8px */
--space-xs: 4px    /* 0.5 units */
--space-sm: 8px    /* 1 unit */
--space-md: 16px   /* 2 units */
--space-lg: 24px   /* 3 units */
--space-xl: 32px   /* 4 units */
--space-xxl: 48px   /* 6 units */
```

### 5. Component Specifications

#### Cards
```css
.card {
  background: var(--card-background);
  border-radius: 20px;
  border: 1px solid var(--shadow-color);
  box-shadow: 
    8px 8px 16px var(--shadow-color),
    -8px -8px 16px var(--highlight-color);
  padding: 20px;
  margin: 12px 0;
}
```

#### Buttons
```css
.button {
  background: var(--button-background);
  border-radius: 20px;
  border: none;
  box-shadow: 
    4px 4px 8px var(--shadow-color),
    -4px -4px 8px var(--highlight-color);
  padding: 12px 24px;
  min-height: 44px;
}

.button:active {
  box-shadow: 
    inset 2px 2px 4px var(--shadow-color),
    inset -2px -2px 4px var(--highlight-color);
}
```

#### Input Fields
```css
.input {
  background: var(--background);
  border-radius: 16px;
  border: 1px solid var(--shadow-color);
  box-shadow: 
    inset 4px 4px 8px var(--shadow-color),
    inset -4px -4px 8px var(--highlight-color);
  padding: 16px;
  font-size: 16px;
  color: var(--primary-text);
}
```

### 6. Animation Guidelines

#### Entrance Animations
- **Staggered Cards**: 100ms delay between each card
- **Duration**: 600ms with cubic-bezier easing
- **Effects**: Fade-in + slide-up + scale (0.95 → 1.0)

#### Interactive Animations
- **Button Press**: Scale to 0.98 with 150ms duration
- **Card Hover**: Subtle shadow increase
- **Swipe Actions**: Smooth 250ms transitions

### 7. Accessibility

#### Contrast Ratios
- **Primary Text**: 7:1 (AAA compliant)
- **Secondary Text**: 4.5:1 (AA compliant)
- **Interactive Elements**: 3:1 minimum

#### Touch Targets
- **Minimum Size**: 44px × 44px
- **Recommended**: 48px × 48px
- **Spacing**: 8px minimum between targets

### 8. Implementation Guidelines

#### React Native Specifics
```typescript
// Shadow configuration for iOS
shadowColor: theme.shadowColor,
shadowOffset: { width: 8, height: 8 },
shadowOpacity: 0.6,
shadowRadius: 16,
elevation: 12, // Android elevation
```

#### Theme Switching
```typescript
const [isDarkMode, setIsDarkMode] = useState(false);
const currentTheme = isDarkMode ? darkTheme : lightTheme;
const styles = createNeumorphicStyles(currentTheme);
```

### 9. Component Library

#### Core Components
- **NeumorphicCard**: Base card with neumorphic styling
- **NeumorphicButton**: Interactive button with press states
- **NeumorphicInput**: Text input with inset styling
- **NeumorphicToggle**: Theme switcher with smooth transitions
- **NeumorphicList**: Scrollable list with staggered animations

#### Layout Components
- **NeumorphicContainer**: Main app container
- **NeumorphicHeader**: App header with navigation
- **NeumorphicModal**: Overlay with neumorphic styling
- **NeumorphicTabBar**: Bottom navigation with raised tabs

### 10. Design Tokens

```typescript
export const designTokens = {
  colors: {
    light: lightTheme,
    dark: darkTheme
  },
  spacing: {
    xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48
  },
  typography: {
    h1: { fontSize: 28, fontWeight: '700' },
    h2: { fontSize: 24, fontWeight: '600' },
    body: { fontSize: 16, fontWeight: '400' }
  },
  shadows: {
    raised: { offset: 8, blur: 16, opacity: 0.6 },
    pressed: { offset: 4, blur: 8, opacity: 0.3 }
  }
};
```

## Implementation Prompt for AI Agents

```
Implement a comprehensive neumorphic design system for a React Native app with the following specifications:

1. **Design Philosophy**: "Soft Shadows, Hard Functionality" - tactile, modern UI with clear usability
2. **Theme System**: Light and dark themes with seamless switching
3. **Color Palette**: Soft blue-grays for light theme, deep dark blues for dark theme
4. **Typography**: Clean sans-serif with proper hierarchy (28px h1, 16px body, 12px captions)
5. **Spacing**: 8px base unit system (4px, 8px, 16px, 24px, 32px, 48px)
6. **Components**: Cards, buttons, inputs, toggles, lists with neumorphic styling
7. **Animations**: Staggered entrances, smooth transitions, press feedback
8. **Accessibility**: 44px minimum touch targets, proper contrast ratios
9. **Shadows**: Multiple shadow layers for depth (8px offset, 16px blur, 0.6 opacity)
10. **Implementation**: TypeScript interfaces, theme context, reusable components

Create a complete design system with:
- Theme configuration files
- Component library with neumorphic styling
- Animation system with staggered effects
- Accessibility compliance
- TypeScript type definitions
- Usage examples and documentation

Focus on creating a cohesive, professional design that feels modern and tactile while maintaining excellent usability and accessibility standards.
```

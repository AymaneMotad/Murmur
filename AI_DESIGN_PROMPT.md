# AI Design System Implementation Prompt

## Project Overview
You are implementing a **Neumorphic Design System** for a React Native voice recording app called "Murmur". The app currently has a notes screen with basic functionality, and you need to apply this design system across the entire application.

## Design System Name: "Soft Shadows, Hard Functionality"

### Core Design Philosophy
Create a modern, tactile interface that combines:
- **Soft, raised visual elements** that appear to float above the surface
- **Clear functionality** with excellent usability and accessibility
- **Smooth animations** that feel natural and responsive
- **Dual theme support** (light and dark) with seamless switching

## Visual Design Specifications

### Color System

#### Light Theme
```typescript
const lightTheme = {
  background: '#E8EDF3',        // Soft blue-gray background
  cardBackground: '#F5F7FA',     // Lighter card surface for contrast
  primaryText: '#2C3E50',        // Dark blue-gray text
  secondaryText: '#7B8794',      // Medium gray for secondary info
  accent: '#3498DB',             // Blue accent for highlights
  shadowColor: '#BDC3C7',        // Soft gray shadows
  highlightColor: '#FFFFFF',    // White highlights
  deleteBackground: '#E74C3C',   // Red for delete actions
  buttonBackground: '#F5F7FA',   // Button background
};
```

#### Dark Theme
```typescript
const darkTheme = {
  background: '#1a1d2e',         // Deep dark background
  cardBackground: '#2C3E50',      // Darker card surface
  primaryText: '#ECF0F1',         // Light gray text
  secondaryText: '#BDC3C7',      // Medium gray for secondary info
  accent: '#3498DB',              // Blue accent (consistent)
  shadowColor: '#0f1419',         // Deep black shadows
  highlightColor: '#34495E',      // Dark gray highlights
  deleteBackground: '#E74C3C',    // Red for delete actions
  buttonBackground: '#2C3E50',    // Button background
};
```

### Neumorphic Styling Rules

#### Cards (Raised Elements)
```typescript
const cardStyle = {
  backgroundColor: theme.cardBackground,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: theme.shadowColor,
  shadowColor: theme.shadowColor,
  shadowOffset: { width: 8, height: 8 },
  shadowOpacity: 0.6,
  shadowRadius: 16,
  elevation: 12,
};
```

#### Buttons (Interactive Elements)
```typescript
const buttonStyle = {
  backgroundColor: theme.buttonBackground,
  borderRadius: 20,
  shadowColor: theme.shadowColor,
  shadowOffset: { width: 4, height: 4 },
  shadowOpacity: 0.8,
  shadowRadius: 8,
  elevation: 6,
  // Press state: inset shadows
};
```

#### Input Fields (Pressed Elements)
```typescript
const inputStyle = {
  backgroundColor: theme.background,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: theme.shadowColor,
  // Inset shadows for pressed effect
  shadowColor: theme.shadowColor,
  shadowOffset: { width: 4, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: -4, // Negative for inset effect
};
```

## Typography System

### Font Scale
- **H1**: 28px, weight: 700, color: primary-text
- **H2**: 24px, weight: 600, color: primary-text  
- **H3**: 20px, weight: 600, color: primary-text
- **Body Large**: 18px, weight: 400, color: primary-text
- **Body**: 16px, weight: 400, color: primary-text
- **Body Small**: 14px, weight: 400, color: secondary-text
- **Caption**: 12px, weight: 500, color: secondary-text

### Font Family
- **Primary**: System default (San Francisco on iOS, Roboto on Android)
- **Fallback**: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif

## Spacing System (8px Base Unit)

```typescript
const spacing = {
  xs: 4,    // 0.5 units
  sm: 8,    // 1 unit  
  md: 16,   // 2 units
  lg: 24,   // 3 units
  xl: 32,   // 4 units
  xxl: 48,  // 6 units
};
```

## Animation Specifications

### Entrance Animations
- **Staggered Cards**: 100ms delay between each card
- **Duration**: 600ms with cubic-bezier easing
- **Effects**: Fade-in (0 → 1) + slide-up (30px → 0) + scale (0.95 → 1.0)
- **Easing**: `Easing.out(Easing.cubic)` for smooth, natural motion

### Interactive Animations
- **Button Press**: Scale to 0.98 with 150ms duration
- **Card Hover**: Subtle shadow increase (8px → 12px offset)
- **Swipe Actions**: Smooth 250ms transitions with spring physics
- **Theme Switch**: 300ms crossfade between themes

## Component Requirements

### Core Components to Implement

1. **NeumorphicCard**
   - Base card component with neumorphic styling
   - Supports raised and pressed states
   - Configurable shadow intensity
   - Touch feedback animations

2. **NeumorphicButton**
   - Primary, secondary, and accent variants
   - Press state with inset shadows
   - Loading state with spinner
   - Disabled state styling

3. **NeumorphicInput**
   - Text input with inset styling
   - Focus states with subtle glow
   - Error states with red accent
   - Placeholder styling

4. **NeumorphicToggle**
   - Theme switcher with smooth transitions
   - On/off states with different shadows
   - Animated thumb movement
   - Accessibility labels

5. **NeumorphicList**
   - Scrollable list with staggered animations
   - Pull-to-refresh with neumorphic spinner
   - Empty state with illustration
   - Loading skeletons

6. **NeumorphicModal**
   - Overlay with backdrop blur
   - Raised modal content
   - Smooth slide-up animation
   - Gesture-based dismissal

### Layout Components

1. **NeumorphicContainer**
   - Main app container with theme background
   - Safe area handling
   - Status bar configuration

2. **NeumorphicHeader**
   - App header with navigation
   - Theme toggle button
   - Back button with neumorphic styling
   - Title and subtitle hierarchy

3. **NeumorphicTabBar**
   - Bottom navigation with raised tabs
   - Active state indicators
   - Smooth tab switching animations
   - Badge support for notifications

## Accessibility Requirements

### Contrast Ratios
- **Primary Text**: 7:1 (AAA compliant)
- **Secondary Text**: 4.5:1 (AA compliant)  
- **Interactive Elements**: 3:1 minimum
- **Focus Indicators**: 3:1 minimum

### Touch Targets
- **Minimum Size**: 44px × 44px
- **Recommended**: 48px × 48px
- **Spacing**: 8px minimum between targets
- **Focus Rings**: Visible focus indicators

### Screen Reader Support
- **Semantic Labels**: All interactive elements
- **State Announcements**: Button states, form validation
- **Navigation**: Logical tab order
- **Content Structure**: Proper heading hierarchy

## Implementation Tasks

### Phase 1: Core System
1. Create theme configuration files
2. Implement base neumorphic styles
3. Set up theme context and switching
4. Create design token system

### Phase 2: Component Library
1. Build core neumorphic components
2. Implement animation system
3. Add accessibility features
4. Create component documentation

### Phase 3: App Integration
1. Apply design system to existing screens
2. Implement navigation with neumorphic styling
3. Add theme persistence
4. Test across different devices

### Phase 4: Polish & Optimization
1. Performance optimization
2. Animation fine-tuning
3. Accessibility testing
4. Cross-platform consistency

## Technical Requirements

### React Native Specifics
```typescript
// Shadow configuration for iOS
shadowColor: theme.shadowColor,
shadowOffset: { width: 8, height: 8 },
shadowOpacity: 0.6,
shadowRadius: 16,
elevation: 12, // Android elevation
```

### TypeScript Interfaces
```typescript
interface NeumorphicTheme {
  background: string;
  cardBackground: string;
  primaryText: string;
  secondaryText: string;
  accent: string;
  shadowColor: string;
  highlightColor: string;
  deleteBackground: string;
  deleteText: string;
  buttonBackground: string;
  buttonShadow: string;
}
```

### Performance Considerations
- Use `useNativeDriver: true` for all animations
- Implement proper memoization for theme switching
- Optimize shadow rendering for Android
- Use FlatList for large lists with neumorphic items

## Success Criteria

### Visual Quality
- ✅ Cards clearly visible and clickable
- ✅ Smooth, natural animations
- ✅ Consistent neumorphic styling
- ✅ Professional, modern appearance

### Usability
- ✅ Intuitive navigation
- ✅ Clear visual hierarchy
- ✅ Responsive touch feedback
- ✅ Accessible to all users

### Technical
- ✅ TypeScript type safety
- ✅ Performance optimized
- ✅ Cross-platform consistency
- ✅ Maintainable code structure

## Deliverables

1. **Complete Design System**
   - Theme configuration
   - Component library
   - Animation system
   - Documentation

2. **App-wide Implementation**
   - All screens styled with neumorphic design
   - Consistent navigation
   - Theme switching functionality
   - Accessibility compliance

3. **Documentation**
   - Component usage examples
   - Design system guidelines
   - Accessibility standards
   - Performance best practices

## Notes
- The current notes screen has basic neumorphic styling but needs better contrast
- Focus on making cards clearly visible and clickable
- Ensure all interactive elements have proper touch feedback
- Maintain the existing functionality while enhancing the visual design
- Test thoroughly on both iOS and Android devices

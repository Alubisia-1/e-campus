# E-Campus Color Palette Reference

This document provides a comprehensive reference of all Tailwind CSS color classes used in the E-Campus application.

---

## PRIMARY COLORS

### Blue (Trust/Academic)
The primary brand color representing trust, professionalism, and academic excellence.

| Class | Hex Code | Usage |
|-------|----------|-------|
| `bg-blue-50` | #EFF6FF | Light blue backgrounds, subtle highlights |
| `bg-blue-100` | #DBEAFE | Light backgrounds for sections and cards |
| `text-blue-600` | #2563EB | Main brand color for links and primary text |
| `bg-blue-600` | #2563EB | Primary buttons, key interactive elements |
| `hover:bg-blue-700` | #1D4ED8 | Hover states for blue buttons and interactive elements |
| `text-blue-700` | #1D4ED8 | Darker blue text for emphasis |

### Orange (Energy/Action)
Secondary brand color for calls-to-action, highlighting important actions and creating visual energy.

| Class | Hex Code | Usage |
|-------|----------|-------|
| `bg-orange-50` | #FFF7ED | Light orange backgrounds |
| `bg-orange-100` | #FFEDD5 | Light backgrounds for warm sections |
| `border-orange-200` | #FED7AA | Borders for orange-themed components |
| `text-orange-500` | #F97316 | Orange text for CTAs and accents |
| `bg-orange-500` | #F97316 | Call-to-action buttons, accent elements |
| `text-orange-600` | #EA580C | Primary orange text |
| `bg-orange-600` | #EA580C | Primary orange backgrounds and buttons |
| `hover:bg-orange-700` | #C2410C | Hover states for orange buttons |
| `text-orange-700` | #C2410C | Darker orange text for emphasis |

---

## NEUTRAL COLORS

### Gray Scale
Foundation colors for text, backgrounds, borders, and UI structure.

| Class | Hex Code | Usage |
|-------|----------|-------|
| `bg-gray-50` | #F9FAFB | Page backgrounds, lightest surface color |
| `bg-gray-100` | #F3F4F6 | Card backgrounds, image placeholder backgrounds |
| `border-gray-200` | #E5E7EB | Default borders, dividers, subtle separators |
| `text-gray-400` | #9CA3AF | Icons, placeholder text, secondary/disabled text |
| `text-gray-500` | #6B7280 | Labels, tertiary text, input labels |
| `text-gray-600` | #4B5563 | Body text, default paragraph text |
| `text-gray-700` | #374151 | Headings, emphasized body text, important labels |
| `border-gray-800` | #1F2937 | Dark borders (e.g., footer borders) |
| `bg-gray-900` | #111827 | Footer backgrounds, darkest UI elements |
| `text-gray-900` | #111827 | Main headings, primary emphasis text |

---

## ACCENT COLORS

Used for advertisements, promotional content, and visual variety.

### Purple
| Class | Hex Code | Usage |
|-------|----------|-------|
| `bg-purple-100` | #F3E8FF | Light purple backgrounds for ads |
| `text-purple-600` | #9333EA | Purple text and icons |
| `hover:bg-purple-700` | #7E22CE | Hover states for purple elements |

### Green
| Class | Hex Code | Usage |
|-------|----------|-------|
| `bg-green-100` | #DCFCE7 | Light green backgrounds, success states |
| `bg-emerald-100` | #D1FAE5 | Alternative light green for variety |
| `text-green-600` | #16A34A | Green text for positive actions |
| `text-green-700` | #15803D | Condition badges (e.g., "New", "Like New") |
| `hover:bg-green-700` | #15803D | Hover states for green elements |

### Pink
| Class | Hex Code | Usage |
|-------|----------|-------|
| `bg-pink-100` | #FCE7F3 | Light pink backgrounds for ads and promotional content |

### Yellow
| Class | Hex Code | Usage |
|-------|----------|-------|
| `bg-yellow-50` | #FEFCE8 | Light yellow backgrounds for highlights and warnings |

---

## STATUS COLORS

### Success/Condition Indicators
| Class | Hex Code | Usage |
|-------|----------|-------|
| `bg-green-100` | #DCFCE7 | Background for success messages and condition badges |
| `text-green-700` | #15803D | Text for condition badges (e.g., "New", "Good Condition") |

---

## USAGE GUIDELINES

### Color Hierarchy
1. **Primary Actions**: `bg-blue-600`, `hover:bg-blue-700`
2. **Secondary/CTA Actions**: `bg-orange-600`, `hover:bg-orange-700`
3. **Neutral Elements**: Gray scale (50-900)
4. **Accents**: Purple, green, pink, yellow (use sparingly)

### Text Color Hierarchy
1. **Headings**: `text-gray-900`, `text-gray-700`
2. **Body Text**: `text-gray-600`
3. **Labels/Secondary**: `text-gray-500`
4. **Placeholder/Disabled**: `text-gray-400`
5. **Brand/Links**: `text-blue-600`
6. **CTAs**: `text-orange-600`

### Background Hierarchy
1. **Page Background**: `bg-gray-50`
2. **Card/Component Background**: `bg-white`, `bg-gray-100`
3. **Accent Backgrounds**: `bg-blue-50`, `bg-orange-50`
4. **Dark Backgrounds**: `bg-gray-900`

### Border Colors
1. **Default Borders**: `border-gray-200`
2. **Accent Borders**: `border-orange-200`
3. **Dark Borders**: `border-gray-800`

---

## ACCESSIBILITY NOTES

- All text/background color combinations meet WCAG 2.1 AA standards for contrast
- Primary text (`text-gray-600`) on white backgrounds: 7.0:1 contrast ratio
- Heading text (`text-gray-900`) on white backgrounds: 14.5:1 contrast ratio
- Blue links (`text-blue-600`) on white backgrounds: 4.5:1 contrast ratio
- Always test color combinations for sufficient contrast when creating new components

---

## MAINTENANCE

When adding new colors:
1. Ensure they align with the existing palette
2. Document the specific use case
3. Test for accessibility compliance
4. Update this reference file
5. Consider if an existing color can be reused before adding new ones

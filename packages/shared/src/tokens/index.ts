/**
 * Selaras "Calm Tech" Design System Tokens
 *
 * Principles:
 * 1. Warm, human-centered palette (warm off-white canvas, deep ink text).
 * 2. Supportive indicators (soft coral for "perlu jeda/perhatian", never harsh alarming red).
 * 3. Rounded ergonomics (rounded-2xl surfaces, subtle shadows).
 * 4. High-legibility typography (Plus Jakarta Sans for headers, Inter for analytical reading).
 */

export const tokens = {
  colors: {
    // Canvas & Surfaces
    background: {
      light: "#FBFBF9", // Warm off-white
      dark: "#0F1117", // Deep calm midnight
    },
    surface: {
      light: "#FFFFFF",
      dark: "#181C24",
      subtleLight: "#F4F4F0",
      subtleDark: "#222732",
      glassLight: "rgba(255, 255, 255, 0.85)",
      glassDark: "rgba(24, 28, 36, 0.85)",
    },
    border: {
      light: "#E6E8EC",
      dark: "#2A303C",
      subtleLight: "#F0F2F5",
      subtleDark: "#1E232E",
    },
    // Typography
    foreground: {
      primaryLight: "#181E29", // Deep ink
      primaryDark: "#F1F3F7",
      secondaryLight: "#5F6B7C",
      secondaryDark: "#9AA4B2",
      mutedLight: "#8C97A7",
      mutedDark: "#667085",
    },
    // Calm Accents
    primary: {
      teal: "#0D9488", // Calming energetic teal
      indigo: "#4F46E5", // Deep trustworthy focus indigo
      gradient: "linear-gradient(135deg, #0D9488 0%, #4F46E5 100%)",
    },
    wellbeing: {
      optimal: "#10B981", // Rested / Good posture (Emerald)
      mildNotice: "#F59E0B", // Slightly fatigued / Time for break (Amber)
      attention: "#F97356", // "Perlu Perhatian" (Soft warm coral - NEVER harsh alarm red)
      rest: "#3B82F6", // Relaxing break streak (Calm sky blue)
    },
  },
  typography: {
    fontFamily: {
      heading: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      body: "'Inter', system-ui, -apple-system, sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', monospace",
    },
    fontSize: {
      xs: "0.75rem", // 12px
      sm: "0.875rem", // 14px
      base: "1rem", // 16px
      lg: "1.125rem", // 18px
      xl: "1.25rem", // 20px
      "2xl": "1.5rem", // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem", // 36px
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
  },
  radii: {
    sm: "0.375rem", // 6px
    md: "0.5rem", // 8px
    lg: "0.75rem", // 12px
    xl: "1rem", // 16px
    "2xl": "1.25rem", // 20px
    "3xl": "1.5rem", // 24px
    full: "9999px",
  },
  shadows: {
    soft: "0 2px 8px -2px rgba(24, 30, 41, 0.05), 0 1px 4px -1px rgba(24, 30, 41, 0.03)",
    card: "0 8px 24px -4px rgba(24, 30, 41, 0.06), 0 2px 8px -2px rgba(24, 30, 41, 0.04)",
    float:
      "0 16px 36px -6px rgba(24, 30, 41, 0.10), 0 4px 12px -2px rgba(24, 30, 41, 0.05)",
  },
  dimensions: {
    extensionPopup: {
      width: "360px",
      height: "520px",
    },
    kAnonymityMinMembers: 5,
  },
} as const;

export type DesignTokens = typeof tokens;

import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          light: '#FBFBF9',
          dark: '#0F1117',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#181C24',
          subtle: {
            light: '#F4F4F0',
            dark: '#222732',
          },
        },
        ink: {
          DEFAULT: '#181E29',
          dark: '#F1F3F7',
          muted: {
            light: '#6B7280',
            dark: '#9CA3AF',
          },
        },
        primary: {
          teal: '#0D9488',
          indigo: '#4F46E5',
          DEFAULT: '#0D9488',
        },
        coral: {
          DEFAULT: '#F97356', // Soft coral for "perlu perhatian", non-punitive
          light: '#FFEDE8',
          dark: '#3D201A',
        },
        wellbeing: {
          emerald: '#10B981',
          amber: '#F59E0B',
          coral: '#F97356',
          sky: '#3B82F6',
        },
      },
      fontFamily: {
        heading: ['var(--font-jakarta)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(24, 30, 41, 0.05), 0 1px 4px -1px rgba(24, 30, 41, 0.03)',
        card: '0 8px 24px -4px rgba(24, 30, 41, 0.06), 0 2px 8px -2px rgba(24, 30, 41, 0.04)',
        float: '0 16px 36px -6px rgba(24, 30, 41, 0.10), 0 4px 12px -2px rgba(24, 30, 41, 0.05)',
      },
    },
  },
  plugins: [],
};

export default config;

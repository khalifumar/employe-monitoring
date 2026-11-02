import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './entrypoints/**/*.{html,ts,tsx}',
    './src/**/*.{html,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#FBFBF9',
        surface: {
          DEFAULT: '#FFFFFF',
          subtle: '#F4F4F0',
        },
        ink: {
          DEFAULT: '#181E29',
          muted: '#6B7280',
        },
        primary: {
          teal: '#0D9488',
          indigo: '#4F46E5',
          DEFAULT: '#0D9488',
        },
        coral: {
          DEFAULT: '#F97356', // Soft coral for "perlu perhatian", non-punitive
          light: '#FFEDE8',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(24, 30, 41, 0.05), 0 1px 4px -1px rgba(24, 30, 41, 0.03)',
        card: '0 8px 24px -4px rgba(24, 30, 41, 0.06), 0 2px 8px -2px rgba(24, 30, 41, 0.04)',
      },
    },
  },
  plugins: [],
};

export default config;

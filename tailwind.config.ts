import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'var(--font-firago)',
          'Noto Sans Georgian',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        firago: [
          'var(--font-firago)',
          'Noto Sans Georgian',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        brand: {
          primary: {
            DEFAULT: '#1E6AFF',
            hover: '#0F57E8',
            light: 'rgba(30, 106, 255, 0.10)',
            glow: 'rgba(30, 106, 255, 0.25)',
          },
          secondary: {
            DEFAULT: '#F5F5F5',
            hover: '#E8E8E8',
            light: 'rgba(245, 245, 245, 0.60)',
            glow: 'rgba(245, 245, 245, 0.80)',
          },
          navy: {
            DEFAULT: '#232323',
            light: '#3A3A3A',
            surface: '#1A1A1A',
          },
        },
        canvas: '#F5F5F5',
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F8F8F8',
          tertiary: '#EFEFEF',
          overlay: 'rgba(35, 35, 35, 0.55)',
        },
        text: {
          primary: '#232323',
          secondary: '#666666',
          tertiary: '#999999',
          inverse: '#FFFFFF',
        },
        border: {
          subtle: '#EBEBEB',
          medium: '#DEDEDE',
          focus: '#1E6AFF',
        },
        status: {
          active: {
            bg: '#E8F5EE',
            text: '#166534',
            dot: '#22C55E',
          },
          rest: {
            bg: '#FEF9EC',
            text: '#92400E',
            dot: '#F59E0B',
          },
          sick: {
            bg: '#FEE8E8',
            text: '#991B1B',
            dot: '#EF4444',
          },
        },
        danger: {
          DEFAULT: '#DC2626',
          light: '#FEE2E2',
          hover: '#FCA5A5',
          border: '#FECACA',
        },
        tag: {
          male: {
            bg: '#EEF3FF',
            text: '#1E3A8A',
          },
          female: {
            bg: '#FDF2F8',
            text: '#9D174D',
          },
          any: {
            bg: '#F5F5F5',
            text: '#4B5563',
          },
        },
        category: {
          management: '#0891B2',
          operations: '#16A34A',
          custom: '#7C3AED',
        },
        accent: {
          orange: '#FF6C41',
          teal: '#004F72',
        },
      },
      borderRadius: {
        xs: '6px',
        sm: '10px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        pill: '9999px',
      },
      boxShadow: {
        sm: '0 2px 6px rgba(0, 0, 0, 0.04)',
        md: '0 8px 24px -4px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)',
        lg: '0 20px 48px -8px rgba(0, 0, 0, 0.10), 0 4px 12px rgba(0, 0, 0, 0.05)',
        modal: '0 28px 64px -12px rgba(0, 0, 0, 0.18), 0 8px 24px rgba(0, 0, 0, 0.08)',
        glow: '0 4px 14px rgba(30, 106, 255, 0.25)',
      },
      maxWidth: {
        drawer: '620px',
      },
      screens: {
        'sidebar-mobile': { max: '900px' },
      },
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '6.5': '1.625rem',
        '7.5': '1.875rem',
        '8.5': '2.125rem',
        '9.5': '2.375rem',
      },
    },
  },
  plugins: [],
};

export default config;

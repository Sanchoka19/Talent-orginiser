import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
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
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        pill: '8px',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -4px rgba(0, 0, 0, 0.03)',
        modal: '0 20px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.06)',
        glow: '0 1px 3px rgba(30, 106, 255, 0.15)',
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
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        zoomIn95: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        slideInRight: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        fadeIn: 'fadeIn 0.2s ease-out',
        zoomIn: 'zoomIn95 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};

export default config;

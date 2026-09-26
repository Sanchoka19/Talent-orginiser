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
        marketing: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'sans-serif',
        ],
        display: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'sans-serif',
        ],
      },
      colors: {
        brand: {
          primary: {
            DEFAULT: 'rgb(var(--brand-primary-rgb, 30 106 255) / <alpha-value>)',
            hover: 'var(--brand-primary-hover, #0F57E8)',
            light: 'var(--brand-primary-light, rgba(30, 106, 255, 0.10))',
            glow: 'var(--brand-primary-glow, rgba(30, 106, 255, 0.25))',
          },
          secondary: {
            DEFAULT: 'var(--brand-secondary, #F5F5F5)',
            hover: 'var(--brand-secondary-hover, #E8E8E8)',
            light: 'var(--brand-secondary-light, rgba(245, 245, 245, 0.60))',
            glow: 'var(--brand-secondary-glow, rgba(245, 245, 245, 0.80))',
          },
          navy: {
            DEFAULT: 'var(--brand-navy, #232323)',
            light: 'var(--brand-navy-light, #3A3A3A)',
            surface: 'var(--brand-navy-surface, #1A1A1A)',
          },
        },
        canvas: 'rgb(var(--bg-canvas-rgb, 245 245 245) / <alpha-value>)',
        surface: {
          DEFAULT: 'rgb(var(--bg-surface-rgb, 255 255 255) / <alpha-value>)',
          secondary: 'rgb(var(--bg-surface-secondary-rgb, 248 248 248) / <alpha-value>)',
          tertiary: 'rgb(var(--bg-surface-tertiary-rgb, 239 239 239) / <alpha-value>)',
          overlay: 'var(--surface-overlay, rgba(35, 35, 35, 0.55))',
        },
        text: {
          primary: 'rgb(var(--color-text-primary-rgb, 35 35 35) / <alpha-value>)',
          secondary: 'rgb(var(--color-text-secondary-rgb, 102 102 102) / <alpha-value>)',
          tertiary: 'rgb(var(--color-text-tertiary-rgb, 153 153 153) / <alpha-value>)',
          inverse: 'rgb(var(--color-text-inverse-rgb, 255 255 255) / <alpha-value>)',
        },
        border: {
          subtle: 'rgb(var(--border-subtle-rgb, 235 235 235) / <alpha-value>)',
          medium: 'rgb(var(--border-medium-rgb, 222 222 222) / <alpha-value>)',
          focus: 'var(--brand-primary, #1E6AFF)',
        },
        status: {
          active: {
            bg: 'var(--status-active-bg, #E8F5EE)',
            text: 'var(--status-active-text, #166534)',
            dot: 'var(--status-active-dot, #22C55E)',
          },
          rest: {
            bg: 'var(--status-rest-bg, #FEF9EC)',
            text: 'var(--status-rest-text, #92400E)',
            dot: 'var(--status-rest-dot, #F59E0B)',
          },
          sick: {
            bg: 'var(--status-sick-bg, #FEE8E8)',
            text: 'var(--status-sick-text, #991B1B)',
            dot: 'var(--status-sick-dot, #EF4444)',
          },
        },
        danger: {
          DEFAULT: 'var(--danger-default, #DC2626)',
          light: 'var(--danger-light, #FEE2E2)',
          hover: 'var(--danger-hover, #B91C1C)',
          border: 'var(--danger-border, #FECACA)',
        },
        tag: {
          male: {
            bg: 'var(--tag-male-bg, #EEF3FF)',
            text: 'var(--tag-male-text, #1E3A8A)',
          },
          female: {
            bg: 'var(--tag-female-bg, #FDF2F8)',
            text: 'var(--tag-female-text, #9D174D)',
          },
          any: {
            bg: 'var(--tag-any-bg, #F5F5F5)',
            text: 'var(--tag-any-text, #4B5563)',
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

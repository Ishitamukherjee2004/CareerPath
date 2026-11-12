/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#090B14',
          secondary: '#101321',
          card: '#151827',
          hover: '#1E2238',
        },
        accent: {
          purple: '#8B5CF6',
          cyan: '#22D3EE',
          green: '#34D399',
        },
        text: {
          main: '#F8FAFC',
          muted: '#9CA3AF',
          dim: '#64748B',
        },
        border: {
          subtle: '#1E293B',
          glow: 'rgba(139, 92, 246, 0.3)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        }
      }
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: "#F8FAFC",
          panel: "#FFFFFF",
          border: "#E2E8F0",
          text: "#0F172A",
          dim: "#64748B",
          accent: "#4F46E5",
          highlight: "#EF4444",
        },
        safety: {
          green: "#10B981",
          yellow: "#F59E0B",
          orange: "#F97316",
          red: "#EF4444",
        }
      },
      fontFamily: {
        mono: ['Fira Code', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        pulseBorder: {
          '0%, 100%': { borderColor: 'rgba(239, 68, 68, 0.3)' },
          '50%': { borderColor: 'rgba(239, 68, 68, 1)' },
        },
        flash: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        typing: {
          from: { width: "0%" },
          to: { width: "100%" }
        }
      },
      animation: {
        pulseBorder: 'pulseBorder 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        flash: 'flash 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}

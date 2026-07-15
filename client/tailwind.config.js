import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        // ── Core brand ──────────────────────────────────────────────
        brand: {
          DEFAULT: '#6C63FF',   // electric indigo
          dark: '#4f46e5',
          darker: '#3730a3',
          light: '#EDE9FE',
        },
        // ── Gold accent for premium / CTAs ───────────────────────────
        accent: {
          DEFAULT: '#F5C542',
          dark: '#d4a017',
          darker: '#b8860b',
          light: '#FFF8DC',
        },
        // ── Deep navy for hero/navbar ──────────────────────────────
        navy: {
          DEFAULT: '#0f0c29',
          mid: '#302b63',
          light: '#24243e',
        },
        // ── Success ────────────────────────────────────────────────
        success: {
          DEFAULT: '#00e676',
          dark: '#00c853',
          darker: '#00a843',
          light: '#b9f6ca',
        },
        // ── Danger ─────────────────────────────────────────────────
        danger: {
          DEFAULT: '#ff5252',
          dark: '#d32f2f',
          darker: '#b71c1c',
          light: '#ffebee',
        },
        // ── Neutral surfaces ───────────────────────────────────────
        surface: '#FFFFFF',
        bg: '#F0F4FF',
        border: '#e2e8f0',
        txt: {
          primary: '#1a1a2e',
          secondary: '#4a5568',
          muted: '#a0aec0',
          onPrimary: '#FFFFFF',
        },
        // ── Dark mode ──────────────────────────────────────────────
        'dark-bg': '#090d16',
        'dark-surface': '#111827',
        'dark-surface2': '#1f2937',
        'dark-border': '#374151',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #090d16 0%, #111827 50%, #1f2937 100%)',
        'premium-gradient': 'linear-gradient(135deg, #6C63FF 0%, #a855f7 50%, #ec4899 100%)',
        'gold-gradient': 'linear-gradient(135deg, #f5c542 0%, #f09819 100%)',
        'card-gradient': 'linear-gradient(145deg, rgba(108,99,255,0.1) 0%, rgba(168,85,247,0.05) 100%)',
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(108, 99, 255, 0.4)',
        'glow-gold': '0 0 20px rgba(245, 197, 66, 0.4)',
        'glow-green': '0 0 20px rgba(0, 230, 118, 0.3)',
        'card-lift': '0 20px 60px rgba(108, 99, 255, 0.15)',
        'premium': '0 8px 32px rgba(108, 99, 255, 0.3)',
        'inner-glow': 'inset 0 0 20px rgba(108, 99, 255, 0.1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(108, 99, 255, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(108, 99, 255, 0.7), 0 0 60px rgba(108, 99, 255, 0.3)' },
        },
        glowPulseGold: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(245, 197, 66, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(245, 197, 66, 0.7), 0 0 60px rgba(245, 197, 66, 0.3)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
        spinSlow: {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        ring: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
      },
      animation: {
        'fadeIn': 'fadeIn 0.25s ease-out',
        'slideUp': 'slideUp 0.5s ease-out',
        'shimmer': 'shimmer 2.5s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float 5s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'glow-pulse-gold': 'glowPulseGold 2s ease-in-out infinite',
        'bounce-in': 'bounceIn 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
        'spin-slow': 'spinSlow 8s linear infinite',
        'gradient-shift': 'gradientShift 4s ease infinite',
        'count-up': 'countUp 0.5s ease-out',
        'ring': 'ring 1.5s cubic-bezier(0,0,0.2,1) infinite',
      },
    },
  },
  plugins: [typography],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        inter: ['matter', 'sans-serif'],
      },
      colors: {
        // bg-dark: Used for main background (body, containers)
        dark: {
          DEFAULT: '#000000', // Main background
        },
        // bg-gray-900: Used for cards, modals, form sections
        // bg-gray-800: Used for input backgrounds, dropdowns, skeletons
        // border-gray-800/700/600: Used for borders on cards, inputs, dropdowns
        // text-gray-400/300: Used for secondary text, muted labels
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db', // Muted text
          400: '#9ca3af', // Secondary text
          500: '#6b7280',
          600: '#0d0d0d', // Border, avatar border
          700: '#131313', // Border, hover backgrounds
          800: '#0A0A0A', // Input backgrounds, dropdowns
          900: '#0A0A0A', // Card backgrounds
        },
        // text-blue-400: Used for icons, highlights, links
        // bg-blue-600/700/900: Used for buttons, badges, status
        blue: {
          400: '#60a5fa', // Icon, highlight
          600: '#2563eb', // Button background
          700: '#1d4ed8', // Button hover
          900: '#1e3a8a', // Badge, status background
        },
        // bg-green-600/700/800/900: Used for paid status, success alerts
        green: {
          600: '#16a34a', // Success button
          700: '#15803d', // Success hover
          800: '#166534', // Paid status
          900: '#14532d', // Paid status background
        },
        // bg-yellow-300/400/600/700/900: Used for pending status, warning alerts
        yellow: {
          300: '#fde68a', // Light warning
          400: '#facc15', // Warning text
          600: '#ca8a04', // Warning button
          700: '#a16207', // Warning hover
          900: '#713f12', // Pending status background
        },
        // bg-red-600/700/900: Used for error, delete buttons
        red: {
          600: '#dc2626', // Error, delete button
          700: '#b91c1c', // Error hover
          900: '#7f1d1d', // Error background
        },
        // text-white: Used for main text on dark backgrounds
        white: '#ffffff', // Main text
      },
    },
  },
  plugins: [],
};

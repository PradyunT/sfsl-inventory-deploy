/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        // Renamed for clarity (optional, but good practice)
        'pulse-out-fade': {
          '0%': { transform: 'scale(1)', opacity: '0.5' },      // Start: Normal size, semi-transparent
          '100%': { transform: 'scale(1.2)', opacity: '0' },    // End: Scaled up, fully transparent
        }
      },
      animation: {
        // Use the new keyframe name and maybe adjust timing slightly
        'pulse-out-fade': 'pulse-out-fade 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}


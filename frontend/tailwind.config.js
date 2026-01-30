/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neo: {
          bg: '#e0e5ec',
          'bg-dark': '#181c24',
          shadow: {
            dark: '#a3b1c6',
            light: '#ffffff',
            'dark-mode-1': '#0a0c10',
            'dark-mode-2': '#262c38',
          },
          text: '#4a5568',
          'text-dark': '#e0e5ec',
          accent: '#667eea',
        },
      },
      boxShadow: {
        'neo-sm': '4px 4px 8px #a3b1c6, -4px -4px 8px #ffffff',
        'neo': '8px 8px 16px #a3b1c6, -8px -8px 16px #ffffff',
        'neo-lg': '12px 12px 24px #a3b1c6, -12px -12px 24px #ffffff',
        'neo-inset': 'inset 6px 6px 12px #a3b1c6, inset -6px -6px 12px #ffffff',
        'neo-inset-sm': 'inset 3px 3px 6px #a3b1c6, inset -3px -3px 6px #ffffff',
        'neo-dark': '8px 8px 16px #0a0c10, -8px -8px 16px #262c38',
        'neo-dark-inset': 'inset 6px 6px 12px #0a0c10, inset -6px -6px 12px #262c38',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}

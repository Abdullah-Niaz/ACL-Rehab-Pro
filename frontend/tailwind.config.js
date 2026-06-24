export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#2563EB',
          success: '#22C55E',
          warning: '#F59E0B',
          danger: '#EF4444',
          bg: '#F8FAFC'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif']
      },
      boxShadow: {
        premium: '0 8px 30px rgb(0 0 0 / 0.03)',
        soft: '0 2px 12px rgb(0 0 0 / 0.02)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.04)'
      }
    },
  },
  plugins: [],
};

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#e60023', // Pinterest Red
          primaryPressed: '#cc001f',
          ink: '#000000',
          inkSoft: '#211922',
          body: '#33332e',
          charcoal: '#262622',
          mute: '#62625b',
          ash: '#91918c',
          stone: '#c8c8c1',
          hairline: '#dadad3',
          hairlineSoft: '#e5e5e0',
          onSecondary: '#000000',
          secondaryBg: '#e5e5e0',
          secondaryPressed: '#c8c8c1',
          canvas: '#ffffff',
          surfaceSoft: '#fbfbf9',
          surfaceCard: '#f6f6f3',
          surfaceElevated: '#ffffff',
          onDark: '#ffffff',
          surfaceDark: '#262622',
          successDeep: '#103c25',
          successPale: '#c7f0da',
          error: '#9e0a0a',
          errorDeep: '#cc001f',
          focusOuter: '#435ee5',
          focusInner: '#ffffff',
          bg: '#fbfbf9' // Page background wash (Pinterest surfaceSoft)
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif']
      },
      boxShadow: {
        premium: 'none', // flat content
        soft: 'none', // flat content
        glass: 'none', // flat content
        ambient: '0 16px 32px rgba(38, 38, 34, 0.08)' // Modal scrim shadow (surface-dark based)
      },
      borderRadius: {
        'md': '16px',
        'lg': '32px'
      }
    },
  },
  plugins: [],
};

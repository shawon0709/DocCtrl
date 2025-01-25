import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        ghostwhite: '#F8F8FF',
        'rgb-241-245-249': 'rgb(241, 245, 249)',
      },
      transitionDuration: {
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
        '300': '300ms',
        '350': '350ms',
      },
      transitionProperty: {
        'height': 'height'
      },
      fontSize: {
        'xxs': '.5rem',   // Extreme Extra Small
        'xs': '.75rem',   // Extra Small
        'sm': '.875rem',  // Small
        'base': '1rem',   // Base
        'lg': '1.125rem', // Large
        'xl': '1.25rem',  // Extra Large
        '2xl': '1.5rem',  // 2X Large
        '3xl': '1.875rem',  // 2X Large
        '4xl': '2.25rem',  // 2X Large
        '5xl': '3rem',  // 2X Large
        '6xl': '3.75rem',  // 2X Large
        '7xl': '4.5rem',  // 2X Large
        '8xl': '6rem',  // 2X Large
        '9xl': '8rem',  // 2X Large
        // Add more custom sizes as needed
      },
    },
  },
  plugins: [],
};
export default config;

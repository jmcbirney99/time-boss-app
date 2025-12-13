import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Sage green - primary color (calm, meditative)
        sage: {
          50: '#f0f5f0',
          100: '#dce8dc',
          200: '#c5dbc3',
          300: '#a8c5a5',
          400: '#84a98c',
          DEFAULT: '#84a98c',
          500: '#6b8b73',
          600: '#567160',
          700: '#455a4d',
          800: '#394a40',
          900: '#2f3d35',
        },
        // Warm gray - secondary/neutral
        warm: {
          gray: '#9ca3af',
          light: '#d6d4d1',
        },
        // Coral - overflow/alert accent
        coral: {
          50: '#fef2f0',
          100: '#fbcbc2',
          200: '#f8a99b',
          DEFAULT: '#f4a89a',
          300: '#f4a89a',
          400: '#ef7b68',
          500: '#e85a45',
        },
        // Paper - backgrounds
        paper: {
          DEFAULT: '#fafaf9',
          dark: '#f5f5f4',
          border: '#e7e5e4',
        },
      },
    },
  },
  plugins: [],
};
export default config;

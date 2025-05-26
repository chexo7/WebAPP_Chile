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
        primary: "var(--primary-color)", // Using CSS variables
        "primary-hover": "var(--primary-hover)",
        accent: "var(--accent-color)",
        "accent-hover": "var(--accent-hover)",
        danger: "var(--danger-color)",
        "danger-hover": "var(--danger-hover)",
        "text-color": "var(--text-color)", // Renamed to avoid conflict with Tailwind's text-
        "light-text": "var(--light-text)",
        background: "var(--background)", // Renamed to avoid conflict
        "card-bg": "var(--card-bg)",
        "border-color": "var(--border-color)", // Renamed to avoid conflict
        "header-bg": "var(--header-bg)",
        "alt-row-bg": "var(--alt-row-bg)",
        "row-hover-bg": "var(--row-hover-bg)",
        "body-header-row-bg": "var(--body-header-row-bg)",
        "text-green": "var(--text-green)", // Specific text color
        "text-red": "var(--text-red)",     // Specific text color
        "text-orange": "var(--text-orange)", // Specific text color
      },
      fontFamily: {
        sans: ['Segoe UI', '-apple-system', 'BlinkMacSystemFont', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: "var(--radius)", // Default border radius
        md: "var(--radius)", // Default border radius for 'md' variant
      },
      boxShadow: {
        DEFAULT: "var(--shadow)",
      },
      transitionProperty: {
        DEFAULT: "all 0.3s ease",
      }
    },
  },
  plugins: [],
};
export default config;

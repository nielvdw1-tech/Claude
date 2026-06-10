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
        navy: {
          DEFAULT: "#0F1F3D",
          50: "#EEF1F6",
          100: "#D5DCE8",
          200: "#AAB9D1",
          300: "#7E96BA",
          400: "#5373A3",
          500: "#34508B",
          600: "#1F3766",
          700: "#152A50",
          800: "#0F1F3D",
          900: "#0A1529",
        },
        orange: {
          DEFAULT: "#F97316",
          light: "#FB923C",
          dark: "#C2540B",
        },
        offwhite: "#F9FAFB",
        ink: "#111827",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
        display: ["var(--font-playfair)", "ui-serif", "Georgia"],
      },
      boxShadow: {
        card: "0 4px 24px -8px rgba(15, 31, 61, 0.15)",
      },
    },
  },
  plugins: [],
};
export default config;

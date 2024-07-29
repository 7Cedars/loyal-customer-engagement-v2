import type { Config } from "tailwindcss";

// £NB: this is how to implement CUSTOM COLORS in customer app.
// read colour here from local storage... and then will be implemented throughout the app. -- will this be possible? 
// NB: dark theming not implemented for now. 
let accent = "#0f172a"
let base = "#f1f5f9"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        base: base,
        accent: accent, 
      }
    },
  },
  plugins: [],
};
export default config;

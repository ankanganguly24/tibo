import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { colors: { ink: "#0b0b0a", paper: "#f4f1ea", amber: "#f3a712", line: "#292824" }, fontFamily: { sans: ["var(--font-sans)"], mono: ["var(--font-mono)"] } } },
  plugins: [],
};
export default config;

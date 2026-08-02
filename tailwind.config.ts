import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // เปิดใช้งาน Dark Mode ด้วยการ toggle คลาส 'dark'
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
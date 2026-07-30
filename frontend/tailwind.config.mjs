/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx,html}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#10a37f",
        "primary-hover": "#1aae71",
        secondary: "#343541",
        "secondary-hover": "#4a4b59",
        bg: "#000000",
        "text-muted": "#8e8ea0",
        border: "rgba(255, 255, 255, 0.1)",
      },
    },
  },
  plugins: [],
};

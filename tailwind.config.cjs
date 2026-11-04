/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        line: "var(--line)",
        olive: "var(--olive)",
        brass: "var(--lime)",
        copper: "var(--red)",
        danger: "var(--danger)",
        success: "var(--success)",
        surface: "var(--surface)",
        "surface-raised": "var(--surface-raised)",
      },
      fontFamily: {
        display: "var(--display)",
        sans: "var(--body)",
      },
    },
  },
  plugins: [],
};
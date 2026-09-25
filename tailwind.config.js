/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Poppins", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        navy: "#101B3D",
        navy2: "#16234f",
        brand: {
          blue: "#2F6FED",
          bluedark: "#1E4FC4",
          orange: "#F5A524",
          green: "#12B981",
          purple: "#8B5CF6",
          pink: "#EC4899",
          red: "#EF4444",
        },
        bg: "var(--c-bg)",
        card: "var(--c-card)",
        border: "var(--c-border)",
        muted: "var(--c-muted)",
        ink: "var(--c-ink)",
      },
      borderRadius: {
        xl2: "16px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,27,61,0.04)",
      },
    },
  },
  plugins: [],
};

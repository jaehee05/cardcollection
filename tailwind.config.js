/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          mint: "#3FD0CB",
          mintDark: "#2DB6B1",
          purple: "#7C5FE6",
          gray: "#A9A5B5",
          grayLight: "#E9E7F0",
          bg: "#F5F3FA",
        },
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Apple SD Gothic Neo",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 4px 24px -8px rgba(80, 60, 140, 0.18)",
      },
    },
  },
  plugins: [],
};

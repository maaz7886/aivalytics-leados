// tailwind.config.cjs
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,tsx,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0A6F3D", // deep professional green as chosen
        "primary-50": "#E6F4EA",
        "primary-100": "#CDE9D5",
        "primary-200": "#9CD3AB",
        "primary-300": "#6BBD81",
        "primary-400": "#3AA757",
        "primary-500": "#0A6F3D",
        "primary-600": "#08602F",
        "primary-700": "#064F22",
        "primary-800": "#043D14",
        "primary-900": "#022E07",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
      },
    },
  },
  plugins: [],
};

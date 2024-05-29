import { THEME } from "./src/consts";

/** @type {import('tailwindcss/types/config').PluginCreator} */
const shadowPlugin = ({ matchUtilities, theme }) => {
  return matchUtilities(
    {
      "text-shadow": (value) => ({
        textShadow: value,
      }),
    },
    { values: theme("textShadow") }
  );
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        ...THEME,
      },
      fontFamily: {
        app: ["Share Tech Mono", "monospace"],
        title: ["Major Mono Display"],
      },
    },
    textShadow: {
      sm: "0 1px 2px var(--tw-shadow-color)",
      DEFAULT: "0 2px 4px var(--tw-shadow-color)",
      lg: "0 8px 16px var(--tw-shadow-color)",
    },
  },
  plugins: [
    shadowPlugin,
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
};

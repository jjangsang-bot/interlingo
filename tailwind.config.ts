import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1f2933",
        paper: "#fbfaf7",
        mint: "#24a68a",
        coral: "#e9705f",
        plum: "#7b5ea7"
      }
    }
  },
  plugins: []
};

export default config;


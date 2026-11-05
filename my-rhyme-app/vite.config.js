import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Su GitHub Pages il sito è servito da /<nome-repo>/: la workflow di deploy
// passa il percorso in BASE_PATH. In locale resta "/".
export default defineConfig({
  plugins: [react()],
  base: `${process.env.BASE_PATH ?? ""}/`,
});

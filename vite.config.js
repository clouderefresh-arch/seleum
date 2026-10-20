import { defineConfig } from "vite";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  server: { host: "0.0.0.0", port: 5173 },
  preview: { host: "0.0.0.0", port: 4173 },
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        presentation: resolve(root, "presentation.html"),
        blank: resolve(root, "blank.html"),
      },
    },
  },
});

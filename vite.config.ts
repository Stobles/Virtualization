import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "virtualization-hook",
      formats: ["cjs", "es"],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
    sourcemap: true,
    emptyOutDir: true,
    outDir: "dist",
  },
  plugins: [react(), tailwindcss()],
});

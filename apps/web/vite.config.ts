import tailwindcss from "@tailwindcss/vite";
import vinext from "vinext";
import { defineConfig, type Plugin } from "vite";

function fixVinextClientImportMetaUrl(): Plugin {
  return {
    name: "fix-vinext-client-import-meta-url",
    enforce: "post",
    transform(code) {
      if (code.includes("file:///ROOT/")) {
        return {
          code: code.replaceAll("file:///ROOT/", "/"),
          map: null,
        };
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [vinext(), fixVinextClientImportMetaUrl(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  css: {
    transformer: "lightningcss",
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: "react", test: /node_modules\/(react|react-dom|scheduler)\// },
            {
              name: "react-aria",
              test: /node_modules\/(react-aria|react-stately|@internationalized)/,
            },
            { name: "recharts", test: /node_modules\/recharts\// },
          ],
        },
      },
    },
  },
  server: {
    proxy: { "/api": "http://localhost:3001" },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});

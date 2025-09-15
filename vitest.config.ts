import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  return {
    plugins: [tsconfigPaths()],
    test: {
      env: loadEnv(mode, process.cwd(), ""),
    },
  };
});

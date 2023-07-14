import { crx, defineManifest } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react-swc";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import packageJson from "./package.json";

const manifest = defineManifest({
  manifest_version: 3,
  name: "Monthly debt hours",
  version: packageJson.version,
  icons: {
    16: "images/icon-16.svg",
    32: "images/icon-32.svg",
  },
  permissions: ["activeTab", "tabs"],
  action: {
    default_title: "Monthly debt hours",
    default_popup: "index.html",
  },
  content_scripts: [
    {
      matches: ["https://ssl.jobcan.jp/employee/attendance"],
      js: ["src/content.ts"],
    },
  ],
});

export default defineConfig({
  plugins: [react(), crx({ manifest }), process.env.ANALYZE === "true" && visualizer()],
});

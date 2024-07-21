import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import { esbuildFlowPlugin } from "@bunchtogether/vite-plugin-flow";
import path from 'path'
import { readFileSync } from 'fs';
import { transformSync } from 'esbuild';

// https://tamagui.dev/docs/intro/installation
const extensions = [
    ".web.tsx",
    ".tsx",
    ".web.ts",
    ".ts",
    ".web.jsx",
    ".jsx",
    ".web.js",
    ".js",
    ".css",
    ".json",
    ".mjs",
];

const development = process.env.NODE_ENV === "development";

const rollupPlugin = matchers => ({
    name: 'js-in-jsx',
    load(id) {
        if (matchers.some(matcher => matcher.test(id)) && id.endsWith('.js')) {
            const file = readFileSync(id, { encoding: 'utf-8' });
            return transformSync(file, { loader: 'jsx', jsx: 'automatic' });
        }
    },
});

// https://vitejs.dev/config/
export default defineConfig({
    clearScreen: true,
    plugins: [react()],
    // newly added for asset
    base: './',
    define: {
        // https://github.com/bevacqua/dragula/issues/602#issuecomment-1296313369
        global: "window",
        __DEV__: JSON.stringify(development),
        // https://tamagui.dev/docs/intro/installation
        DEV: JSON.stringify(development),
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    },
    resolve: {
        extensions: extensions,
        alias: {
            "react-native": "react-native-web",
            'react-native-fs$': path.resolve(__dirname, 'src/web/react-native-fs.tsx'),
        },
    },
    build: {
        rollupOptions: {
            plugins: [rollupPlugin([/\.(jsx|js)$/])],
            external: ['date-fns']
        },
        // newly added for asset
        // outDir: 'dist',
        // assetsDir: 'assets',

    },
    optimizeDeps: {
        esbuildOptions: {
            resolveExtensions: extensions,
            // https://github.com/vitejs/vite-plugin-react/issues/192#issuecomment-1627384670
            jsx: "automatic",
            // need either this or the plugin below
            loader: { ".js": "jsx" },
            // plugins: [
            //   esbuildFlowPlugin(/\.(flow|jsx?)$/, (path) =>
            //     /\.jsx$/.test(path) ? "jsx" : "jsx"
            //   ),
            // ],
        }, exclude: ['react-native-document-picker', 'react-native-fs']
    },
});

import { execSync } from 'node:child_process'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const version = process.env.npm_package_version ?? '0.0.0'

function readGitValue(command: string, fallback: string) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return fallback
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/pdf-workbench/',
  build: {
    assetsDir: 'assets',
    outDir: 'docs',
    sourcemap: true,
  },
  define: {
    __APP_VERSION__: JSON.stringify(version),
    __COMMIT_SHA__: JSON.stringify(readGitValue('git rev-parse --short HEAD', 'dev')),
    __REPO_URL__: JSON.stringify('https://github.com/baditaflorin/pdf-workbench'),
    __PAYPAL_URL__: JSON.stringify('https://www.paypal.com/paypalme/florinbadita'),
  },
  plugins: [react(), tailwindcss()],
})

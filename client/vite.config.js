import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // In development, allow overriding the proxy target with VITE_API_TARGET.
  // This lets phones on the same WiFi reach your dev server:
  //   VITE_API_TARGET=http://192.168.1.x:5000 npm run dev
  // Falls back to localhost for normal desktop dev.
  const apiTarget = env.VITE_API_TARGET || 'http://127.0.0.1:5000'
  const adminPath = env.VITE_ADMIN_PATH  || '/admin-x9k2'

  return {
    plugins: [react()],
    server: {
      // host: true binds to 0.0.0.0 so phones on the same WiFi can connect.
      // Vite will print both the localhost and the LAN IP on startup.
      host: true,
      proxy: {
        '/api': {
          target:       apiTarget,
          changeOrigin: true,
          secure:       false,
          ws:           false,
        },
        // Admin secret path must end without trailing slash in the key
        [`${adminPath}/`]: {
          target:       apiTarget,
          changeOrigin: true,
          secure:       false,
          ws:           false,
        },
      },
    },
  }
})

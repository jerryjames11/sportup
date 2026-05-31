import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    define: {
      'window.__FB_API_KEY__':             JSON.stringify(env.VITE_FIREBASE_API_KEY            || ''),
      'window.__FB_AUTH_DOMAIN__':         JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN        || ''),
      'window.__FB_PROJECT_ID__':          JSON.stringify(env.VITE_FIREBASE_PROJECT_ID         || ''),
      'window.__FB_STORAGE_BUCKET__':      JSON.stringify(env.VITE_FIREBASE_STORAGE_BUCKET     || ''),
      'window.__FB_MESSAGING_SENDER_ID__': JSON.stringify(env.VITE_FIREBASE_MESSAGING_SENDER_ID|| ''),
      'window.__FB_APP_ID__':              JSON.stringify(env.VITE_FIREBASE_APP_ID             || ''),
    },
  }
})

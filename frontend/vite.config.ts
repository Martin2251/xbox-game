import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // This manually forces Vite to load the files
  const env = loadEnv(mode, process.cwd());
  
  // LOG THIS: Does this show your URL in the terminal when you run 'npm run dev'?


  return {
    plugins: [react()],
    define: {
      // This "bakes" the variable into the code as a global constant
      'import.meta.env.VITE_BACKEND_URL': JSON.stringify(env.VITE_BACKEND_URL),
    },
  }
})
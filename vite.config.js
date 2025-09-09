import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Are-you-smarter-than-a-5th-grader/', // ← repo name, exact casing
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      VITE_BACKEND_API_URL: JSON.stringify(process.env.VITE_BACKEND_API_URL),
    }
  },
  css: {
    modules: {
      scopeBehaviour: 'global'
    }
  },
  build: {
    lib: {
      entry: 'src/components/ChatWidget/mount.tsx',
      name: 'OpenAIChatWidget',
      fileName: (format) => `chat-widget.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        exports: 'named',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    },
    cssCodeSplit: false,
    cssTarget: 'es2015'
  }
})

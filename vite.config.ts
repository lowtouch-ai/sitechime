import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'post-build-actions',
      closeBundle: async () => {
        const distDir = path.resolve(__dirname, 'dist');
        const dataDir = path.resolve(distDir, 'data');
        
        // Create data directory if it doesn't exist
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
        
        // Move all files from dist to dist/data
        const files = fs.readdirSync(distDir);
        for (const file of files) {
          if (file === 'data') continue; // Skip the data directory itself
          
          const srcPath = path.resolve(distDir, file);
          const destPath = path.resolve(dataDir, file);
          
          fs.renameSync(srcPath, destPath);
        }
        
        // Copy CSS file to the root directory for easier access from Shadow DOM
        const cssFilePath = path.resolve(dataDir, 'openai-chat-widget.css');
        if (fs.existsSync(cssFilePath)) {
          const rootCssPath = path.resolve(distDir, 'openai-chat-widget.css');
          fs.copyFileSync(cssFilePath, rootCssPath);
          console.log('- CSS file copied to root directory for Shadow DOM access');
        } else {
          console.warn('Warning: CSS file not found in expected location');
          
          // Look for CSS file in assets directory
          const assetsDir = path.resolve(dataDir, 'assets');
          if (fs.existsSync(assetsDir)) {
            const assetFiles = fs.readdirSync(assetsDir);
            const cssFile = assetFiles.find(file => file.endsWith('.css'));
            if (cssFile) {
              const assetCssPath = path.resolve(assetsDir, cssFile);
              const rootCssPath = path.resolve(distDir, 'openai-chat-widget.css');
              fs.copyFileSync(assetCssPath, rootCssPath);
              console.log(`- CSS file found in assets and copied to root directory: ${cssFile}`);
            }
          }
        }
        
        // Copy example.html to dist/index.html
        const exampleHtmlPath = path.resolve(__dirname, 'example.html');
        const indexHtmlPath = path.resolve(distDir, 'index.html');
        
        fs.copyFileSync(exampleHtmlPath, indexHtmlPath);
        
        console.log('Post-build actions completed successfully!');
        console.log('- Build files moved to dist/data/');
        console.log('- example.html copied to dist/index.html');
      }
    }
  ],
  define: {
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      VITE_BACKEND_API_URL: JSON.stringify(process.env.VITE_BACKEND_API_URL),
      VITE_OPENAI_HOST: JSON.stringify(process.env.VITE_OPENAI_HOST),
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
      name: 'SiteChimeWidget',
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
        },
        assetFileNames: (assetInfo) => {
          // Place CSS files directly in the output directory, not in /assets/
          if (assetInfo.name?.endsWith('.css')) {
            return 'openai-chat-widget.css';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    cssCodeSplit: false,
    cssTarget: 'es2015'
  }
})

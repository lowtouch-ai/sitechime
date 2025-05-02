import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'
import { OutputAsset, OutputChunk } from 'rollup'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'shadow-dom-css-injector',
      generateBundle(_, bundle) {
        // Find the CSS file in the bundle
        const cssFileName = Object.keys(bundle).find(fileName => fileName.endsWith('.css'));
        if (cssFileName && bundle[cssFileName]) {
          const cssAsset = bundle[cssFileName] as OutputAsset;
          if (!cssAsset.source) return;
          
          const cssContent = cssAsset.source.toString();
          
          // Find the JS entry file
          const jsEntryFile = Object.keys(bundle).find(fileName => 
            fileName.includes('chat-widget') && fileName.endsWith('.js')
          );
          
          if (jsEntryFile && bundle[jsEntryFile]) {
            const jsChunk = bundle[jsEntryFile] as OutputChunk;
            if (!jsChunk.code) return;
            
            // Replace the CSS import placeholder with the actual CSS content
            jsChunk.code = jsChunk.code.replace(
              /const cssContent = `[\s\S]*?`;/,
              `const cssContent = \`${cssContent}\`;`
            );
            
            // Remove the CSS file from the bundle as it's now inlined
            delete bundle[cssFileName];
          }
        }
      }
    },
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
        }
      }
    },
    cssCodeSplit: false,
    cssTarget: 'es2015'
  }
})

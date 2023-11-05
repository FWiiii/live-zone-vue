import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), UnoCSS(), Components(
    {
      resolvers: [ElementPlusResolver()],
    },
  ), AutoImport({
    include: [
      /\.[tj]sx?$/,
      /\.vue$/,
    ],
    resolvers: [ElementPlusResolver()],
    imports: [
      'vue',
      'vue-router',
    ],
    defaultExportByFilename: false,
    dts: './auto-imports.d.ts',
    vueTemplate: false,
    injectAtEnd: true,
    eslintrc: {
      enabled: false,
      filepath: './.eslintrc-auto-import.json',
      globalsPropValue: true,
    },
  }), visualizer({
    gzipSize: true,
    brotliSize: true,
    emitFile: false,
    open: true,
  })],
  build: {
    chunkSizeWarningLimit: 9999,
    minify: true,
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks(id) {
          try {
            if (id.includes('node_modules')) {
              const name = id.split('node_modules/')[1].split('/')
              if (name[0] === '.pnpm')
                return name[1]

              else
                return name[0]
            }
          }
          catch (error) {
            console.error(error)
          }
        },
      },
    },
  },
})

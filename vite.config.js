import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import { Plugin as cdnImport } from 'vite-plugin-cdn-import-async'
import ElementPlus from 'unplugin-element-plus/vite'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    UnoCSS(),
    ElementPlus({
      useSource: true,
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    visualizer({
      gzipSize: true,
      brotliSize: true,
      emitFile: false,
      open: false,
    }),
    cdnImport({
      modules: [
        {
          name: 'vue',
          var: 'Vue',
          mode: 'defer',
          path: 'https://cdn.jsdelivr.net/npm/vue@3.3.8/dist/vue.global.min.js',
        },
        {
          name: 'flv.js',
          var: 'flvjs',
          mode: 'defer',
          path: 'https://cdn.jsdelivr.net/npm/flv.js@1.6.2/dist/flv.min.js',
        },
        {
          name: 'artplayer',
          var: 'Artplayer',
          mode: 'defer',
          path: 'https://cdn.jsdelivr.net/npm/artplayer@5.0.9/dist/artplayer.min.js',
        },
        {
          name: 'hls.js',
          var: 'Hls',
          mode: 'defer',
          path: 'https://cdn.jsdelivr.net/npm/hls.js@1.4.12/dist/hls.min.js',
        },
        {
          name: 'vue-router',
          var: 'VueRouter',
          mode: 'defer',
          path: 'https://cdn.jsdelivr.net/npm/vue-router@4.0.0/dist/vue-router.global.min.js',
        },
        {
          name: 'vue-demi',
          mode: 'defer',
          var: 'VueDemi',
          path: 'https://cdn.jsdelivr.net/npm/vue-demi@0.14.6/lib/index.iife.min.js',
        },
        {
          name: 'pinia',
          mode: 'defer',
          var: 'Pinia',
          path: 'https://cdn.jsdelivr.net/npm/pinia@2.1.6/dist/pinia.iife.min.js',
        },
        {
          name: 'danmaku/dist/esm/danmaku.canvas.js',
          var: 'Danmaku',
          mode: 'defer',
          path: 'https://cdn.jsdelivr.net/npm/danmaku@2.0.6/dist/danmaku.min.js',
        },
        {
          name: 'pakp',
          var: 'pako',
          mode: 'defer',
          path: 'https://cdn.jsdelivr.net/npm/pako@2.1.0/dist/pako.min.js',
        },
        {
          name: 'js-md5',
          var: 'md5',
          mode: 'defer',
          path: 'https://cdn.jsdelivr.net/npm/js-md5@0.8.3/src/md5.min.js',
        },
      ],
    }),
  ],
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

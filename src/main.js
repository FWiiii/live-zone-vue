import { createApp } from 'vue'
import 'virtual:uno.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import VueLazyload from 'vue-lazyload'
import App from './App.vue'
import router from './router'
import store from './store'

createApp(App).use(router).use(store).use(VueLazyload).mount('#app')

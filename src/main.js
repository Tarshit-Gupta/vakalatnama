import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'
import router from './router'
import { useAuthStore } from './stores/auth'

// Initialize Theme (Dark Mode default)
const savedTheme = localStorage.getItem('vakalatnama_theme') || 'dark'
if (savedTheme === 'light') {
  document.documentElement.classList.add('light-theme')
} else {
  document.documentElement.classList.remove('light-theme')
}

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)

// Bootstrap auth state (fetch session + set advocate) before mounting
const authStore = useAuthStore()
authStore.initAuth().then(() => {
  app.mount('#app')
})

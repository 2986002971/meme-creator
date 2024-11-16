import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import App from './App.vue'
import Aura from '@primevue/themes/aura'

import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'

// PrimeVue 组件
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputTextarea from 'primevue/textarea'
import Slider from 'primevue/slider'
import Message from 'primevue/message'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'

const app = createApp(App)

// 更新 PrimeVue 配置
app.use(PrimeVue, {
    ripple: true,
    inputStyle: 'filled',
    theme: {
        preset: Aura,
        options: {
            prefix: 'p',
            darkModeSelector: 'system',
            cssLayer: false
        }
    },
    zIndex: {
        modal: 1100,
        overlay: 1000,
        menu: 1000,
        tooltip: 1100
    }
})

// 注册 Toast 服务
app.use(ToastService)

// 全局注册组件
app.component('Button', Button)
app.component('Dialog', Dialog)
app.component('InputText', InputText)
app.component('InputTextarea', InputTextarea)
app.component('Slider', Slider)
app.component('Message', Message)
app.component('Toast', Toast)

// 挂载应用
app.mount('#app')
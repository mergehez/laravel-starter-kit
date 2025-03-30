import '../css/app.scss';

import axios from 'axios';
import {createApp, h} from 'vue';
import {createInertiaApp} from '@inertiajs/vue3';
import {createPinia} from 'pinia'
import {ZiggyVue} from 'ziggy-js';
import {resolvePageComponent} from "laravel-vite-plugin/inertia-helpers";

(window.axios = axios).defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const pinia = createPinia()
createInertiaApp({
    resolve: async (name) => {
        return await resolvePageComponent(
            `./Pages/${name}.vue`,
            import.meta.glob("./Pages/**/*.vue")
        ) as any;
    },
    setup({el, App, props, plugin}) {
        (document.querySelector('html') as HTMLElement).style.borderTop = 'none'
        window.pinia = pinia
        createApp({render: () => h(App, props)})
            .use(pinia)
            .use(plugin)
            .use(ZiggyVue)
            .mount(el);
    },

    progress: {
        color: '#4B5563',
    },
});
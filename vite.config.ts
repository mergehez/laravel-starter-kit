import vue from '@vitejs/plugin-vue';
import autoprefixer from 'autoprefixer';
import laravel from 'laravel-vite-plugin';
import path from 'path';
import tailwindcss from 'tailwindcss';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/js/app.ts',
            ],
            refresh: true,
        }),
        vue({
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                },
            },
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources/js'),
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
        },
        extensions: ['.js', '.ts', '.vue'],
        dedupe: ['@inertiajs/vue3', 'pinia'],
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler', // ignores "the legacy js api is deprecated and will be removed in dart sass 2.0.0"
            },
        },
        postcss: {
            plugins: [tailwindcss, autoprefixer],
        },
    },
    build: {
        minify: true,
    },
});
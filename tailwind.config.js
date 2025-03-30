import defaultTheme from 'tailwindcss/defaultTheme';
import {addDynamicIconSelectors} from "./tailwind-iconify.js";
// import {addDynamicIconSelectors} from "@iconify/tailwind";

/** @type {import('tailwindcss').Config} */
export default {
    content: {
        files: [
            './storage/framework/views/*.php',
            './resources/views/app.blade.php',
            './resources/js/**/*.{vue,js,ts}',
            // './node_modules/@mergehez/vue-color-picker/**/*.{vue,js,ts}',
        ],
        transform: {
            vue: (content) => {
                const lines = content.split('\n')
                return lines.map((line, index) => {
                    const trimmed = line.trim();
                    const isComment =
                        (trimmed.startsWith('<!--') && trimmed.endsWith('-->')) ||
                        (trimmed.startsWith('/*') && trimmed.endsWith('*/')) ||
                        (trimmed.startsWith('//'));

                    return isComment ? '' : line;
                }).join('\n');
            }
        }
    },
    theme: {
        extend: {
            colors: {
                'x0': 'rgb(var(--bg0) / <alpha-value>)',
                'x1': 'rgb(var(--bg1) / <alpha-value>)',
                'x2': 'rgb(var(--bg2) / <alpha-value>)',
                'x3': 'rgb(var(--bg3) / <alpha-value>)',
                'x4': 'rgb(var(--bg4) / <alpha-value>)',
                'x5': 'rgb(var(--bg5) / <alpha-value>)',
                'x6': 'rgb(var(--bg6) / <alpha-value>)',
                'x7': 'rgb(var(--bg7) / <alpha-value>)',
                'x8': 'rgb(var(--bg8) / <alpha-value>)',
                'reverse': 'rgb(var(--bg-reverse) / <alpha-value>)',
                'surface0': 'rgb(var(--clr-default) / <alpha-value>)',
            },
            // fontFamily: {
            //     sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            // },
            height: {
                'nvh' : 'calc(100vh - 63px)'
            },
            animation: {
                'pulse-blink': 'pulse 0.3s linear 3',
            },
        },
        screens: {
            'xs': '475px',
            'laptop': '992px',
            ...defaultTheme.screens,
        },
    },
    darkMode: 'class',
    plugins: [
        require('tailwindcss-animate'),
        require('@tailwindcss/typography'),
        addDynamicIconSelectors({
            prefix: 'icon',
            overrideOnly: true,
            scale: 1,
            iconSets: {},
            customise: (content, name, prefix) => {
                if(name.includes('$')) {
                console.log('content',name, prefix, content)
                }
                return content;
            },
        }),
    ],
};

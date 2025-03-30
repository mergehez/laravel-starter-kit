<script setup lang="ts">
import {Link} from "@inertiajs/vue3";
import {computed, ref, watch} from "vue";
import globalState from "@/utils/globalState";
import ThemeSwitcher from "@/Components/ThemeSwitcher.vue";
import {__, TrKey} from "@/utils/localization";
import {usePage} from "@/utils/inertia";
import LayoutBase from "@/Components/Layout/LayoutBase.vue";
import Button from "@/Components/Button.vue";
import MediaLibrary from "@/Components/MediaLibrary/MediaLibrary.vue";
import LangSwitchButton from "@/Components/LangSwitchButton.vue";

const page = usePage()
console.log(page.props)
if(!globalState.panelLang)
    globalState.panelLang = page.props.localization.locale;

const menuWidths = ['200', '100', '0'];
const menuMode = ref(localStorage.getItem('menuMode') ?? menuWidths[0]);
// const lastMenuWidth = localStorage.getItem('menuWidth');
const menuWidth = computed(() => Math.max(100, parseInt(menuMode.value)))
watch(menuMode, () => {
    localStorage.setItem('menuMode', menuMode.value);
})

function changeMenuMode() {
    const i = menuWidths.indexOf(menuMode.value);
    menuMode.value = menuWidths[(i + 1) % menuWidths.length];
}

const menus: { name: TrKey, route: string, icon?: string }[] = [
    {
        "name": "main_page",
        "route": "home",
    },
    {
        "name": "posts",
        "route": "posts",
    },
    {
        "name": "pages",
        "route": "pages",
    },
    {
        "name": "sliders",
        "route": "sliders",
    },
    {
        "name": "menus",
        "route": "menus",
    },
    {
        "name": "users",
        "route": "users",
    },
    {
        "name": "profile",
        "route": "profile",
    },
    {
        "name": "errors",
        "route": "errors",
    },
    {
        "name": "media_library",
        "route": "media-library",
    },
    {
        "name": "components",
        "route": "components",
    },
]

const isCurrentRoute = (m: { name: string, route: string, icon?: string }) => {
    return globalState.currentRoute === `panel.${m.route}`
}
</script>

<template>
    <LayoutBase>
        <div class="h-screen flex flex-col bg-x2 relative overflow-y-auto">
            <!--<div class="w-screen h-screen flex flex-col bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100">-->
            <nav id="nav" class="flex px-5 py-2 bg-x0 items-center gap-2 shadow dark:shadow-stone-800">
                <Button
                    severity="raised"
                    @click="changeMenuMode"
                    title="frontend">
                    <i class="icon icon-mingcute--menu-fill text-lg"></i>
                </Button>
                <slot name="panel-title">
                    <div class="flex items-center gap-1 text-indigo-800 font-bold pr-4 border-r border-x5 pl-1">
                        <span class="icon icon-mdi--settings text-lg"></span>
                        <Link class="rounded transition-colors duration-300" :href="route(`panel.home`)">Panel</Link>
                    </div>
                </slot>
                <Button
                    :as="Link"
                    :href="route(`page.home`)"
                    severity="raised"
                    class="py-1 px-1.5 md:px-2 gap-1 text-sm"
                    title="frontend">
                    <span class="icon icon-mdi--home text-lg"></span>Frontend
                </Button>

                <i class="flex-1"></i>

                <span>{{ __('hello') }}, {{ page.props.auth?.user?.name }}</span>

                <LangSwitchButton/>
                <ThemeSwitcher/>
                <Button
                    :as="Link"
                    severity="raised"
                    :href="route('api.logout')"
                    class="p-2"
                    title="frontend">
                    <span class="icon icon-mdi--logout"></span>
                </Button>
            </nav>

            <div class="flex-1 flex p-3 gap-3 relative overflow-y-auto">
                <div
                    class="flex flex-col px-2 py-3 bg-x0 rounded-lg duration-300 gap-px"
                    :style="{
                        width: menuWidth + 'px',
                        marginLeft: menuMode !== '0' ? '0' : (-menuWidth-12) + 'px',
                        transition: 'margin-left 0.3s ease-in-out, width 0.3s ease-in-out'
                    }"
                >
                    <template v-for="m in menus" :key="m.route">
                        <!--class="p-2 flex items-center font-bold gap-1 hover:text-green-400 border border-transparent"-->
                        <Button
                            :as="Link"
                            severity="raised"
                            class="py-2 text-inherit  justify-start  duration-300"
                            :class="{
                                'px-4 text-base': menuMode === '200',
                                'px-2 text-sm': menuMode === '100',
                                '!text-green-500 dark:text-green-600': isCurrentRoute(m),
                                'font-normal': !isCurrentRoute(m),
                            }"
                            :href="route(`panel.${m.route}`)"
                        >
                            <span v-if="m.icon" class="icon text-lg" :class="m.icon"></span>
                            <span>{{ __(m.name as any) }}</span>
                            <!--<span class="text-2xs ml-auto pl-1">{{ page.props.navStats[arr[1] || k] }}</span>-->
                        </Button>
                    </template>

                    <i class="flex-1"></i>

                    <div class="text-center text-sm">{{ page.props.app_version }}</div>
                    <div class="text-center text-sm">PHP v{{ page.props.php_version }}</div>
                </div>
                <div class="flex-1 flex flex-col p-5 bg-x0 rounded-lg overflow-y-auto">
                    <slot/>
                </div>
            </div>
        </div>


        <MediaLibrary
            v-model:visible="globalState.mediaLibrary.visible"
            :config="globalState.mediaLibrary.config"
            :on-selected="t => globalState.mediaLibrary.onSelect(t)"
            id="media-library-image-only"
        />
        <MediaLibrary
            v-model:visible="globalState.mediaLibraryWithPdf.visible"
            :config="globalState.mediaLibraryWithPdf.config"
            :on-selected="t => globalState.mediaLibraryWithPdf.onSelect(t)"
            id="media-library-image-and-pdf"
        />
    </LayoutBase>
</template>

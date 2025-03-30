<script setup lang="ts">
import {computed,} from 'vue';
import {Link} from '@inertiajs/vue3';
import {TMenu} from "@/utils/models";
import {usePage} from "@/utils/inertia";
import {useGlobalSearch} from "@/Components/Overlays/useGlobalSearch";
import {__} from "@/utils/localization";
import Icon from "@/Components/Icon.vue";
import Button from "@/Components/Button.vue";
import ThemeSwitcher from "@/Components/ThemeSwitcher.vue";
import SwipingRightMenuButton from "@/Components/Layout/SwipingRightMenuButton.vue";
import LangSwitchButton from "@/Components/LangSwitchButton.vue";

const page = usePage();
const menu = computed(() => page.props.menu as TMenu);
const globalSearch = useGlobalSearch();
</script>

<template>
    <!--<nav class="w-full z-50 shadow dark:shadow-stone-800 relative bg-x0" id="nav">-->
    <nav class="w-full shadow-sm dark:shadow-x4 relative" id="nav">
        <!-- Primary Navigation Menu -->
        <div class="container relative mx-auto md:px-12">
            <div class="flex py-3 relative max-md:pb-3 items-center pl-2">
                <Link :href="route('page.home')" class="flex items-center gap-2">
                    <img src="/logo/logo-48.png" class="rounded-xl" alt="logo">
                    <!--<Logo style="width: max(20vw, 300px)" class="max-md:hidden pointer-events-none select-none text-reverse"/>-->
                    <!--<Logo style="width: min(50vw, 300px)" class="md:hidden pointer-events-none select-none text-reverse"/>-->
                    <h1 class="text-2xl">{{ page.props.info.siteTitle }}</h1>
                </Link>

                <i class="flex-1"></i>

                <Button
                    severity="raised"
                    class="p-2"
                    @click="globalSearch.openSearchPopup"
                    :title="__('search')"
                >
                    <Icon icon="icon-mingcute--search-line text-2xl"/>
                </Button>

                <LangSwitchButton ic-class="text-2xl" />

                <ThemeSwitcher ic-class="text-2xl" />

                <Button
                    v-if="page.props.auth?.user"
                    :as="Link"
                    severity="raised"
                    class="p-2"
                    :href="route('panel.home')" :title="__('admin_panel')">
                    <span class="icon icon-mdi--settings text-2xl"></span>
                </Button>

                <SwipingRightMenuButton :menu="menu" />
            </div>
            <div class="flex-grow flex w-full">
                <!-- Navigation Links -->
                <div class="hidden space-x-4 -my-px md:flex w-full mb-2">
                    <template v-for="mi in menu.items">
                        <Link
                            class="font-medium btn btn-secondary btn-sm flex-1 uppercase text-lg rounded-none"
                            :href="mi.url || '#'"
                        >
                            {{ __(mi.title) }}
                        </Link>
                    </template>
                </div>
            </div>
        </div>
    </nav>
</template>

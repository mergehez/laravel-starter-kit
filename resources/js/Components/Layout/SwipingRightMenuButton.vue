<script setup lang="ts">

import globalState from "@/utils/globalState";
import {__} from "@/utils/localization";
import {Link} from "@inertiajs/vue3";
import Button from "@/Components/Button.vue";
import {TMenu} from "@/utils/models";

defineProps<{
    menu: TMenu
}>()

</script>

<template>
    <Button
        severity="raised"
        class="p-2 text-2xl z-20"
        @click="() => globalState.showNavDropdown = !globalState.showNavDropdown"
        :title="__('search')"
    >
        <svg height="1em" width="1em" stroke="currentColor" fill="none" viewBox="0 0 24 24">
            <path :class="{'hidden': globalState.showNavDropdown, 'inline-flex': ! globalState.showNavDropdown }"
                  stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            <path :class="{'hidden': ! globalState.showNavDropdown, 'inline-flex': globalState.showNavDropdown }"
                  stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
    </Button>
    <div v-if="globalState.showNavDropdown" class="fixed inset-0 bg-black/50 z-10" @click.prevent.stop="globalState.showNavDropdown = false"></div>
    <div
        :style="{
        translate: globalState.showNavDropdown ? '0' : '-100%',
        opacity: globalState.showNavDropdown ? '1' : '0',
        transition: 'all 0.3s ease-in-out',
        'box-shadow': '#3c3c3c8f 0px 0px 20px 15px',
     }"
        class="fixed container mx-auto top-16 left-2 right-2 rounded-md bg-x0 border-2 border-x4 ease-in-out z-10">
        <div class="grid  w-full divide-y divide-x4">
            <template v-for="mi in menu.items">
                <Link
                    :href="mi.url!"
                    :on-click="() => globalState.showNavDropdown = false"
                    class="hover:bg-x2 transition-colors uppercase text-lg text-center font-bold px-7 py-2 pt-2">
                    {{ __(mi.title) }}
                </Link>
            </template>
        </div>
    </div>
</template>
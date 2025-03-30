<script setup lang="ts">
import {router, Head} from "@inertiajs/vue3";
import {ref} from "vue";
import globalState from "@/utils/globalState";
import ConfirmationModal from "@/Components/Overlays/ConfirmationModal.vue";
import GlobalSearchPopup from "@/Components/Overlays/GlobalSearchPopup.vue";
import {initGlobalSearch} from "@/Components/Overlays/useGlobalSearch";
import ToastContainer from "@/Components/Overlays/ToastContainer.vue";

const isLoading = ref(false);
let timeout: any = undefined;
globalState.currentRoute = route().current() as string;
router.on('start', () => {
    timeout = setTimeout(() => isLoading.value = true, 1000)
})
window.onpopstate = function(event) {
    globalState.currentRoute = route().current() as string;

    currUrl.value = window.location.href.replace('www.', '');
}
const currUrl = ref(window.location.href.replace('www.', ''));
router.on('finish', () => {
    clearTimeout(timeout)
    isLoading.value = false;
    globalState.currentRoute = route().current() as string;

    currUrl.value = window.location.href.replace('www.', '');
})


initGlobalSearch({
    searchResultSpecifics: {
        'post': {ic: 'icon-lucide--notebook-pen', route: t => route('page.post', {slug: t.slug}), match: t => t.type === 'post'},
        'page': {ic: 'icon-mingcute--notebook-line', route: t => t.slug, match: t => t.type === 'page'},
        'special_page': {ic: 'icon-mingcute--notebook-2-line', route: t => t.slug, match: t => t.type === 'special'},
    },
    dropdown: true,
    minQueryLength: 1,
    searchDebounce: 100,
    searchPageUrl: q => route('page.search', {q}),
})
// onMounted(globalKeyDownListener.onLayoutMounted)
// onBeforeUnmount(globalKeyDownListener.onLayoutUnmounted)

</script>

<template>
    <div class="w-screen h-screen flex flex-col">
        <Head>
        </Head>
        <slot/>
    </div>

    <GlobalSearchPopup/>
    <ConfirmationModal/>
    <ToastContainer />

    <div class="absolute inset-0 flex items-center justify-center bg-x0 z-[1000] !bg-opacity-30" v-if="isLoading"></div>
</template>

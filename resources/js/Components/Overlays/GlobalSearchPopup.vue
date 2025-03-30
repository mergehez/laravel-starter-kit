<script setup lang="ts">
import CenteredModal from "./CenteredModal.vue";
import GlobalSearchPopupContent from "./GlobalSearchPopupContent.vue";
import {useGlobalSearch} from "@/Components/Overlays/useGlobalSearch";

const globalSearch = useGlobalSearch();
</script>

<template>
    <CenteredModal
        tag="global-search-popup"
        v-model:show="globalSearch.state.show"
        :vertical-center="false"
        :close-on-outside="true"
        style="padding-top: min(15dvh, 150px);"
        content-class="p-3 lg:p-5 bg-x0 flex flex-col"
        content-style="max-width: 95dvw; width: min(600px, 95vw); max-height: 70dvh">
        <GlobalSearchPopupContent
            auto-focus
        />
    </CenteredModal>
</template>

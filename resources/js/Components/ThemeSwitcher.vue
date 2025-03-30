<script setup lang="ts">

import Button from "@/Components/Button.vue";
import {__} from "@/utils/localization";

defineProps<{
    icClass?: string,
}>()


function toggleTheme() {
    window.themeManager.toggle();
}

</script>

<template>
    <Button
        severity="raised"
        class="p-2"
        :title="__('theme_switcher')"
        @click="toggleTheme"
    >
        <i class="icon icon-mingcute--sun-fill dark:hidden" :class="icClass"></i>
        <i class="icon icon-mingcute--moon-fill dark:inline hidden" :class="icClass"></i>
    </Button>
</template>
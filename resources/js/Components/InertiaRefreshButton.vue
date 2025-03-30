<script setup lang="ts">

import {router} from "@inertiajs/vue3";
import {ref} from "vue";
import Button from "@/Components/Button.vue";
import {__} from "@/utils/localization";

const isLoading = ref(false);

function refresh() {
    isLoading.value = true;
    router.reload({
        only: ['pageData'],
        onFinish: () => {
            isLoading.value = false;
        },
    })
}
</script>

<template>
    <Button
        :loading="isLoading"
        severity="secondary"
        class="px-2 py-0.5 gap-1"
        @click.prevent="refresh">
        <slot>
            {{ __('refresh') }}
        </slot>
    </Button>
</template>

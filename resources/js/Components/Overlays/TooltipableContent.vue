<script setup lang="ts">

import Popper from "@/Components/Overlays/Popper.vue";

const props = defineProps<{
    text: string
}>()


</script>

<template>
    <Popper
        hover
        :hover-delay="300"
        placement="bottom"
        content-class="px-2 py-1 text-sm bg-x6 text-center w-max max-w-36 whitespace-normal"
    >
        <template #trigger>
            <slot></slot>
        </template>

        <template #content>
            {{ text }}
        </template>
    </Popper>
</template>
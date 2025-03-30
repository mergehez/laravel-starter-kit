<script setup lang="ts">

import {twMerge} from "tailwind-merge";
import Popper, {PopperProps} from "@/Components/Overlays/Popper.vue";

const props = withDefaults(defineProps<PopperProps & {
    center?: boolean,
}>(), {
    closeOnClickOnContent: true,
    placement: 'bottom',
    center: true,
})
</script>

<template>
    <Popper v-bind="{...props, ...$attrs}"
            :class="twMerge('inline-flex items-center justify-center menu-popper', $attrs.class as any)"
            :content-class="twMerge('bg-x2 overflow-hidden items-start divide-y divide-light', contentClass)">
        <template #trigger="data">
            <slot name="trigger" v-bind="data ?? {}"></slot>
        </template>
        <template #content="data">
            <slot name="content" v-bind="data ?? {}"
                  :close="data.close"
                  :cls="(center ? '' : 'justify-start ') + 'list-group-item btn-hover whitespace-nowrap transition-all duration-300 rounded-none py-4 px-5'"></slot>
        </template>
    </Popper>
</template>

<script setup lang="ts">

import {Link} from "@inertiajs/vue3";
import {twMerge} from "tailwind-merge";

defineProps<{
    href?: string,
    title: string,
}>();

</script>

<template>
    <component :is="href ? Link : 'button'" :href="href"
               :title="title" :aria-label="title"
               :class="twMerge('btn btn-light-borderless rounded-lg text-sm p-2', $attrs['class'] as string)">
        <slot></slot>
    </component>
</template>

<script setup lang="ts">
const props = defineProps<{
    color: string,
    tickColor?: string,
    tick: boolean,
}>()
</script>

<template>
    <span class="size-7 rounded-md grid place-items-center border border-x1" :style="'background: '  + props.color">
        <span v-if="tick" class="icon icon-mdi--check-bold text-lg" :style="{color: tickColor || 'white'}"></span>
    </span>
</template>

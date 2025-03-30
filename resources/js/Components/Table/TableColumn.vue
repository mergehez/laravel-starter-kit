<script setup lang="ts" generic="TItem">
export type TTableColumn<TItem> = {
    title?: string
    value?: any | ((t: TItem) => any),
    headClass?: string,
    headStyle?: string,
    class?: string,
    style?: string,
    item?: TItem
}

const props = defineProps<TTableColumn<TItem>>()
</script>

<template>
    <slot name="head"></slot>
    <slot name="body" :item="item"></slot>
</template>
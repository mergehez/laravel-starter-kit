<script setup lang="ts" generic="TItem">
import {TTableColumn} from "@/Components/Table/TableColumn.vue";

const props = defineProps<TTableColumn<TItem>>()
</script>

<template>
    <slot name="head"></slot>
    <slot name="body"></slot>
</template>
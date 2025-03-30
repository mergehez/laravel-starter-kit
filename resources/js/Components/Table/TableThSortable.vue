<script setup lang="ts" generic="TModel extends TModelWithTitle, TSortField = never">
import {TModelWithTitle} from "@/utils/models";
import {TTableState} from "@/Components/Table/useTable";
import Icon from "@/Components/Icon.vue";
import {__, TrKey} from "@/utils/localization";

defineProps<{
    state: TTableState<TModel, TSortField>,
    field: TSortField,
    text?: string,
    textTr?: TrKey,
    full?: boolean
}>()
</script>

<template>
    <th :class="{'w-full': full}">
        <button
            class="hover:opacity-70 inline-flex items-center gap-1"
            @click="state.sort(field)"
        >
            <span>{{ text ?? __(textTr!) }}</span>
            <Icon icon="icon-fluent--arrow-sort-16-filled text-base" :class="state.currentSortField == field ? 'text-green-500' : ''"/>
        </button>
    </th>
</template>
<script setup lang="ts" generic="TModel extends TModelWithTitle, TSortField = never">

import {__} from "@/utils/localization";
import {TModelWithTitle} from "@/utils/models";
import {TTableState} from "@/Components/Table/useTable";
import {computed} from "vue";

const props = defineProps<{
    state: TTableState<TModel, TSortField>,
    item: TModel
}>()

const finalTitle = computed(() => props.state.getItemTitle(props.item));

</script>

<template>
    <td>
        <div class="rounded-none py-2 leading-tight w-full flex items-center text-left flex-1"
             :class="!finalTitle ? 'italic opacity-70' : ''"
        >
            <slot>
                {{finalTitle || __('no_title') + '...'}}
            </slot>
        </div>
    </td>
</template>
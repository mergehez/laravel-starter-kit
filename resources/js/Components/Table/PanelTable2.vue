<script setup lang="ts" generic="TModel extends TModelWithTitle, TSortField = never">
import {useSlots, VNode} from "vue";
import {TTableState} from "@/Components/Table/useTable";
import {TModelWithTitle} from "@/utils/models";
import TableColumn, {TTableColumn} from "@/Components/Table/TableColumn.vue";
import TableColumnInternal from "@/Components/Table/TableColumnInternal.vue";

const props = defineProps<{
    state: TTableState<TModel, TSortField>,
}>()

const slots = useSlots()
console.log(slots)
const columns = slots.columns!().map((col) => {
    console.log(typeof col)
    return col as unknown as {
        props: TTableColumn<TModel>,
        children: {
            head: () => VNode[],
            body: () => VNode[],
        }
    }
})

console.log(columns)
console.log(columns[0])
console.log(columns[0].children.head()[0])


</script>

<template>
        <table class="border">
            <template v-if="false">
                <slot name="columns"/>
                <slot name="head" />
            </template>
            <thead>
                <tr class="border border-red-800 p-2">
                    <th v-for="(col, j) in columns" :key="j" class="border border-green-800 p-2">
                        <TableColumn v-bind="col.props">
                            <template #head>
                                <component :is="col.children.head()[0]" />
                            </template>
                        </TableColumn>
                    </th>
                </tr>
            </thead>
            <tbody>

            <template v-for="(item, i) in state.filteredItems" :key="item.id">
                <tr class="border border-red-800 p-2">
                    <td v-for="(col, j) in columns" :key="j" class="border border-green-800 p-2">
                        <TableColumn v-bind="col.props">
                            <template #body>
                                <component :is="col.children.body()[0]" :item="item" />
                            </template>
                        </TableColumn>
                    </td>
                </tr>
            </template>
            </tbody>
        </table>
</template>
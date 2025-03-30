<script setup lang="ts">
import {__} from "@/utils/localization";
import LayoutPanel from "@/Components/Layout/LayoutPanel.vue";
import {usePage} from "@/utils/inertia";
import {TSlider} from "@/utils/models";
import {router} from "@inertiajs/vue3";
import PanelTable from "@/Components/PanelTable.vue";
import IHead from "@/Components/IHead.vue";
import {useTable} from "@/Components/Table/useTable";
import {toast} from "@/Components/Overlays/toast";

defineOptions({layout: LayoutPanel});

const page = usePage<{
    pageData: {
        items: TSlider[]
    }
}>()

const tableState = useTable('sliders', {
    title: __('sliders'),
    routeGroup: 'sliders',
    itemsGetter: () => page.props.pageData.items,
    changeSequenceUrl: undefined,
    deletion: {
        canBe: (p: TSlider) => {
            if (page.props.info.homeSlider == '' + p.id) {
                toast.showError(__('this_slider_cant_be_deleted_because_main'))
                return false;
            }
            return true;
        },
        apiUrl: 'default',
    },
    canEditInline: false,
    createFn: () => router.visit(route('panel.sliders.create')),
    editFn: item => router.visit(route('panel.sliders.edit', item.id)),
})
</script>

<template>
    <div class="flex h-full overflow-y-auto">
        <IHead :title="__('sliders')"/>
        <PanelTable :state="tableState"/>
    </div>
</template>
<script setup lang="ts">
import {__} from "@/utils/localization";
import LayoutPanel from "@/Components/Layout/LayoutPanel.vue";
import {usePage} from "@/utils/inertia";
import {TMenu} from "@/utils/models";
import {router} from "@inertiajs/vue3";
import PanelTable from "@/Components/PanelTable.vue";
import IHead from "@/Components/IHead.vue";
import {useTable} from "@/Components/Table/useTable";
import {toast} from "@/Components/Overlays/toast";

defineOptions({layout: LayoutPanel});

const page = usePage<{
    pageData: {
        items: TMenu[]
    }
}>()

const tableState = useTable('menus', {
    title: __('menus'),
    routeGroup: 'menus',
    itemsGetter: () => page.props.pageData.items,
    changeSequenceUrl: undefined,
    deletion: {
        canBe: (p: TMenu) => {
            if(page.props.info.mainMenu == ''+p.id){
                toast.showError(__('this_menu_cant_be_deleted_because_main'))
                return false
            }
            if(page.props.info.mobileMenu == ''+p.id){
                toast.showError(__('this_menu_cant_be_deleted_because_mobile'))
                return false
            }
            return true;
        },
        apiUrl: 'default',
    },
    canEditInline: false,
    createFn: () => router.visit(route('panel.menus.create')),
    editFn: item => router.visit(route('panel.menus.edit', item.id)),
})
</script>

<template>
    <div class="flex h-full overflow-y-auto">
        <IHead :title="__('menus')"/>
        <PanelTable :state="tableState">
        </PanelTable>
    </div>
</template>
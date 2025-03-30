<script setup lang="ts">

import {__} from "@/utils/localization";
import {computed} from "vue";
import LayoutPanel from "@/Components/Layout/LayoutPanel.vue";
import {usePage} from "@/utils/inertia";
import {TMenu, TModelWithTitle} from "@/utils/models";
import {router} from "@inertiajs/vue3";
import PanelTable from "@/Components/PanelTable.vue";
import IHead from "@/Components/IHead.vue";
import {Link} from "@inertiajs/vue3";
import TextInput from "@/Components/Form/TextInput.vue";
import {vAutoAnimate} from "@formkit/auto-animate";
import {MenuItemType} from "@/utils/generated_enums";
import {createMenuForm, createMenuItemForm} from "@/utilsForm/createMenuForm";
import MenuItemFormInline from "@/Parts/Panel/MenuItemFormInline.vue";
import {loc} from "@/utils/globalState";
import {useTable} from "@/Components/Table/useTable";
import PanelTableTitleCell from "@/Components/Table/PanelTableTitleCell.vue";
import Button from "@/Components/Button.vue";
import TableTh from "@/Components/Table/TableTh.vue";

defineOptions({layout: LayoutPanel});

const page = usePage<{
    pageData: {
        item: TMenu,
        posts: TModelWithTitle[],
        pages: TModelWithTitle[],
    }
}>()
const item = computed(() => page.props.pageData.item)

const tableState = useTable('menu-items', {
    title: __('menu_items'),
    itemsGetter: () => item.value.items,
    routeGroup: 'menu_items',
    changeSequenceUrl: 'default',
    deletion: {
        canBe: () => true,
        apiUrl: 'default',
    },
    canEditInline: true,
    inlineFormCreator: (t, type) => {
        console.log('inlineFormCreator', t);
        return createMenuItemForm(item.value, t?.type ?? type ?? MenuItemType.page, {currentItem: () => t});
    },
})

const {form, submit: submitFn} = createMenuForm({
    currentItem: () => item.value,
});

function submit(){
    const itemId = item.value.id
    submitFn()
        .then((res?: TMenu) => {
            if(itemId || !res)
                router.reload()
            else
                router.visit(route('panel.menu', res.id))
        })
}
</script>

<template>
    <div class="flex flex-col h-full overflow-y-auto">
        <IHead :title="item.id ? __('edit_menu') : __('add_new_menu')"/>
        <form @submit.prevent="() => submit" class="flex flex-col pb-10 gap-3" v-auto-animate>
            <div class="pt-2 flex justify-between gap-3 items-center px-3">
                <Link :href="route('panel.menus')" class="btn btn-secondary py-px gap-1">
                    <span class="icon icon-mdi--arrow-back text-lg"></span>
                    <span class="py-1">{{ __('back_to_all_menus') }}</span>
                </Link>
                <i class="flex-1"></i>
                <!--<button class="btn btn-success py-px gap-1">-->
                <!--    <span class="icon icon-mdi--content-save text-lg"></span>-->
                <!--    <span class="py-1">{{ __('save') }}</span>-->
                <!--</button>-->
            </div>
            <div v-if="Object.keys(form.errors).length" class="alert alert-danger leading-tight px-3">
                <div v-for="(val, key) in form.errors" :key>
                    <b>{{ key }}</b>: {{ val }}
                </div>
            </div>

            <div class="flex gap-2 items-center px-3" v-auto-animate>
                <span class="text-sm">{{ __('name') }}</span>
                <TextInput
                    v-model="form.title[loc]"
                    label="Slug"
                    :disabled="form.errors.title"
                    required
                    class="flex-1"
                />
                <button @click="submit"
                        class="btn btn-success py-px gap-1"
                        :disabled="form.title == item.title"
                        :class="form.title != item.title ? 'opacity-100': '!opacity-30'">
                    <span class="icon icon-mdi--content-save text-lg"></span>
                    <span class="py-1">{{ __('save') }}</span>
                </button>
            </div>

            <template v-if="item.id">
                <PanelTable
                    :state="tableState"
                    inline
                    hide-create-button
               >
                    <template #head-cols-between>
                        <TableTh text-tr="type"/>
                    </template>
                    <template #columns="{item}">
                        <PanelTableTitleCell :state="tableState" :item />

                        <td class="whitespace-nowrap text-center">
                            <span class="px-1.5 bg-x3 text-xs inline-block rounded-md">{{ __(item.type) }}</span>
                        </td>
                    </template>
                    <template #form="{data, cancel}">
                        <MenuItemFormInline :formState="data!" @close="cancel" />
                    </template>
                </PanelTable>


                <div class="flex gap-2 items-center px-3">
                    <span>{{ __('add') }}:</span>
                    <Button severity="secondary" small-y @click.prevent="tableState.onCreateClicked(MenuItemType.post)">{{ __('post') }}</Button>
                    <Button severity="secondary" small-y @click.prevent="tableState.onCreateClicked(MenuItemType.page)">{{ __('page') }}</Button>
                    <Button severity="secondary" small-y @click.prevent="tableState.onCreateClicked(MenuItemType.special_page)">{{ __('special_page') }}</Button>
                    <Button severity="secondary" small-y @click.prevent="tableState.onCreateClicked(MenuItemType.link)">{{ __('link') }}</Button>
                </div>
                <div
                    v-if="tableState.inlineFormState?.form.id === 0"
                    :key="tableState.inlineFormState.form.type"
                    class="px-3 text-sm">
                    <div class="bg-x2 p-5 rounded">
                        <MenuItemFormInline :formState="tableState.inlineFormState" @close="tableState.closeInlineForm" />
                    </div>
                </div>
            </template>
        </form>
    </div>
</template>
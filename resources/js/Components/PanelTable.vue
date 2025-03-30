<script setup lang="ts" generic="TModel extends TModelWithTitle, TSortField = never">
import {vAutoAnimate} from "@formkit/auto-animate";
import {twMerge} from "tailwind-merge";
import {TModelWithTitle} from "@/utils/models";
import {__} from "@/utils/localization";
import SearchInput from "@/Components/SearchInput.vue";
import {dt} from "@/utils/date_helpers";
import IHead from "@/Components/IHead.vue";
import InertiaRefreshButton from "@/Components/InertiaRefreshButton.vue";
import {TGenericFormState} from "@/utils/form_helpers";
import Button from "@/Components/Button.vue";
import {TTableState} from "@/Components/Table/useTable";
import PanelTableTitleCell from "@/Components/Table/PanelTableTitleCell.vue";
import {useAutoAnimate} from "@formkit/auto-animate/vue";
import {watch} from "vue";

export type PanelSlotData<T extends TModelWithTitle> = {
    item: T,
    editForm: TGenericFormState['form'],
}

const props = defineProps<{
    state: TTableState<TModel, TSortField>,
    overflowAuto?: boolean,
    inline?: boolean,
    hideCreateButton?: boolean,
    hideLastModified?: boolean,
    hideSearch?: boolean,
    headClass?: string,
    refreshButton?: boolean,
}>()

const [refTable, enableAnimations] = useAutoAnimate((el, action) => {
    let keyframes : any;
    if (action === "add") {
        keyframes = [
            { transform: "scale(.98)", opacity: 0 },
            { transform: "scale(1)", opacity: 1 },
        ];
    }
    if (action === "remove") {
        keyframes = [
            { transform: "scale(1)", opacity: 1 },
            { transform: "scale(.98)", opacity: 0 },
        ];
    }
    if (action === "remain") {
        keyframes = [{ opacity: 0.98 }, { opacity: 1 }];
    }
    return new KeyframeEffect(el, keyframes, { duration: 250, easing: "ease-in-out" });
});

watch(() => props.state.inlineFormState, s => {
    console.log('changed', s);
    if (s)
        enableAnimations(false);
    else
        enableAnimations(true);
})
</script>

<template>
    <div class="flex flex-col h-full w-full" :class="overflowAuto ? 'overflow-y-auto' : ''" v-auto-animate>
        <IHead :title="state.tableTitle"/>

        <div :class="twMerge('flex items-center gap-3 py-2 px-3', headClass)">
            <slot name="title">
                <h1 class="font-bold text-2xl py-1">{{ state.tableTitle }}</h1>
            </slot>

            <Button
                v-if="!hideCreateButton"
                small
                severity="secondary"
                @click.prevent="state.onCreateClicked">
                <span class="icon icon-mdi--plus-bold"></span>
                {{ __('create') }}
            </Button>

            <InertiaRefreshButton v-if="refreshButton"/>

            <i class="flex-1"></i>

            <SearchInput v-model="state.searchQuery" v-if="!hideSearch"/>
        </div>

        <!--<template v-if="state.inlineFormState?.form.id === 0">-->
        <!--    <div class="w-full text-sm px-2">-->
        <!--        <div class="bg-x3 p-3 rounded">-->
        <!--            <slot name="form" :data="state.inlineFormState" :cancel="state.closeInlineForm"></slot>-->
        <!--        </div>-->
        <!--    </div>-->
        <!--</template>-->

        <div class="opacity-50 hover:opacity-100 transition-opacity duration-200 w-full">
            <slot name="head"></slot>
        </div>

        <!--class="flex-1 w-full grid auto-rows-min"-->
        <!-- :class="{-->
        <!--     'overflow-y-auto': overflowAuto,-->
        <!--     'grid-cols-2 gap-x-px border-b border-x3': twoCols,-->
        <!-- }"-->
        <!-- style="scrollbar-gutter: stable"-->
        <table
            ref="refTable"
            class="*:*:*:px-3 group"
        >
            <thead class="opacity-60 group-hover:opacity-100 transition-opacity duration-200">
            <tr class="font-bold whitespace-nowrap text-left">
                <slot name="head-cols">
                    <slot name="head-cols-start"/>
                    <slot name="head-title-cell">
                        <th class="w-full text-left font-bold">
                            {{ __('title') }}
                        </th>
                    </slot>
                    <slot name="head-cols-between"/>
                    <slot name="head-modified-at">
                        <th class="text-left font-bold whitespace-nowrap">
                            {{ __('last_modified') }}
                        </th>
                    </slot>
                    <slot name="head-buttons">
                        <th class="w-0 text-left font-bold"></th>
                    </slot>
                </slot>
            </tr>
            </thead>
            <tbody v-auto-animate class="">
            <template v-for="(item, i) in state.filteredItems" :key="item.id">
                <!--class="hover:bg-x2 text-sm flex items-center w-full"-->
                <tr
                    class="hover:bg-x2 text-sm even:bg-x1"
                    :class="{
                        'pr-3': inline,
                        '!bg-x2': state.isBeingEditedInline(item),
                    }"
                >
                    <!--:class="inline ? 'pr-3' : ''"-->

                    <slot name="columns" :item="item" :editForm="state.getInlineFormState(item)">
                        <PanelTableTitleCell :state="state" :item="item"/>
                    </slot>

                    <td>
                        <div v-if="!hideLastModified && !state.isBeingEditedInline(item)" class="whitespace-nowrap">
                            <div>
                                {{ dt.toString(item.updated_at) }}
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="whitespace-nowrap flex gap-2 py-1 pl-3 items-center" :class="inline ? '': 'px-3'">
                            <template v-if="state.isSequenced">
                                <Button
                                    severity="secondary" small
                                    title="change sequence up"
                                    class="bg-opacity-80 p-1"
                                    :class="{ '!opacity-25': i == 0 || !!state.inlineFormState }"
                                    :disabled="i == 0 || !!state.inlineFormState"
                                    @click.prevent="state.changeSequence(item as TModel, 'up')"
                                >
                                    <span class="icon icon-mdi--arrow-up text-base text-reverse"></span>
                                </Button>
                                <Button
                                    severity="secondary" small
                                    title="change sequence down"
                                    class="bg-opacity-80 p-1"
                                    :class="{ '!opacity-25': i == state.filteredItems.length - 1 || !!state.inlineFormState }"
                                    :disabled="i == state.filteredItems.length - 1 || !!state.inlineFormState"
                                    @click.prevent="state.changeSequence(item as TModel, 'down')"
                                >
                                    <span class="icon icon-mdi--arrow-down text-base text-reverse"></span>
                                </Button>
                            </template>

                            <slot name="buttons" :item="item" :index="i" :editForm="state.getInlineFormState(item)"></slot>

                            <template v-if="!state.canEditInline || !state.isBeingEditedInline(item)">
                                <Button
                                    severity="info" small
                                    class="bg-opacity-80 p-1"
                                    title="full edit"
                                    @click.prevent="state.onEditClicked(item as TModel)">
                                    <span class="icon icon-mingcute--edit-2-fill text-base"></span>
                                </Button>
                                <Button
                                    severity="danger" small
                                    class="bg-opacity-80 p-1"
                                    title="delete"
                                    @click.prevent="state.askToDelete(item)">
                                    <span v-if="'deleted_at' in item && item.deleted_at" class="icon icon-mdi--delete-forever text-lg"></span>
                                    <span v-else class="icon icon-mdi--delete text-base"></span>
                                </Button>
                            </template>
                            <template v-else>
                                <Button
                                    severity="success" small
                                    class="bg-opacity-80 p-1"
                                    title="save"
                                    @click.prevent="state.submitInlineForm">
                                    <span class="icon icon-mdi--content-save text-base"></span>
                                </Button>
                                <Button
                                    severity="secondary" small
                                    class="p-1"
                                    title="cancel"
                                    @click.prevent="state.closeInlineForm">
                                    <span class="icon icon-mdi--close text-base"></span>
                                </Button>
                            </template>
                        </div>
                    </td>
                </tr>

                <template v-if="state.canEditInline && (item.id == state.inlineFormState?.form.id)">
                    <tr class="w-full text-sm px-2">
                        <td colspan="100%" class="py-1">
                            <div class="bg-x3 p-3 rounded">
                                <slot name="form" :data="state.inlineFormState" :cancel="state.closeInlineForm"></slot>
                            </div>
                        </td>
                    </tr>
                </template>
            </template>
            </tbody>
        </table>
    </div>
</template>
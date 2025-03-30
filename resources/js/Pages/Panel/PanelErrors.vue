<script setup lang="ts">
import dayjs from "dayjs";
import {__, TrKey} from "@/utils/localization";
import {computed, ref} from "vue";
import LayoutPanel from "@/Components/Layout/LayoutPanel.vue";
import {usePage} from "@/utils/inertia";
import InertiaRefreshButton from "@/Components/InertiaRefreshButton.vue";
import FormSelect from "@/Components/Form/FormSelect.vue";
import SearchInput from "@/Components/SearchInput.vue";
import {arrToSelectOpts, usePageDependentState} from "@/utils/utils";
import {PaginatedData, TErrorLog as TModel} from "@/utils/common_models";
import Pagination from "@/Components/Pagination.vue";
import CenteredModal from "@/Components/Overlays/CenteredModal.vue";
import TextInput from "@/Components/Form/TextInput.vue";
import Button from "@/Components/Button.vue";
import {useTable} from "@/Components/Table/useTable";

defineOptions({layout: LayoutPanel});

const page = usePage<{
    pageData: {
        errors: PaginatedData<TModel>,
    }
}>();

function shortenUrl(url: string) {
    // remove domain
    return url.replace(/^https?:\/\/[^/]+/, '');
}

const popup = usePageDependentState(0 as number, errId => {
    return page.props.pageData.errors.data.find(e => e.id === errId);
})
const query = ref('');
const orderBys = {
    updated_at: (a: TModel, b: TModel) => b.updated_at - a.updated_at,
    count: (a: TModel, b: TModel) => b.count - a.count,
}
const orderBy = ref<keyof typeof orderBys>('updated_at');

const errors = computed(() => {
    const res = page.props.pageData.errors.data.toSorted(orderBys[orderBy.value]);

    if (query.value) {
        const q = query.value.toLowerCase();
        return res.filter(e => {
            return e.url.toLowerCase().includes(q) || e.route.toLowerCase().includes(q) || e.message.toLowerCase().includes(q);
        });
    }

    return res;
})


const tableState = useTable('errors', {
    title: __('errors'),
    routeGroup: 'errors',
    itemsGetter: () => page.props.pageData.errors.data,
    searchFn: (e, q) => e.url.toLowerCase().includes(q) || e.route.toLowerCase().includes(q) || e.message.toLowerCase().includes(q),
    changeSequenceUrl: undefined,
    deletion: {
        canBe: (p) => {
            return false;
        },
        apiUrl: 'default',
    },
    defaultSort: {
        field: 'updated_at',
        desc: true,
    },
    canEditInline: false,
    createFn: () => {},
    editFn: () => {},
})
</script>

<template>
    <div class="flex flex-col overflow-y-auto px-2 flex-1">
        <div class="flex items-center gap-3 mb-2">
            <h1 class="text-2xl font-bold">{{ __('errors') }}</h1>
            <InertiaRefreshButton/>

            <i class="flex-1"></i>

            <span class="text-sm -mr-2">{{ __('sort') }}: </span>
            <FormSelect
                :options="arrToSelectOpts(Object.keys(orderBys) as TrKey[])"
                v-model="orderBy"
                :tr-func="(a: any) => __(a)"
                class="py-1"
            />

            <SearchInput v-model="query"/>
        </div>
        <div
            class="grid place-content-start items-end mt-3 flex-1 overflow-y-auto -mx-2 pr-1 text-sm gap-1"
             style="grid-template-columns: auto auto auto 1fr auto auto auto"
        >
            <span class="font-bold px-1 border-b border-x5">Id</span>
            <span class="font-bold px-1 border-b border-x5">Url</span>
            <span class="font-bold px-1 border-b border-x5">Route</span>
            <span class="font-bold px-1 border-b border-x5">Message</span>
            <span class="font-bold px-1 border-b border-x5">#</span>
            <span class="font-bold px-1 border-b border-x5">Updated</span>
            <span class="font-bold px-1 border-b border-x5">-</span>
            <template v-for="e in errors">
                <span class="border-b border-x3 py-0.5 px-1 text-xs">{{ e.id }}</span>
                <div class="border-b border-x3 py-0.5 px-1 truncate ">{{ shortenUrl(e.url) }}</div>
                <div class="border-b border-x3 py-0.5 px-1 truncate ">{{ e.route }}</div>
                <div class="border-b border-x3 py-0.5 px-1 truncate ">{{ e.message }}</div>
                <span class="border-b border-x3 py-0.5 px-1 text-xs">{{ e.count }}</span>
                <span class="border-b border-x3 py-0.5 px-1 text-xs">{{ dayjs(e.updated_at * 1000).format('DD.MM.YYYY HH:mm') }}</span>
                <div class="border-b border-x3 px-1 flex items-end">
                    <Button severity="raised" icon-only @click.prevent="popup.updateState(e.id)">
                        <i class="icon icon-mingcute--search-line text-base"></i>
                    </Button>
                </div>
            </template>
        </div>

        <Pagination
            :pagination="page.props.pageData.errors"
            :max-num-count="10"
        />

        <CenteredModal
            v-model:show="popup.hasState"
            close-button
            :key="popup.key"
            content-style="width: min(90vw, 700px);"
        >
            <div class="px-3 py-2 border-b border-x3">
                Error
            </div>
            <div v-if="popup.data" class="grid p-3 gap-2 items-center" style="grid-template-columns: auto 1fr">
                <span class="text-sm opacity-70 font-bold">Url: </span>
                <a class="btn-link" :href="popup.data.url">{{ popup.data.url }}</a>

                <span class="text-sm opacity-70 font-bold">Route: </span>
                <div>{{ popup.data.route }}</div>

                <span class="text-sm opacity-70 font-bold">Count: </span>
                <div>{{ popup.data.count }}</div>

                <span class="text-sm opacity-70 font-bold">Created at: </span>
                <div>{{ dayjs(popup.data!.created_at * 1000).format('DD.MM.YYYY HH:mm') }}</div>

                <span class="text-sm opacity-70 font-bold">Updated at: </span>
                <div>{{ dayjs(popup.data!.updated_at * 1000).format('DD.MM.YYYY HH:mm') }}</div>

                <span class="text-sm opacity-70 font-bold self-start pt-1">Message: </span>
                <TextInput
                    tag="textarea"
                    :model-value="popup.data.message + ' ' + popup.data.message + ' ' + popup.data.message + ' ' + popup.data.message + ' ' + popup.data.message + ' ' + popup.data.message + ' ' + popup.data.message + ' ' + popup.data.message + ' ' + popup.data.message + ' ' + popup.data.message + ' '"
                    class="overflow-y-auto"
                    style="height: min(600px, 70vh)"
                />

            </div>
        </CenteredModal>
    </div>
</template>
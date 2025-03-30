<script setup lang="ts">

import {router, useForm} from "@inertiajs/vue3";
import {computed, ref, watch} from "vue";
import {useDebounceFn} from "@vueuse/core";
import LayoutFrontend from "@/Components/Layout/LayoutFrontend.vue";
import {usePage} from "@/utils/inertia";
import {PaginatedData} from "@/utils/common_models";
import {TPost} from "@/utils/models";
import {uniqueId} from "@/utils/utils";
import LayoutFrontendContent from "@/Components/Layout/LayoutFrontendContent.vue";
import {__} from "@/utils/localization";
import Pagination from "@/Components/Pagination.vue";
import TextInput from "@/Components/Form/TextInput.vue";
import InputError from "@/Components/Form/InputError.vue";
import SearchInput from "@/Components/SearchInput.vue";
import PostBox from "@/Parts/Frontend/PostBox.vue";

defineOptions({layout: LayoutFrontend});

const page = usePage<{
    pageData: {
        query: string,
        items: PaginatedData<TPost>,
        total: number,
        limit: number,
    }
}>();
console.log(page.props.pageData)
const items = computed(() => page.props.pageData.items.data);

console.log(items.value)

const form = useForm({
    query: page.props.pageData.query,
});

const boldHint = ref(false);

function search() {
    const q = form.query.trim();
    if (q.length < 2) {
        boldHint.value = q.length == 1;
        return;
    }
    boldHint.value = false;
    router.reload({
        data: {q},
        replace: true,
    });
}

const debouncedSearch = useDebounceFn(search, 200);
watch(() => form.query, () => {
    boldHint.value = false;
    debouncedSearch();
});

const uniq = uniqueId()

function iid(key: keyof ReturnType<typeof form.data>) {
    return `${uniq}-${key}`
}
</script>

<template>
    <LayoutFrontendContent :title="__('search')" has-overflow>
        <template #content>
            <div class="px-4 pt-2 md:h-full md:overflow-y-auto md:flex flex-col">
                <h3 class="font-bold text-2xl my-3 flex items-center gap-4">
                    {{ __('search') }}
                </h3>

                <label :for="iid('query')" class="flex gap-2">
                    {{ __('search_query') }}
                    <span class="text-sm mt-0.5 italic" :class="{'font-bold': boldHint}">
                        ({{ __('min_X_max_Y_characters').replace(':x', '2').replace(':y', '24') }})
                    </span>
                </label>
                <div class="flex flex-col md:flex-row gap-3 lg:gap-8 md:items-start">
                    <div class="flex gap-2 flex-1 items-center" style="grid-template-columns: 1fr auto">
                        <div class="w-full flex-1">
                            <!--<SearchInput v-model="form.query" :id="iid('query')" class="w-full" required/>-->
                            <TextInput v-model="form.query" :id="iid('query')" class="w-full" required/>
                            <InputError :message="form.errors.query"/>
                        </div>
                        <button type="submit" class="btn btn-primary px-4 gap-1">
                            <i class="icon icon-mingcute--search-line text-lg"></i>
                            {{ __('search') }}
                        </button>
                    </div>
                </div>


                <template v-if="page.props.pageData.query && items.length > 0">
                    <h3 class="px-2 font-bold text-2xl my-3 flex items-center gap-4 mt-4 md:mt-8">
                        {{ __('search_results') }}
                    </h3>
                    <template v-if="form.query.trim().length">
                        <div class="md:overflow-y-auto md:flex-1 md:-mr-4">
                            <div
                                class="grid gap-2 max-xs:grid-cols-1 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                            >
                                <PostBox
                                    v-for="item in items"
                                    :key="item.id"
                                    :post="item"
                                    minimal/>
                            </div>
                        </div>
                        <Pagination :pagination="page.props.pageData.items" class="mt-4"/>
                    </template>
                </template>
            </div>
        </template>
    </LayoutFrontendContent>
</template>
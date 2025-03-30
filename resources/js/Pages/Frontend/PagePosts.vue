<script setup lang="ts">
import LayoutFrontend from "@/Components/Layout/LayoutFrontend.vue";
import {usePage} from "@/utils/inertia";
import {PaginatedData} from "@/utils/common_models";
import {TPost} from "@/utils/models";
import {computed} from "vue";
import {__} from "@/utils/localization";
import LayoutFrontendContent from "@/Components/Layout/LayoutFrontendContent.vue";
import Pagination from "@/Components/Pagination.vue";
import PostBox from "@/Parts/Frontend/PostBox.vue";

defineOptions({layout: LayoutFrontend});


const page = usePage<{
    pageData: {
        posts: PaginatedData<TPost>,
    }
}>();
const posts = computed(() => page.props.pageData.posts.data);

</script>

<template>
    <LayoutFrontendContent :title="__('posts')">
        <template #content>
            <div class="flex flex-col gap-5 pt-4 pb-9">
                <PostBox v-for="p in posts" :key="p.id" :post="p" />
                <Pagination :pagination="page.props.pageData.posts" bg="bg-x0" queryParam="page" />
            </div>
        </template>
    </LayoutFrontendContent>
</template>
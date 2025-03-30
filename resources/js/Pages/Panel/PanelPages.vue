<script setup lang="ts">

import LayoutPanel from "@/Components/Layout/LayoutPanel.vue";
import {usePage} from "@/utils/inertia";
import {TPost} from "@/utils/models";
import {PostType} from "@/utils/generated_enums";
import {__} from "@/utils/localization";
import PostsGrid from "@/Parts/Panel/PostsGrid.vue";

defineOptions({layout: LayoutPanel});

const page = usePage<{
    pageData: {
        posts: TPost[]
    }
}>()
</script>

<template>
    <PostsGrid
        :post-type="PostType.page"
        :posts="page.props.pageData.posts"
        :title="__('pages')"
    />
</template>
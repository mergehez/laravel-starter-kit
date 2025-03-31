<script setup lang="ts">

import {router, Link} from "@inertiajs/vue3";
import {TPost} from "@/utils/models";
import {dt} from "@/utils/date_helpers";
import {__} from "@/utils/localization";

const props = defineProps<{
    post: TPost,
    minimal?: boolean,
}>()

function visitPost() {
    router.visit(route('page.post', props.post.slug), {
        replace: false,
        preserveScroll: false,
    });
}
</script>

<template>
    <div class="flex flex-col bg-x0 px-6 md:px-12 gap-1"
         :class="minimal ? 'py-5 md:py-9' : 'py-6 md:py-12'"
    >
         <!--style="border: 1px solid rgb(0 0 0 / 0%)"-->
        <h2 class="text-2xl uppercase font-bold">
            <Link :href="route('page.post', post.slug)" :preserveScroll="false"
                   class="hover:opacity-80"
                   :class="minimal ? 'text-red-600 hover:opacity-80' : 'text-black hover:opacity-70'">
                {{ __(post.title) }}
            </Link>
        </h2>

        <div class="mt-1">{{ dt.asDayjs(post.created_at*1000).format('MMMM D, YYYY').toUpperCase() }}</div>

        <div v-if="!minimal && post.image_url" class="mt-6">
            <!--<Link :href="route('page.post', post.slug)" :preserve-scroll="false" class="btn-link w-full max-h-screen-1/2 overflow-hidden">-->
            <Link :href="route('page.post', post.slug)" :preserve-scroll="false" class="btn-link w-full overflow-hidden">
                <img :src="post.image_url" :alt="__(post.title)" class="w-full">
            </Link>
        </div>

        <hr v-if="minimal" class="border-2 border-black">

        <p class="mt-6 text-lg leading-snug">
            <span v-html="__(post.content).replace(/<(|\/)br>/g,'')"></span>
            <Link :href="route('page.post', post.slug)" :preserve-scroll="false" class="btn btn-raised">
                {{ __('read_more') }}
            </Link>
        </p>
    </div>
</template>
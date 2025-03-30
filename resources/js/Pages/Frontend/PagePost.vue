<script setup lang="ts">
import {computed} from "vue";
// import 'ckeditor5/ckeditor5.css';
// import '../../../sass/ckeditor.css';
import LayoutFrontend from "@/Components/Layout/LayoutFrontend.vue";
import {usePage} from "@/utils/inertia";
import {TPost} from "@/utils/models";
import {MediaLibraryConfig} from "@/Components/MediaLibrary/media-library-types";
import LayoutFrontendContent from "@/Components/Layout/LayoutFrontendContent.vue";
import {dt} from "@/utils/date_helpers";
import MediaLibrary from "@/Components/MediaLibrary/MediaLibrary.vue";
import {__} from "@/utils/localization";
import {stripHTML} from "@/utils/utils";

defineOptions({layout: LayoutFrontend});

const page = usePage<{
    pageData: {
        post: TPost,
    }
}>()

const post = computed(() => page.props.pageData.post)
const isPage = computed(() => page.props.pageData.post.type === 'page')

// const imageConfig: MediaLibraryConfig = {
//     baseDir: "uploads",
//     baseSize: {
//         name: 'Original',
//         nameSuffix: '',
//         scale: 100,
//         aspectRatio: 1,
//     },
//     resizes: [],
//     extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
// }
</script>

<template>
    <LayoutFrontendContent
        :title="__(post.seo?.title) || __(post.title)"
        :description="__(post.seo?.description) || stripHTML(__(post.content))"
        class="post-content"
        :has-top-shadow="!!post.image_url"
        content-class="bg-x0 w-full p-0 pb-3.5 mb-9"
    >
        <!--<IHead :title="post.title" />-->
        <div v-if="post.image_url">
            <!--<img :src="post.image_url" alt="post image" class="w-full"/>-->
            <img :src="post.image_url" alt="post image" class="w-full max-h-96 object-cover"/>
        </div>

        <div class="px-9 py-2">
            <h1 class="text-4xl font-anton uppercase" :class="post.image_url ? 'mt-6': 'mt-10'">
                {{ __(post.title)}}
            </h1>
            <div v-if="!isPage" class="">{{ dt.asDayjs(post.published_at!).format('MMMM D, YYYY')  }}</div>

            <div class="post-content" :class="isPage ? 'mt-6' : 'mt-12'">
                <div class="ck-content" v-html="__(post.content)">
                </div>
            </div>
        </div>

        <!--<div class="flex justify-between py-5 px-9">-->
        <!--    <a class="btn btn-link cursor-pointer text-base">-->
        <!--        previous post: <br>-->
        <!--        Wir kämpfen weiter, mit den Träumen der Gefallenen </a>-->
        <!--    <a class="btn btn-link cursor-pointer text-base">Free Kanaky! Demonstration in Mulhouse </a>-->
        <!--</div>-->

        <!--<MediaLibrary :visible="false" :max-size="512*1024" :config="imageConfig"></MediaLibrary>-->
    </LayoutFrontendContent>
</template>

<script setup lang="ts">
import {computed, ref} from "vue";
import {Link} from "@inertiajs/vue3";
import LayoutFrontend from "@/Components/Layout/LayoutFrontend.vue";
import {usePage} from "@/utils/inertia";
import {TPost, TSlider} from "@/utils/models";
import LayoutFrontendContent from "@/Components/Layout/LayoutFrontendContent.vue";
import { __ } from "@/utils/localization";
import Slider from "@/Components/Slider.vue";

defineOptions({layout: LayoutFrontend});

const page = usePage<{
    pageData: {
        posts: TPost[],
        slider: TSlider,
    }
}>()
const sliderItems = computed(() => page.props.pageData.slider.items);
const posts = computed(() => page.props.pageData.posts);
const currentSlide = ref(0)
</script>

<template>
    <LayoutFrontendContent>
        <template #content>
            <div class="flex flex-col pb-9 mt-0">
                <Slider v-model="currentSlide" :count="sliderItems.length" class="mb-4">
                    <template #item="{index}">
                        <img :src="sliderItems[index].image_url" alt="..." class="w-full h-full">
                        <div class="absolute inset-0 flex flex-col justify-end items-center pb-10 px-3 gap-1">
                            <div
                                class="text-2xl px-5 rounded text-center leading-tight"
                                :style="{
                                    color: sliderItems[index].text_color,
                                    backgroundColor: sliderItems[index].bg_color
                                }">
                                {{ __(sliderItems[index].title) }}
                            </div>
                            <div
                                class="text-base px-2 rounded text-center leading-tight"
                                :style="{
                                    color: sliderItems[index].text_color,
                                    backgroundColor: sliderItems[index].bg_color
                                }">
                                {{ __(sliderItems[index].subtitle) }}
                            </div>
                        </div>
                    </template>
                </Slider>

                <!--<PostBox v-for="p in posts" :key="p.id" :post="p" minimal/>-->

                <div class="text-center mt-7">
                    <Link :href="route('page.posts')" class="font-medium btn btn-secondary text-lg px-5">{{ __('see_all_posts') }}</Link>
                </div>
            </div>
        </template>
    </LayoutFrontendContent>
</template>

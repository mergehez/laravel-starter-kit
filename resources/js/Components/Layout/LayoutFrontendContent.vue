<script setup lang="ts">
import {twMerge} from "tailwind-merge";
import {usePage} from "@/utils/inertia";
import IHead from "@/Components/IHead.vue";

defineProps<{
    contentClass?: string,
    class?: string,
    title?: string,
    description?: string,
    image?: string,
    hasTopShadow?: boolean,
    removeClassContent?: boolean,
    hasOverflow?: boolean,
}>()

const page = usePage()
</script>

<template>
    <main
        :class="twMerge(
            'flex flex-col md:flex-row gap-8 md:gap-5 flex-1',
            removeClassContent ? '' : 'content',
            hasOverflow ? 'h-full overflow-y-auto' : '',
            $props.class
        )">
        <IHead
            :title="title || page.props.info.siteTitle"
            :description="description || page.props.info.siteDesc"
            :image="image"
        />

        <slot name="top">
                <!--:style="{-->
                <!--    boxShadow: hasTopShadow == false ? '0 32px 50px -12px rgb(var(&#45;&#45;bg7))' : '0 25px 50px -12px rgb(var(&#45;&#45;bg-reverse))'-->
                <!--}"-->
            <div
                class="w-full flex-1 h-full"
                :class="hasOverflow ? 'md:overflow-y-auto' : ''">
                <slot name="content">
                    <div :class="twMerge('flex flex-col p-9 ', $props.contentClass)" style="">
                        <slot/>
                    </div>
                </slot>
            </div>
        </slot>
    </main>
</template>

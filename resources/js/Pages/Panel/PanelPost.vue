<script setup lang="ts">

import {computed, onMounted, Ref, ref, watch} from "vue";
import {Link} from "@inertiajs/vue3";
import {vAutoAnimate} from "@formkit/auto-animate";
import {useTextareaAutosize} from "@vueuse/core";
// import "@mergehez/vue-tiptap-editor/styles.css"
import LayoutPanel from "@/Components/Layout/LayoutPanel.vue";
import {usePage} from "@/utils/inertia";
import {TPost} from "@/utils/models";
import {createPostForm, getPostStatusOptions} from "@/utilsForm/createPostForm";
import {AppDisplayLang, PostType} from "@/utils/generated_enums";
import {latinize} from "@/utils/utils";
import {defaultMediaLibraryConfig, MediaLibraryConfig} from "@/Components/MediaLibrary/media-library-types";
import IHead from "@/Components/IHead.vue";
import {__} from "@/utils/localization";
import FormSelect from "@/Components/Form/FormSelect.vue";
import TextInput from "@/Components/Form/TextInput.vue";
import MediaLibrary from "@/Components/MediaLibrary/MediaLibrary.vue";
import SeoFormContent from "@/Parts/Panel/SeoFormContent.vue";
import CKEditor from "@/Components/Form/CKEditor/CKEditor.vue";
import PanelLangSelect from "@/Components/PanelLangSelect.vue";
import {localeNames} from "@/utils/constants";
import globalState from "@/utils/globalState";
import InputError from "@/Components/Form/InputError.vue";
import AutosizeTextarea from "@/Components/Form/AutosizeTextarea.vue";
import TranslatableInput from "@/Components/Form/TranslatableInput.vue";
import InputLabel from "@/Components/InputLabel.vue";

defineOptions({layout: LayoutPanel});

const page = usePage<{
    pageData: {
        post: TPost
    }
}>()
const post = computed(() => page.props.pageData.post)

const formState = createPostForm(post.value.type, {
    currentItem: () => post.value,
});
const form = computed(() => formState.form);

const loc = computed(() => globalState.panelLang)

let supposedSlug = '';
watch(() => form.value.title.en, (newTitle) => {
    // form.value.title[loc.value] = titleInputs.en.textareaInput.value;
    if (post.value.type == PostType.page || formState.form.id)
        return

    supposedSlug = latinize(newTitle)
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-');
    if (supposedSlug.startsWith('-')) {
        supposedSlug = supposedSlug.substring(1);
    }
    if (supposedSlug.endsWith('-')) {
        supposedSlug = supposedSlug.substring(0, supposedSlug.length - 1);
    }
    if (!slugManuallyChanged.value) {
        form.value.slug = supposedSlug;
    }
})

const mediaLibraryVisible = ref(false);
const mediaLibraryConfig = defaultMediaLibraryConfig;

const slugLocked = ref(true);
const slugManuallyChanged = ref(false);

function onSlugInput(_: InputEvent) {
    slugManuallyChanged.value = form.value.slug !== supposedSlug;
    console.log(slugManuallyChanged.value);
}

// function onContentChange(json: object, toHtml: () => string) {
//     console.log('on change')
//     form.value.content_tiptap = json;
//     form.value.content = toHtml();
// }

// onMounted(() => {
//     setTimeout(() => {
//         for (const key of Object.keys(localeNames)) {
//             titleInputs[key].triggerResize();
//             console.log({
//                 [key]: titleInputs[key].refTextarea
//             })
//         }
//     }, 1000);
// })

</script>

<template>
    <div class="flex flex-col h-full ">
        <IHead :title="post.id ? __('edit_post') : __('add_new_post')"/>
        <div class="flex flex-col px-3 pb-10 gap-3" v-auto-animate>
            <PanelLangSelect :form-errors="form.errors" />
            <div class="pt-2 flex justify-between gap-3 items-center">
                <Link v-if="post.type == PostType.post" :href="route('panel.posts')" class="btn btn-secondary py-px gap-1">
                    <span class="icon icon-mdi--arrow-back text-lg"></span>
                    <span class="py-1">{{ __('back_to_all_posts') }}</span>
                </Link>
                <Link v-else :href="route('panel.pages')" class="btn btn-secondary py-px gap-1">
                    <span class="icon icon-mdi--arrow-back text-lg"></span>
                    <span class="py-1">{{ __('back_to_all_pages') }}</span>
                </Link>
                <i class="flex-1"></i>
                <div>
                    {{ __('status') }}:
                    <FormSelect
                        :options="getPostStatusOptions(post)"
                        v-model="form.status"
                        class="py-1 font-bold pr-7"
                        :tr-func="__ as any"
                    />
                </div>
                <template v-if="post.status == 'publish' && post.published_at">
                    <a target="_blank" :href="route('page.post', post.slug)" class="btn btn-secondary py-px gap-1">
                        <span class="icon icon-mdi--external-link text-lg"></span>
                        <span class="py-1">{{ __('view_page') }}</span>
                    </a>
                </template>
                <button @click="formState.submit" class="btn btn-success py-px gap-1">
                    <span class="icon icon-mdi--content-save text-lg"></span>
                    <span class="py-1">{{ __('save') }}</span>
                </button>
            </div>
            <div v-if="Object.keys(form.errors).length" class="alert alert-danger leading-tight">
                <div v-for="(val, key) in form.errors" :key="key">
                    <b>{{ key }}</b>: {{ val }}
                </div>
            </div>

            <div v-if="form.type == PostType.post" class="flex gap-2 items-start px-2">
                <div class="flex-1 grid  items-center" style="grid-template-columns: auto 1fr">
                    <template v-if="form.slug || form.title">
                        <InputLabel label-key="link" />
                        <div class="flex gap-2 items-center px-2 flex-1">
                            <TextInput
                                v-model="form.slug"
                                label="Slug"
                                @input="onSlugInput"
                                :disabled="slugLocked"
                                required
                                class="flex-1 rounded-sm !bg-x1"
                                :class="slugLocked ? 'border-x1' : ''"
                            />
                            <button
                                class="px-1.5 py-1 icon text-xl"
                                :class="slugLocked ? 'icon-mdi--lock text-red-800' : 'icon-mdi--lock-open text-green-800'"
                                @click.prevent="slugLocked = !slugLocked">
                            </button>
                        </div>
                    </template>
                    <InputLabel loc label-key="title" class="mt-5" />
                    <i></i>
                    <TranslatableInput class="col-span-2">
                        <template #item="{l, style, className}">
                            <AutosizeTextarea
                                v-model="form.title[l]"
                                :style="style"
                                :class="className"
                                class="p-2 text-3xl font-anton font-bold w-full"
                            />
                        </template>
                    </TranslatableInput>
                </div>
                <button
                    v-if="!form.image_url"
                    class="flex items-center justify-center h-32 bg-x2/80 hover:bg-x3 p-5 text-xl opacity-70 relative cursor-pointer gap-1"
                    @click.prevent="mediaLibraryVisible = true">
                    <span class="icon icon-mdi--plus text-2xl opacity-70"></span>
                    <span>{{ __('add_post_image') }}</span>
                </button>
                <div v-else class="relative bg-x1/50">
                    <img :src="form.image_url" alt="Beitragsbild" class="w-full h-32 object-contain"/>
                    <div class="absolute top-2 right-2 flex flex-col gap-2">
                        <button
                            class="bg-x3 px-1.5 py-1 btn btn-secondary items-center"
                            @click.prevent="() => form.image_url = ''" :title="__('remove')">
                            <span class="icon icon-mdi--delete text-xl"></span>
                        </button>
                        <button
                            class="bg-x3 px-1.5 py-1 btn btn-secondary items-center"
                            @click.prevent="mediaLibraryVisible = true" :title="__('change')">
                            <span class="icon icon-mdi--image-edit text-xl"></span>
                        </button>
                    </div>
                </div>
            </div>

            <template v-else>
                <InputLabel loc label-key="title" class="w-min" />
                <TranslatableInput class="-mt-3">
                    <template #item="{l, style, className}">
                        <AutosizeTextarea
                            v-model="form.title[l]"
                            :style="style"
                            :class="className"
                            class="p-2 text-3xl font-anton font-bold w-full"
                        />
                    </template>
                </TranslatableInput>
            </template>


            <InputError :message="form.errors.title?.[loc]" />
            <InputError :message="form.errors.content?.[loc]" />

            <InputLabel loc label-key="page_content" class="w-min" />
            <TranslatableInput>
                <template #item="{l, style, className}">
                    <CKEditor
                        v-model="form.content[l]"
                        :style="style"
                        :class="className"
                        class="flex-1 post-content -mt-2"
                        :placeholder="__('type_title_here')"
                    />
                </template>
            </TranslatableInput>
            <!--<CKEditor-->
            <!--    class="flex-1 post-content"-->
            <!--    v-model="form.content[currentLang]"-->
            <!--    :placeholder="__('type_title_here')"-->
            <!--/>-->

            <SeoFormContent :form="form.seo!"/>

            <MediaLibrary
                v-model:visible="mediaLibraryVisible"
                :config="mediaLibraryConfig"
                :on-selected="(t) => form.image_url = t.url"
                id="post-media-lib"
            />
        </div>
    </div>
</template>

<style>
.post-content .ProseMirror {
    margin-left: 0;
}
</style>
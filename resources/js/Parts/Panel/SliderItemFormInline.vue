<script setup lang="ts">

import {computed, reactive} from "vue";
import {router} from "@inertiajs/vue3";
import {TPost} from "@/utils/models";
import {__} from "@/utils/localization";
import globalState, {loc} from "@/utils/globalState";
import InputError from "@/Components/Form/InputError.vue";
import TextInput from "@/Components/Form/TextInput.vue";
import TooltipableContent from "@/Components/Overlays/TooltipableContent.vue";
import ColorBox from "@/Components/ColorBox.vue";
import {useGlobalSearch} from "@/Components/Overlays/useGlobalSearch";
import {createSliderItemForm} from "@/utilsForm/createSliderForm";
import PanelLangSelect from "@/Components/PanelLangSelect.vue";
import InputLabel from "@/Components/InputLabel.vue";

const props = defineProps<{
    formState: ReturnType<typeof createSliderItemForm>
}>()

const emit = defineEmits<{
    'close': [],
}>();

const submitRes = reactive({
    type: 'success' as 'success' | 'danger',
    message: '',
})

function submit() {
    props.formState.submit()
        .then((t) => {
            submitRes.type = 'success';
            submitRes.message = __('saved_successfully');
            props.formState.form.reset()
            router.reload({
                onFinish: () => {
                    setTimeout(() => {
                        emit('close');
                    }, 2000)
                }
            })
        })
        .catch(() => {
            submitRes.type = 'danger';
            submitRes.message = __('something_went_wrong');
        })
}

function openMediaLibrary() {
    globalState.mediaLibrary.open((url) => {
        props.formState.form.image_url = url.url;
    })
}

function changeUrlUsingMediaLibrary() {
    globalState.mediaLibraryWithPdf.open((t) => {
        props.formState.form.url = t.url;
    })
}

const {openSearchPopup} = useGlobalSearch();

function changeUrlSearchingPosts() {
    openSearchPopup({
        onSelected: (post: any) => {
            props.formState.form.url = '/' + (post as TPost).slug;
        },
        include: 'post',
    })
}

const textColors = {
    '#f59e0b': 'white',
    '#ea580c': 'white',
    '#dc2626': 'white',
    '#db2777': 'white',
    '#15803d': 'white',
    '#0d9488': 'white',
    '#86efac': 'white',
    '#06b6d4': 'white',
    '#0284c7': 'white',
    '#9333ea': 'white',
    '#020617': 'white',
    '#64748b': 'white',
    '#ffffff': 'black',
}
const opacities = ['22', '55', '88', 'aa', 'dd', 'ff']

const iid = props.formState.iid;
</script>

<template>
    <form @submit.prevent="submit" class="flex flex-col gap-2 w-full pb-3 px-5">
        <!--<div class="flex flex-col gap-2 items-start w-full">-->
        <div class="flex flex-col aspect-video w-full relative">
            <button
                v-if="!formState.form.image_url"
                class="flex items-center justify-center bg-x2 hover:opacity-70 p-5 relative cursor-pointer gap-1 w-full h-full"
                @click.prevent="openMediaLibrary">
                <span class="icon icon-mdi--plus text-2xl opacity-70"></span>
                <span class="text-base">{{ __('add_image') }}</span>
            </button>
            <template v-else>
                <img :src="formState.form.image_url" alt="Sliderbild" class="w-full h-full object-fill"/>
                <div class="absolute inset-0 flex flex-col justify-end items-center pb-10 gap-1 px-3">
                    <div
                        class="text-2xl px-5 rounded"
                        :style="{
                                    color: formState.form.text_color,
                                    backgroundColor: formState.form.bg_color
                                }">
                        {{ formState.form.title[loc] }}
                    </div>

                    <div
                        class="text-base px-5 rounded text-center leading-tight"
                        :style="{
                                    color: formState.form.text_color,
                                    backgroundColor: formState.form.bg_color
                                }">
                        {{ formState.form.subtitle[loc] }}
                    </div>
                </div>
                <div class="absolute top-2 right-2 flex flex-col gap-2">
                    <button
                        class="bg-x3 px-1.5 py-1 btn btn-secondary items-center"
                        @click.prevent="formState.form.image_url = ''" :title="__('remove')">
                        <span class="icon icon-mdi--delete text-xl"></span>
                    </button>
                    <button
                        class="bg-x3 px-1.5 py-1 btn btn-secondary items-center"
                        @click.prevent="openMediaLibrary" :title="__('change')">
                        <span class="icon icon-mdi--image-edit text-xl"></span>
                    </button>
                </div>
            </template>
            <InputError :message="formState.form.errors.image_url" class="pl-px"/>
        </div>
        <PanelLangSelect center />
        <div class="flex-1 grid items-center" style="grid-template-columns: auto 1fr">
            <InputLabel :for="iid('title')" loc label-key="title"/>
            <TextInput :id="iid('title')" v-model="formState.form.title[loc]" class="flex-1 py-1"/>
            <InputError :message="formState.form.errors.title" class="pl-px" second-col/>

            <InputLabel :for="iid('subtitle')" loc label-key="subtitle"/>
            <div class="mt-1">
                <TextInput :id="iid('subtitle')" v-model="formState.form.subtitle[loc]" class="py-1 w-full"/>
            </div>
            <InputError :message="formState.form.errors.subtitle" class="pl-px" second-col/>


            <InputLabel :for="iid('url')" label-key="link"/>
            <div class="flex gap-2 items-center mt-1">
                <TextInput
                    :id="iid('url')"
                    v-model="formState.form.url"
                    class="py-1 flex-1"
                />
                <TooltipableContent :text="__('select_a_post')">
                    <button
                        class="px-1.5 py-1 icon text-xl icon icon-mdi--magnify"
                        @click.prevent="changeUrlSearchingPosts()" :title="__('change')">
                    </button>
                </TooltipableContent>
                <TooltipableContent :text="__('choose_from_media_library')">
                    <button
                        class="px-1.5 py-1 icon text-xl icon icon-mdi--plus"
                        @click.prevent="changeUrlUsingMediaLibrary()" :title="__('change')">
                    </button>
                </TooltipableContent>
            </div>
            <InputError :message="formState.form.errors.url" class="pl-px" second-col/>

            <span class="font-bold mr-2 mt-1 col-span-2">{{ __('text_color') }}</span>
            <div class="flex gap-2 items-center col-span-2">
                <template v-for="(tick, clr) in textColors" :key="clr">
                    <ColorBox
                        :color="clr"
                        :tick="formState.form.text_color == clr"
                        :tick-color="tick"
                        class="cursor-pointer"
                        @click.prevent="formState.form.text_color = clr"
                    />
                </template>
            </div>

            <i class="size-7"></i>
            <InputError :message="formState.form.errors.text_color" class="pl-px" second-col/>

            <span class="font-bold mr-2 mt-1 col-span-2">{{ __('bg_color') }}</span>
            <template v-for="op in opacities" :key="op">
                <div class="flex gap-2 col-span-2 mt-1">
                    <template v-for="(tick, clr) in textColors" :key="clr">
                        <ColorBox
                            :color="clr+op"
                            :tick="formState.form.bg_color == clr+op"
                            :tick-color="tick"
                            class="cursor-pointer"
                            @click.prevent="formState.form.bg_color = clr+op"
                        />
                    </template>
                </div>
            </template>
            <InputError :message="formState.form.errors.bg_color" class="pl-px" second-col/>
        </div>
        <!--</div>-->
        <div class="flex justify-end gap-2 col-span-2 w-full">
            <div class="flex-1">
                <span v-if="submitRes.message" :class="submitRes.type == 'success' ? 'text-green-800' : 'text-red-500'">
                    {{ submitRes.message }}
                </span>
            </div>
            <button class="btn btn-light py-px" @click.prevent="emit('close')">{{ __('cancel') }}</button>
            <button class="btn btn-success py-px">{{ __('save') }}</button>
        </div>
    </form>
</template>
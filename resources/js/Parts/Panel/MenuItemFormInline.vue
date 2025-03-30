<script setup lang="ts">

import {reactive, watch} from "vue";
import {router} from "@inertiajs/vue3";
import {__, __ToTrObj} from "@/utils/localization";
import TextInput from "@/Components/Form/TextInput.vue";
import {usePage} from "@/utils/inertia";
import {MenuItemType, SpecialPage} from "@/utils/generated_enums";
import FormSelect from "@/Components/Form/FormSelect.vue";
import {cloneTrObj, compareTrObjs, enumToSelectOptions} from "@/utils/utils";
import {createMenuItemForm} from "@/utilsForm/createMenuForm";
import {loc} from "@/utils/globalState";
import {TrObj, TSelectOption} from "@/utils/common_models";
import {TPost} from "@/utils/models";
import Button from "@/Components/Button.vue";
import PanelLangSelect from "@/Components/PanelLangSelect.vue";

const page = usePage<{
    pageData: {
        posts: TSelectOption<number, TrObj>[],
        pages: TSelectOption<number, TrObj>[],
    }
}>()

const props = defineProps<{
    formState: ReturnType<typeof createMenuItemForm>
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
        .then(() => {
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

// const specialSites = revertObj(SpecialPage);
const specialSitesOptions = enumToSelectOptions(SpecialPage).map(t => ({
    ...t,
    label: __ToTrObj(t.label)
}));
// const pageOptions = enumToSelectOptions(page.props.pageData.pages);

function trySetTitleFromVal(newVal: string|number|undefined, oldValue: string|number|undefined, opts: TSelectOption<string|number, TrObj>[]) {
    const oldOpt = opts.find(t => t.value == oldValue);
    if (!newVal || (oldValue && !oldOpt)) {
        return;
    }
    const newOpt = opts.find(t => t.value == newVal)!;
    if (!oldOpt || compareTrObjs(oldOpt.label, props.formState.form.title)) {
        props.formState.form.title = cloneTrObj(newOpt.label);
    }
}

if (props.formState.form.type == MenuItemType.special_page) {
    watch(() => props.formState.form.url, (url, oldValue) => {
        trySetTitleFromVal(url, oldValue, specialSitesOptions);
    })
}
if (props.formState.form.type == MenuItemType.page) {
    watch(() => props.formState.form.post_id, (newVal, oldValue) => {
        trySetTitleFromVal(newVal, oldValue, page.props.pageData.pages);
    })
}
if (props.formState.form.type == MenuItemType.post) {
    watch(() => props.formState.form.post_id, (newVal, oldValue) => {
        trySetTitleFromVal(newVal, oldValue, page.props.pageData.posts);
    })
}
</script>

<template>
    <form @submit.prevent="submit" class="grid gap-2 items-center w-full" style="grid-template-columns: auto 1fr">
        <div class="col-span-2">
            <PanelLangSelect />
        </div>
        <template v-if="formState.form.type == MenuItemType.special_page">
            <label class="font-bold">{{ __('page') }}: </label>
            <FormSelect
                v-model="formState.form.url"
                :options="specialSitesOptions"
                required
                class="flex-1 py-0.5"/>
        </template>
        <template v-if="formState.form.type == MenuItemType.page">
            <label class="font-bold">{{ __('page') }}: </label>
            <FormSelect
                v-model="formState.form.post_id"
                :options="page.props.pageData.pages"
                required
                class="flex-1 py-0.5"/>
        </template>
        <template v-if="formState.form.type == MenuItemType.post">
            <label class="font-bold">{{ __('post') }}: </label>
            <FormSelect
                v-model="formState.form.post_id"
                :options="page.props.pageData.posts"
                required
                class="flex-1 py-0.5"/>
        </template>

        <template v-if="formState.form.type == MenuItemType.link">
            <label class="font-bold">{{ __('link') }}: </label>
            <TextInput v-model="formState.form.url" required class="flex-1 py-0.5"/>
        </template>

        <label class="font-bold">{{ __('title') }}: </label>
        <TextInput v-model="formState.form.title[loc]" required class="flex-1 py-0.5"/>

        <div class="flex justify-end gap-2 col-span-2">
            <div class="flex-1">
                <span v-if="submitRes.message" :class="submitRes.type == 'success' ? 'text-green-800' : 'text-red-500'">
                    {{ submitRes.message }}
                </span>
            </div>
            <Button severity="secondary" small-y @click.prevent="emit('close')">{{ __('cancel') }}</Button>
            <Button severity="success" small-y type="submit">{{ __('save') }}</Button>
        </div>
    </form>
</template>
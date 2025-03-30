<script setup lang="ts">

import AppLayoutPanel from "@/Components/Layout/LayoutPanel.vue";
import {computed} from "vue";
import {usePage} from "@/utils/inertia";
import {KeyValueKey} from "@/utils/generated_enums";
import {_createFormState, TCreateFormStateOpts} from "@/utils/form_helpers";
import {TModelForm, TrObj, TSelectOption} from "@/utils/common_models";
import {Head, Link} from "@inertiajs/vue3";
import TextInput from "@/Components/Form/TextInput.vue";
import {__} from "@/utils/localization";
import InputError from "@/Components/Form/InputError.vue";
import FormSelect from "@/Components/Form/FormSelect.vue";
import {loc} from "@/utils/globalState";
import {enumToSelectOptions} from "@/utils/utils";
import Icon from "@/Components/Icon.vue";
import Button from "@/Components/Button.vue";

defineOptions({layout: AppLayoutPanel});

const page = usePage<{
    pageData: {
        keyValues: TModel,
        menus: TSelectOption<number, TrObj>[],
        sliders: TSelectOption<number, TrObj>[],
    }
}>();

type TModel = { id: number } & Record<KeyValueKey, any>
type TKeyValueForm = TModelForm<TModel>;

const keyValues = computed(() => page.props.pageData.keyValues);
const sliderOptions = computed(() => {
    const sliders = page.props.pageData.sliders;
    return sliders.map((s) => ({
        value: s.value,
        label: s.label?.[loc.value] || s.label?.en || '',
    }));
})

// function createKeyValueForm(itemGetter: () => Record<KeyValueKey | 'id', string> | undefined) {
function createKeyValueForm(opts?: TCreateFormStateOpts<TModel, TKeyValueForm>) {
    return _createFormState(
        opts,
        (_item) => {
            const item = _item!;
            console.log('item', item);
            const res: TKeyValueForm = {
                id: 1,
                [KeyValueKey.siteTitle]: item[KeyValueKey.siteTitle],
                [KeyValueKey.siteDesc]: item[KeyValueKey.siteDesc],
                [KeyValueKey.mainMenu]: Number(item[KeyValueKey.mainMenu] || '0'),
                [KeyValueKey.mobileMenu]: Number(item[KeyValueKey.mobileMenu] || '0'),
                [KeyValueKey.homeSlider]: Number(item[KeyValueKey.homeSlider] || '0'),
                [KeyValueKey.facebookUrl]: item[KeyValueKey.facebookUrl],
                [KeyValueKey.instagramUrl]: item[KeyValueKey.instagramUrl],
                [KeyValueKey.youtubeUrl]: item[KeyValueKey.youtubeUrl],
                [KeyValueKey.twitterUrl]: item[KeyValueKey.twitterUrl],
                [KeyValueKey.telegramNumber]: item[KeyValueKey.telegramNumber],
                [KeyValueKey.whatsappNumber]: item[KeyValueKey.whatsappNumber],
                [KeyValueKey.contactEmail]: item[KeyValueKey.contactEmail],
                [KeyValueKey.androidUrl]: item[KeyValueKey.androidUrl],
                [KeyValueKey.iosUrl]: item[KeyValueKey.iosUrl],
                [KeyValueKey.facebookAppId]: item[KeyValueKey.facebookAppId],
                [KeyValueKey.notificationEmails]: item[KeyValueKey.notificationEmails],
            };

            return res;
        }, (isPost, data) => {
            // 'key_values'
            return undefined as unknown as Promise<TKeyValueForm>
        }
    );
}

const formState = createKeyValueForm({
    currentItem: () => keyValues.value
});
const form = computed(() => formState.form);

// const sitemapLastUpdate = ref((keyValues as any).sitemapLastUpdate as number);
// const otherErrors = reactive({
//     sitemapLastUpdate: '',
// })
// const sitemapFn = useAsyncFn({
//     fn: () => api.post<number>(route('api.panel.sitemap-update')),
//     then: (res) => {
//         otherErrors.sitemapLastUpdate = '';
//         sitemapLastUpdate.value = res.data;
//     },
//     catch: (e) => handleFormValidationErrors({errors: otherErrors}, e),
// })

</script>

<template>
    <form @submit.prevent="formState.submit" class="flex flex-col py-3">
        <Head :title="__('settings')"/>
        <div class="px-3 flex">
            <h1 class="text-2xl font-bold">{{ __('general') }}</h1>
            <i class="flex-1"></i>
            <button type="submit" class="btn btn-success py-px gap-1" :disabled="!form.isDirty" :class="!form.isDirty ? '!opacity-50':''">
                <span class="icon icon-mdi--content-save text-lg"></span>
                <span class="py-1">{{ __('save') }}</span>
            </button>
        </div>

        <div class="grid gap-2 items-center px-3 pt-5 text-sm" style="grid-template-columns: auto 1fr">
            <div class="col-span-2 font-bold text-xl">SEO:</div>

            <label class="font-bold" for="">{{ __('site_title') }}</label>
            <TextInput
                v-model="form.siteTitle"
                class="py-1"
                required
                maxlength="60"
            />
            <i></i>
            <div class="text-xs -mt-2 pt-px pl-1 opacity-80">{{ __('max_x_characters', {':x': '60'}) }}</div>
            <InputError :message="form.errors.siteTitle" second-col/>

            <label class="font-bold self-start" for="">{{ __('description') }}</label>
            <div class="grid">
                <TextInput
                    v-model="form.siteDesc"
                    tag="textarea"
                    class="py-1"
                    required
                    maxlength="160"
                />
                <div class="text-xs pl-1 opacity-80">{{ __('site_description_placeholder') }}</div>
            </div>
            <InputError :message="form.errors.siteDesc" second-col/>

            <!--<label class="font-bold" for="">Sitemap:</label>-->
            <!--<div class="flex gap-3 items-center">-->
            <!--    <span>{{ __('latest') }}: {{ dt.toString(sitemapLastUpdate) || '-' }}</span>-->
            <!--    <Button :loading="sitemapFn.processing" class="btn btn-secondary py-0.5" @click.prevent="sitemapFn.execute">{{ __('update') }}</Button>-->
            <!--</div>-->
            <!--<InputError :message="otherErrors.sitemapLastUpdate" second-col/>-->

            <div class="col-span-2 font-bold text-xl border-t border-x3 pt-2 mt-2">{{ __('settings') }}:</div>

            <label class="font-bold" for="">{{ __('main_menu') }}</label>
            <div class="flex items-center gap-1">
                <FormSelect
                    v-model="form.mainMenu"
                    :options="page.props.pageData.menus"
                    class="py-1 flex-1"
                />
                <Button severity="raised" iconOnly :as="Link" :href="route('panel.menus')">
                    <Icon icon="icon-mingcute--list-search-line text-xl" />
                </Button>
            </div>
            <InputError :message="form.errors.mainMenu" second-col/>

            <label class="font-bold" for="">{{ __('mobile_menu') }}</label>
            <div class="flex items-center gap-1">
                <FormSelect
                    v-model="form.mobileMenu"
                    :options="page.props.pageData.menus"
                    class="py-1 flex-1"
                />
                <Button severity="raised" iconOnly :as="Link" :href="route('panel.menus')">
                    <Icon icon="icon-mingcute--list-search-line text-xl" />
                </Button>
            </div>
            <InputError :message="form.errors.mobileMenu" second-col/>

            <label class="font-bold" for="">{{ __('home_slider') }}</label>
            <div class="flex items-center gap-1">
                <FormSelect
                    v-model="form.homeSlider"
                    :options="sliderOptions"
                    class="py-1 flex-1"
                />
                <Button severity="raised" iconOnly :as="Link" :href="route('panel.sliders')">
                    <Icon icon="icon-mingcute--list-search-line text-xl" />
                </Button>
            </div>
            <InputError :message="form.errors.homeSlider" second-col/>

            <div class="col-span-2 font-bold text-xl border-t border-x3 pt-2 mt-2">Social:</div>

            <label class="font-bold" for="">{{ __('instagram_url') }}</label>
            <TextInput
                v-model="form.instagramUrl"
                type="url"
                class="py-1"
                :placeholder="__('optional')"
            />
            <InputError :message="form.errors.instagramUrl" second-col/>

            <label class="font-bold" for="">{{ __('twitter_url') }}</label>
            <TextInput
                v-model="form.twitterUrl"
                type="url"
                class="py-1"
                :placeholder="__('optional')"
            />
            <InputError :message="form.errors.twitterUrl" second-col/>

            <label class="font-bold" for="">{{ __('facebook_url') }}</label>
            <TextInput
                v-model="form.facebookUrl"
                type="url"
                class="py-1"
                :placeholder="__('optional')"
            />
            <InputError :message="form.errors.facebookUrl" second-col/>

            <label class="font-bold" for="">{{ __('youtube_url') }}</label>
            <TextInput
                v-model="form.youtubeUrl"
                type="url"
                class="py-1"
                :placeholder="__('optional')"
            />
            <InputError :message="form.errors.whatsappNumber" second-col/>

            <label class="font-bold" for="">{{ __('telegram_number') }}</label>
            <TextInput
                v-model="form.telegramNumber"
                type="tel"
                class="py-1"
                :placeholder="__('phone_number') +' (' + __('optional') + ')'"
            />
            <InputError :message="form.errors.telegramNumber" second-col/>

            <label class="font-bold" for="">{{ __('whatsapp_number') }}</label>
            <TextInput
                v-model="form.whatsappNumber"
                type="tel"
                class="py-1"
                :placeholder="__('phone_number') +' (' + __('optional') + ')'"
            />
            <InputError :message="form.errors.whatsappNumber" second-col/>

            <label class="font-bold" for="">{{ __('contact_email') }}</label>
            <TextInput
                v-model="form.contactEmail"
                type="email"
                class="py-1"
                required
            />
            <InputError :message="form.errors.contactEmail" second-col/>
        </div>
    </form>
</template>
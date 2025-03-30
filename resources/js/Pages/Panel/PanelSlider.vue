<script setup lang="ts">
import {__} from "@/utils/localization";
import {computed} from "vue";
import LayoutPanel from "@/Components/Layout/LayoutPanel.vue";
import {usePage} from "@/utils/inertia";
import {TSlider, TSliderItem} from "@/utils/models";
import {router} from "@inertiajs/vue3";
import PanelTable from "@/Components/PanelTable.vue";
import IHead from "@/Components/IHead.vue";
import {Link} from "@inertiajs/vue3";
import TextInput from "@/Components/Form/TextInput.vue";
import {vAutoAnimate} from "@formkit/auto-animate";
import CenteredModal from "@/Components/Overlays/CenteredModal.vue";
import {createSliderForm, createSliderItemForm} from "@/utilsForm/createSliderForm";
import FormStateModal from "@/Components/Overlays/FormStateModal.vue";
import SliderItemFormInline from "@/Parts/Panel/SliderItemFormInline.vue";
import PanelLangSelect from "@/Components/PanelLangSelect.vue";
import InputError from "@/Components/Form/InputError.vue";
import {loc} from "@/utils/globalState";
import InputLabel from "@/Components/InputLabel.vue";
import {useTable} from "@/Components/Table/useTable";
import PanelTableTitleCell from "@/Components/Table/PanelTableTitleCell.vue";
import TableTh from "@/Components/Table/TableTh.vue";
import Icon from "@/Components/Icon.vue";
import Alert from "@/Components/Alert.vue";

defineOptions({layout: LayoutPanel});

const page = usePage<{
    pageData: {
        item: TSlider,
    }
}>()
const item = computed(() => page.props.pageData.item)

const quickEditFormState = createSliderItemForm(item.value, {
    currentItem: () => undefined
});
const tableState = useTable('slider-items', {
    title: __('slider_items'),
    itemsGetter: () => item.value.items,
    routeGroup: 'slider_items',
    changeSequenceUrl: 'default',
    deletion: {
        canBe: () => true,
        apiUrl: 'default',
    },
    canEditInline: false,
    createFn: quickEditFormState.setData,
    editFn: quickEditFormState.setData
})

const {form, submit: submitFn, iid} = createSliderForm({
    currentItem: () => item.value,
});

function submit() {
    const itemId = item.value.id
    submitFn()
        .then((res?: TSlider) => {
            if (itemId || !res)
                router.reload()
            else
                router.visit(route('panel.slider', res.id))
        })
}
</script>

<template>
    <div class="flex flex-col h-full overflow-y-auto">
        <IHead :title="item.id ? __('edit_slider') : __('add_new_slider')"/>
        <form @submit.prevent="() => submit" class="flex flex-col pb-10 gap-3" v-auto-animate>
            <div class="pt-2 flex justify-between gap-3 items-center px-3">
                <Link :href="route('panel.sliders')" class="btn btn-secondary py-px gap-1">
                    <span class="icon icon-mdi--arrow-back text-lg"></span>
                    <span class="py-1">{{ __('back_to_all_sliders') }}</span>
                </Link>
                <i class="flex-1"></i>
            </div>
            <div v-if="Object.keys(form.errors).length" class="alert alert-danger leading-tight px-3">
                <div v-for="(val, key) in form.errors" :key="key">
                    <b>{{ key }}</b>: {{ val }}
                </div>
            </div>

            <PanelLangSelect />

            <div class="flex gap-2 items-center px-3" v-auto-animate>
                <!--<span class="text-sm">{{ __('name') }}</span>-->
                <InputLabel :for="iid('title')" loc label-key="name"/>
                <TextInput
                    v-model="form.title[loc]"
                    label="Slug"
                    :disabled="form.errors.title"
                    required
                    class="flex-1"
                />
                <button @click="submit"
                        class="btn btn-success py-px gap-1"
                        :disabled="form.title == item.title"
                        :class="form.title != item.title ? 'opacity-100': '!opacity-30'">
                    <span class="icon icon-mdi--content-save text-lg"></span>
                    <span class="py-1">{{ __('save') }}</span>
                </button>
            </div>
            <InputError :message="form.errors.title" class="pl-px"/>

            <template v-if="form.id">
                <PanelTable :state="tableState" inline>
                    <template #head-cols-start>
                        <TableTh text-tr="image" />
                    </template>

                    <template #columns="{item} : {item: TSliderItem}">
                        <td>
                            <div class="aspect-video" style="width:100px">
                                <img :src="item.image_url" alt="..." class="w-full h-full object-fill border border-x2"/>
                            </div>
                        </td>
                        <PanelTableTitleCell :state="tableState" :item="item" />
                    </template>
                    <template #form="{data, cancel}">
                        <CenteredModal content-style="width: min(60vw, 500px)">
                            <SliderItemFormInline :formState="data as any" @close="cancel"/>
                        </CenteredModal>
                    </template>
                </PanelTable>
            </template>

            <Alert severity="info" class="flex items-center gap-2 py-2 mt-4">
                <Icon icon="icon-fa-solid--info-circle" class="text-lg"/>
                {{ __('to_add_items_save_name') }}
            </Alert>
        </form>

        <FormStateModal
            :form-state="quickEditFormState"
            content-style="width: min(60vw, 500px)"
            content-class="bg-x3"
        >
            <header class="flex px-5 py-2">
                <h3 class="text-xl">{{ __('edit_slider_item') }}</h3>

                <button class="btn btn-secondary rounded-full p-1 ml-auto" @click="quickEditFormState.closePopup()">
                    <span class="icon icon-mdi--remove"></span>
                </button>
            </header>

            <SliderItemFormInline :formState="quickEditFormState" @close="quickEditFormState.setData(undefined)"/>
        </FormStateModal>
    </div>
</template>
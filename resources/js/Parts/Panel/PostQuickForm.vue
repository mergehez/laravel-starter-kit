<script setup lang="ts">

import {ref} from "vue";
import {vAutoAnimate} from "@formkit/auto-animate";
import {PostType} from "@/utils/generated_enums";
import TextInput from "@/Components/Form/TextInput.vue";
import {__} from "@/utils/localization";
import FormSelect from "@/Components/Form/FormSelect.vue";
import {createPostForm, getPostStatusOptions} from "@/utilsForm/createPostForm";
import PanelLangSelect from "@/Components/PanelLangSelect.vue";
import InputLabel from "@/Components/InputLabel.vue";
import {loc} from "@/utils/globalState";

const props = defineProps<{
    formState: ReturnType<typeof createPostForm>
}>()

const emit = defineEmits<{
    close: []
}>();

const slugLocked = ref(true);
const success = ref(false);

function submit() {
    props.formState.submit().then(() => emit('close'))
}
</script>

<template>
    <form @submit.prevent="submit" class="flex flex-col flex-1 py-3" v-auto-animate>
        <div class="px-2 pb-3">
            <PanelLangSelect />
        </div>
        <div class="grid px-3 gap-2 items-center" style="grid-template-columns: auto 1fr">
            <template v-if="formState.form.type == PostType.post">
                <InputLabel loc label-key="link" class="text-sm" />
                <div class="flex gap-2 items-center">
                    <TextInput
                        v-model="formState.form.slug"
                        :disabled="slugLocked"
                        required
                        class="flex-1 rounded-xs !bg-x1"
                        :class="slugLocked ? 'border-x1' : ''"
                    />
                    <button
                        class="px-1.5 py-1 icon text-xl"
                        :class="slugLocked ? 'icon-mdi--lock text-red-800' : 'icon-mdi--lock-open text-green-800'"
                        @click.prevent="slugLocked = !slugLocked" :title="__('change')">
                    </button>
                </div>
            </template>
            <InputLabel loc label-key="title" class="text-sm" />
            <div class="flex gap-2 items-center">
                <TextInput
                    v-model="formState.form.title[loc]"
                    required
                    class="flex-1 rounded-sm"
                />
            </div>

            <InputLabel loc label-key="status" class="text-sm" />
            <div class="flex gap-2 items-center">
                <FormSelect
                    :options="getPostStatusOptions(formState.form)"
                    v-model="formState.form.status"
                    class="py-1.5 font-bold pr-7 flex-1"
                    :tr-func="__"
                />
            </div>

            <div class="flex justify-end gap-1 mt-2 col-span-2 items-center">
                <template v-if="success">
                    <span class="icon icon-mdi--check-circle text-green-800"></span>
                    <span class="text-green-800 mr-3" v-if="success">{{ __('saved_successfully') }}</span>
                </template>
                <button type="submit" class="btn btn-success">{{ __('save') }}</button>
            </div>
        </div>
    </form>
</template>
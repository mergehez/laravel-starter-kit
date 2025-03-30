<script setup lang="ts" generic="TModel extends { id: number }, TForm extends { id: number }, TComputed extends ((...args: any) => any)">

import CenteredModal from "@/Components/Overlays/CenteredModal.vue";
import {_createFormState} from "@/utils/form_helpers";

withDefaults(defineProps<{
    formState: ReturnType<typeof _createFormState<TModel, TForm, TComputed>>,
    contentClass?: string
    contentStyle?: string
    closeOnOutside?: boolean
    closeButton?: boolean
    header?: string,
    closable?: boolean
}>(), {
    closable: true
})
</script>

<template>
    <CenteredModal
        :show="formState.visible"
        @update:show="formState.closePopup()"
        :contentClass="contentClass"
        :contentStyle="contentStyle"
        :closeOnOutside="closeOnOutside"
        :closeButton="closeButton"
    >
        <header v-if="header" class="flex px-5 py-2 mb-3 border-b border-x4">
            <h3 class="text-xl">{{ header }}</h3>

            <button v-if="closable" class="btn btn-secondary rounded-full p-1 ml-auto" @click="formState.closePopup()">
                <span class="icon icon-mdi--remove"></span>
            </button>
        </header>
        <template v-if="formState.form">
            <slot />
        </template>
    </CenteredModal>
</template>

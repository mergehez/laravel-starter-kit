<script setup lang="ts">

import CenteredModal from "./CenteredModal.vue";
import {confirmModalState as state, onConfirmationPromptValueChange} from "./confirm_modal_helpers";
import TextInput from "../Form/TextInput.vue";
import InputError from "../Form/InputError.vue";
import {computed} from "vue";
import Button from "@/Components/Button.vue";

function cancel(){
    state.onCancel()
    state.show = false;
}
function confirm(){
    state.onConfirm(state.promptValue)
    state.show = false;
}

const submitEnabled = computed(() => {
    if(!state.prompt)
        return true;
    const isRequired = state.prompt.required !== false;
    const isEmpty = state.promptValue.trim() === '';
    return !state.prompt.errorMessage && (!isRequired || !isEmpty);
})
</script>

<template>
    <CenteredModal
        v-model:show="state.show"
        content-class="border border-x2 py-0"
        tag="confirm-modal">
        <div class="flex flex-col" style="min-width: min(400px, 70vw);">
            <header class="px-5 py-2 text-lg">
                {{ state.title }}
            </header>

            <main class="p-5 border-y border-x2">
                <div v-html="state.message"></div>
                <div v-if="state.prompt">
                    <TextInput
                        class="w-full mt-3"
                        :model-value="state.promptValue"
                        @update:model-value="onConfirmationPromptValueChange"
                        :placeholder="state.prompt.placeholder"
                    />
                    <InputError :message="state.prompt.errorMessage" />
                </div>
            </main>

            <footer class="flex justify-end gap-3 px-5 py-3">
                <Button severity="secondary" smallY :class="state.classCancel" @click="cancel">
                    {{ state.textCancel }}
                </Button>
                <Button
                    severity="success"
                    smallY
                    :class="state.classConfirm"
                    @click="confirm"
                    :disabled="!submitEnabled"
                >
                    {{ state.textConfirm }}
                </Button>
            </footer>
        </div>
    </CenteredModal>
</template>

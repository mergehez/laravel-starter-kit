<script setup lang="ts">
import CenteredModal from "../Overlays/CenteredModal.vue";
import ImageCropper from "../ImageCropper.vue";
import {TUploadState} from "./media_library_utils";
import {__} from "@/utils/localization";
import TextInput from "@/Components/Form/TextInput.vue";
import InputError from "@/Components/Form/InputError.vue";

const props = defineProps<{ state: TUploadState }>()

function onCropped(img: any) {
    props.state.form.image = img;
    props.state.form.errors.image = '';
}
</script>

<template>
    <CenteredModal
        v-model:show="state.isVisible"
        content-class="flex flex-col w-10/12 lg:w-6/12"
        content-style="min-width: 400px"
        title="Select the size"
        :close-on-outside="false"
        :tag="'upload-modal-' + state.id"
        :key="'upload-modal-' + state.id"
        :id="'upload-modal-' + state.id"
    >
        <form @submit.prevent="state.submit" class="flex flex-col">
            <header class="flex p-5">
                <h3 class="text-xl">Upload File {{ state.id }}</h3>

                <button class="btn btn-secondary rounded-full p-1 ml-auto" @click="state.close()">
                    <span class="icon icon-mdi--remove"></span>
                </button>
            </header>

            <div v-if="state.hasFile">
                <div v-if="state.fileAsStr" style="max-width: 95vw;" class="px-5 flex flex-col items-center mb-4 gap-1">
                    <ImageCropper
                        v-if="state.cropperProps"
                        v-bind="state.cropperProps"
                        :image="state.form.unrefFileAsStr"
                        :width="state.size.width"
                        :height="state.size.height"
                        :model-value="state.form.image"
                        @update:model-value="onCropped"
                    />
                    <img
                        v-else
                        :src="state.fileAsStr"
                        style="max-height: 40vh; max-width: 100%;"
                        alt="...">
                    <InputError :message="state.form.errors.image"/>
                </div>
                <div class="px-5">
                    <div class="text-sm" v-if="state.canEditName">
                        Original name of the file is: <b>{{ state.originalName }}</b>. You can change it here:
                    </div>

                    <TextInput
                        :disabled="!state.canEditName"
                        :readonly="!state.canEditName"
                        class="w-full mt-1"
                        v-model="state.form.name"
                    />
                    <InputError :message="state.form.errors.name"/>
                </div>
            </div>

            <footer class="dialog-footer flex justify-end gap-3 px-5 py-3">
                <button class="btn btn-light py-0.5 rounded-sm text-sm font-normal lowercase" @click.prevent="state.close()">
                    {{ __('cancel') }}
                </button>
                <button class="btn btn-primary py-0.5 rounded-sm text-sm font-normal lowercase" type="submit">
                    {{ __('upload') }}
                </button>
            </footer>
        </form>
    </CenteredModal>
</template>

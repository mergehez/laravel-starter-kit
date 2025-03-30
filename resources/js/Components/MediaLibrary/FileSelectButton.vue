<script setup lang="ts">
import CenteredModal from "@/Components/Overlays/CenteredModal.vue";
import * as IM from "@/Components/MediaLibrary/media-library-types";
import Button from "@/Components/Button.vue";
import {MediaLibraryState} from "@/Components/MediaLibrary/media_library_utils";
import {ref} from "vue";

const props = defineProps<{
    state: MediaLibraryState,
    onSelected: (file: IM.SelectSizes) => void,
}>()

const fileWithSizes = ref<IM.SelectFileResponse>();
const visible = ref(false);

function onSizeSelectionClose() {
    fileWithSizes.value = undefined;
}

function getShowSizes() {
    const state = props.state;
    state.loading = true;
    state.apiPost<{ files: IM.SelectFileResponse[] }>('select-files', {
        directory: state.getCurrentDirectory(),
        files: [state.selection!.name],
    }).then((res) => {
        const files = res.data.files;
        const fileFromApi = files[0];
        const sizeCount = Object.keys(fileFromApi.values).length;

        if ((files.length == 1 && sizeCount == 1) || state.config.autoSizeSelector?.(fileFromApi)) {
            return selectAndClose(fileFromApi);
        }

        // if (files.length && sizeCount > 1) // this is done in the api
        //     fileFromApi.values = Object.fromEntries(Object.entries(fileFromApi.values).sort(([, a], [, b]) => a.width - b.width));

        fileWithSizes.value = fileFromApi;
        state.loading = false;
        visible.value = true;
    }).catch(e => state.handleApiError(e, 'Couldn\'t get the sizes of the selected file!'))
}

function selectAndClose(file?: IM.SelectFileResponse) {
    file ??= fileWithSizes.value;
    visible.value = false;
    props.onSelected(file!.values[file!.selected])
    fileWithSizes.value = undefined;
}
</script>

<template>
    <Button
        severity="success"
        :class="!state.selection ? '!opacity-50' : ''"
        :disabled="!state.selection"
        @click.prevent="getShowSizes"
    >
        Select
    </Button>

    <!--size selection modal-->
    <CenteredModal
        v-if="fileWithSizes"
        :show="visible"
        content-class="flex flex-col px-5 pt-5"
        content-style="width: min(85vw, 600px)"
        title="Select the size"
        tag="size-selection-modal"
        :close-on-outside="false"
        @close="onSizeSelectionClose"
    >
        <div class="flex-1 h-full flex flex-col lg:flex-row gap-3">
            <div class="w-full lg:w-4/12">
                <img :src="fileWithSizes.values[fileWithSizes.selected].url" alt="-" class="w-full img img-thumbnail border border-x5">
            </div>
            <div class="w-full lg:w-8/12 grid grid-cols-2 gap-2">
                <template v-for="sizeName in Object.keys(fileWithSizes.values)" :key="sizeName">
                    <button class="alert border py-1 m-0" @click.prevent="fileWithSizes.selected = sizeName"
                            :class="(fileWithSizes.selected === sizeName ? 'alert-success ' : 'alert-light')">
                        {{ sizeName.toUpperCase() }} <br> ({{ fileWithSizes.values[sizeName]?.size }})
                    </button>
                </template>
            </div>
        </div>

        <footer class="dialog-footer flex justify-end gap-3 px-0 py-3 ">
            <button class="btn btn-light py-0.5 rounded text-base font-normal lowercase" @click.prevent="visible = false">
                Cancel
            </button>
            <button class="btn btn-primary py-0.5 rounded text-base font-normal lowercase" @click.prevent="() => selectAndClose()">
                Select
            </button>
        </footer>
    </CenteredModal>
</template>
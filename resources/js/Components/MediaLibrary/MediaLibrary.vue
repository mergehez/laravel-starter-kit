<script setup lang="ts">
import {onMounted, onUnmounted} from 'vue'
import * as IM from './media-library-types';
import DirectoryTree from './DirectoryTree.vue';
import CenteredModal from "../Overlays/CenteredModal.vue";
import dayjs from "dayjs";
import DirectoryPath from "./DirectoryPath.vue";
import {vAutoAnimate} from "@formkit/auto-animate/vue";
import MediaLibraryFileBox from "./MediaLibraryFileBox.vue";
import {useMediaLibraryState, useMediaLibraryUploadState} from "./media_library_utils";
import MediaLibraryUploadModal from "./MediaLibraryUploadModal.vue";
import {TCropperProps} from "../ImageCropper.vue";
import Icon from "@/Components/Icon.vue";
import {sizeToString} from "@/utils/utils";
import FileRenameButton from "@/Components/MediaLibrary/FileRenameButton.vue";
import CopyTextButton from "@/Components/CopyTextButton.vue";
import FileSelectButton from "@/Components/MediaLibrary/FileSelectButton.vue";
import Button from "@/Components/Button.vue";
import {toast} from "@/Components/Overlays/toast";
import {TAlertSeverity} from "@/Components/Alert.vue";

const visible = defineModel<boolean>('visible', {
    required: true,
});

const props = withDefaults(defineProps<{
    maxSize?: number,
    config?: IM.MediaLibraryConfig,
    embed?: boolean,
    cropperProps?: Omit<TCropperProps, 'image' | 'width' | 'height'>,
    id: string,
    onSelected?: (file: IM.SelectSizes) => void,
}>(), {
    maxSize: 0,
    embed: false,
})

const state = useMediaLibraryState(
    props.id,
    () => props.config,
    props.embed
);


function onFileSelectionConfirmed(sizes: IM.SelectSizes){
    props.onSelected?.(sizes);
    disposeArgMediaLibrary();
}


function disposeArgMediaLibrary() {
    state.loading = false;
    state.selectFile(undefined);
    visible.value = false;
}

function showMessage(type: TAlertSeverity, message: string) {
    console.log('showMessage', type, message)
    toast.show({
        message: message,
        severity: type,
        duration: 5000,
    })
}

function listenToImagePaste(event: ClipboardEvent) {
    const items = (event.clipboardData || (event as any).originalEvent.clipboardData || (window as any).clipboardData).items || [];
    for (const item of items) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const image = new Image();
                    image.src = e.target?.result as string;
                    image.onload = function (event) {
                        const el = event.target as HTMLImageElement;
                        uploadState.showModal(file, el, image);
                        return true;
                    };
                };
                reader.readAsDataURL(file);
                return;
            }
        }
    }
}

onMounted(() => {
    state.updateDirsAndFiles().then(() => {
        state.isReady = true;
        (document.getElementById('files-grid'))?.scrollTo({top: 0, behavior: 'smooth'});
    })
    document.addEventListener('paste', listenToImagePaste);
});

onUnmounted(() => {
    document.removeEventListener('paste', listenToImagePaste);
});

const uploadState = useMediaLibraryUploadState({
    id: props.id,
    cropperProps: props.cropperProps,
    forcedName: props.config?.forcedName,
    maxSize: props.maxSize,
    submit: async (name: string, fileOrBase64: string|File, ext: string) => {
        console.log('submit', name, ext)
        const formData = new FormData();
        formData.append('directory', state.getCurrentDirectory()!);
        formData.append(`files[0]`, fileOrBase64);
        formData.append('settings', JSON.stringify([{
            name: name,
            format: ext,
        }]));

        const inputFile = document.getElementById('filePickerInput') as HTMLInputElement;
        try {
            await state.apiPost('upload-files', formData, {
                headers: {'Content-Type': 'multipart/form-data'}
            })

            console.log('uploaded')
            showMessage('success', `File has been uploaded to directory: ${state.getCurrentDirectory()}`)
            inputFile.value = '';
            console.log('uploaded2')
            uploadState.close();
            const div = document.getElementById('files-grid')!.parentElement as HTMLDivElement;
            div?.scrollTo({top: div.scrollHeight, behavior: 'smooth'});
            state.getDirectoryFiles(state.activeDir!);
        }catch (e){
            inputFile.value = '';
            state.handleApiError(e as any);
        }
    }
});


function onFilePicked(event: Event) {
    console.log('onFilePicked')
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length > 0) {
        const file = files[0];

        if (!props.cropperProps && props.maxSize > 0 && file.size > props.maxSize) {
            showMessage('danger', `The selected file (${Math.ceil(file.size / 1024)} KB) is larger than max allowed size (${Math.ceil(props.maxSize / 1024)} KB)!`);
            target.value = '';
            return;
        }
        const originalName = file.name.substring(0, file.name.lastIndexOf('.'));
        const ext = file.name.substring(file.name.lastIndexOf('.') + 1);
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext.toLowerCase());

        console.log(originalName, ext, isImage)
        if (isImage) {
            const reader = new FileReader();
            reader.onload = function (e) {
                console.log('loaded')
                const image = new Image();
                image.src = e.target?.result as string;
                image.onload = function (event) {
                    const el = event.target as HTMLImageElement;
                    uploadState.showModal(file, el, image);
                    return true;
                };
            };
            console.log('readAsDataURL')
            reader.readAsDataURL(file);
        } else {
            uploadState.showModal(file);
        }
    }
}

const hostname = window.location.protocol + '//' + window.location.hostname;
function triggerFileInput() {
    document.getElementById('filePickerInput')?.click()
}

</script>
<template>
    <component
        :is="embed ? 'div' : CenteredModal"
        v-model:show="visible"
        @close="disposeArgMediaLibrary()"
        class="arg-media-library"
        :id="'arg-media-library-' + id"
        content-style="width: 95vw; height: 85vh; max-height: 85vh;"
        content-class="flex flex-col bg-x0"
        :closeOnOutside="false"
    >
        <!-- header -->
        <div class="flex items-center px-5 pt-3 border-b border-x2 pb-2 gap-3">
            <h5 class="text-xl font-bold">
                Arg Media Library
            </h5>

            <!--{{ id }}-->

            <div class="flex-1 flex text-sm pr-10 truncate">
                <div class="text-sm bg-x2 px-3 truncate rounded">Extensions: {{ state.config.extensions.join(', ') }}</div>
            </div>
            <Icon :loading="state.loading" :icon="undefined" />
            <Button
                v-if="!embed"
                severity="secondary"
                icon-only
                class="rounded-full"
                @click.prevent="disposeArgMediaLibrary()"
            >
                <Icon icon="icon-mdi--close"/>
            </Button>
        </div>

        <div v-if="state.isReady" class="flex-1 h-full flex max-md:flex-col gap-3 relative overflow-y-auto p-2">
            <!--directories-->
            <DirectoryTree
                class="lg:border-r border-x2 lg:pr-2 w-full md:w-1/3 overflow-y-auto scrollbar-thin max-md:h-1/3 "
                :directories="state.directories"
                :active="state.activeDir"
                :state="state"
                @selected="state.changeActiveDirectory"
            />

            <div class="max-sm:pt-2 xl:pl-2 w-full md:w-2/3 max-md:h-2/3 overflow-y-auto scrollbar-thin flex flex-col">
                <!-- toolbar (back + breadcrumbs + refresh + add) -->
                <DirectoryPath
                    v-if="state.activeDir"
                    :current="state.activeDir"
                    :all-dirs="state.directories"
                    @addFile="triggerFileInput"
                    @visitDir="state.changeActiveDirectory"/>

                <!-- folders + files-->
                <div v-if="state.activeDir" class="flex-1 overflow-y-auto scrollbar-thin">
                    <div id="files-grid" class="flex-1 w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2 pr-2 pb-2 items-start" v-auto-animate>
                        <!-- folders -->
                        <template
                            v-for="subDir in state.directories.filter(t => state.activeDir!.inner?.includes(t.directory))"
                            :key="subDir.directory"
                        >
                            <div class="flex justify-center">
                                <div class="relative group border border-x4 shadow shadow-x4 img-thumbnail cursor-pointer overflow-hidden border-base"
                                     :style="`width: min(100%, 150px); aspect-ratio: ${state.config.baseSize.aspectRatio};`"
                                     @click.prevent="state.changeActiveDirectory(subDir)"
                                >
                                    <div class="absolute inset-0 h-full w-full grid place-items-center pb-2">
                                        <span class="icon icon-mdi--folder-open text-4xl text-green-800"></span>
                                    </div>
                                    <div class="absolute inset-0 h-full w-full flex items-end" style="padding-bottom: 0.4em">
                                        <div class="line-clamp-2 w-full text-sm text-center leading-tight" style="height: 2.5em">{{ subDir.pathinfo.basename }}</div>
                                    </div>
                                </div>
                            </div>
                        </template>

                        <!-- files -->
                        <template v-for="f in state.files" :key="f.path">
                            <MediaLibraryFileBox
                                :directory="state.getCurrentDirectory()!"
                                :f="f"
                                :state="state"
                                :on-deleted="() => state.getDirectoryFiles(state.activeDir!)"
                            />
                        </template>

                        <!-- Add button -->
                        <div class="flex justify-center">
                            <label class="flex justify-center items-center border border-x4 group relative cursor-pointer" title="New File"
                                   :style="`width: min(100%, 150px); aspect-ratio: ${state.config.baseSize.aspectRatio};`" for="filePickerInput">
                                <span class="icon icon-mdi--add-circle opacity-70 text-4xl"></span>
                                <span class="group-hover:opacity-100 opacity-0 transition-opacity absolute inset-0 bg-reverse/10"></span>
                                <input
                                    type="file"
                                    class="hidden"
                                    id="filePickerInput"
                                    :accept="state.config.extensions.map(e => '.'+e).join(', ')"
                                    @change.prevent="onFilePicked">
                            </label>
                        </div>
                    </div>
                </div>

                <!-- File info panel and select button -->
                <div class="flex justify-between mt-4 items-end">
                    <div class="flex-1 pr-4 truncate" style="min-height: 10px;">
                        <div v-if="state.selection" class="border border-x5 p-2 bg-x2 rounded">
                            <div class="text-sm leading-tight flex items-center gap-1 max-w-full truncate">
                                <span class="font-bold">{{ state.selection.name }} </span>
                                <FileRenameButton :state="state" :file="state.selection"/>
                            </div>
                            <div class="text-sm leading-tight flex items-center gap-1 max-w-full truncate">
                                <span class="truncate">{{ hostname }}/{{ state.selection.path }} </span>
                                <CopyTextButton :text="() => `${hostname}/${state.selection!.path}`" :show-message="state.showMessage" />
                                <a class="icon icon-mdi--external-link btn-link" target="_blank" :href="`${hostname}/${state.selection.path}`"></a>
                            </div>
                            <div class="text-sm leading-tight">{{ dayjs(state.selection.time).toString() }}</div>
                            <div class="text-sm leading-tight">{{ sizeToString(state.selection.size) }}</div>
                        </div>
                    </div>
                    <FileSelectButton
                        v-if="!embed"
                        :state="state"
                        :on-selected="onFileSelectionConfirmed"
                    />
                </div>
            </div>
        </div>
        <div v-else class="w-full h-96 grid place-items-center">
            <!--<Spinner loading svg-size="w-24"/>-->
            <Icon loading :icon="undefined" class="text-2xl"/>
        </div>

        <!--&lt;!&ndash;size selection modal&ndash;&gt;-->
        <!--<FileSelectButton-->
        <!--    v-model:visible="visibleSizeSelect"-->
        <!--    v-model:sizes="sizes"-->
        <!--    :state="state"-->
        <!--    />-->

        <MediaLibraryUploadModal :state="uploadState"/>
    </component>
</template>

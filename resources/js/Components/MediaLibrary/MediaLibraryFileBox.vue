<script setup lang="ts">
import * as IM from "./media-library-types";
import {openConfirmationDialog} from "@/Components/Overlays/confirm_modal_helpers";
import {MediaLibraryState} from "./media_library_utils";
import {computed} from "vue";
import {toast} from "@/Components/Overlays/toast";

const props = defineProps<{
    directory: string,
    f: IM.FileInfo,
    state: MediaLibraryState,
    onDeleted: (file: IM.FileInfo) => void,
}>()

const isSelection = computed(() => props.state.selection?.path == props.f.path);

function askDeleteFile(file: IM.FileInfo){
    openConfirmationDialog({
        message: `<b class="text-lg">${file.name}</b><br/><br/>Are you sure you want to delete this file permanently?<br/><b class="text-red-500">This action cannot be undone!</b>`,
        textConfirm: 'Yes, delete it!',
        textCancel: 'Cancel',
        classConfirm: 'btn-danger',
        onConfirm: () => {
            props.state.apiPost('delete-files', {
                directory: props.directory,
                files: [file.name],
            }).then(() => {
                toast.showSuccess(`The file has been deleted: ${file.name}`, '', 5000);
                props.onDeleted(file);
            }).catch(e => props.state.handleApiError(e, 'Could not delete the file'))
        }
    })
}

function select(){
    props.state.selectFile(props.f)
}
</script>

<template>
    <div class="flex justify-center">
        <div class="relative group border border-x4 shadow-sm shadow-x4 img-thumbnail cursor-pointer overflow-hidden border-base"
             :class="isSelection ? 'border-2 border-green-500 dark:border-green-800' : ''"
             :style="`width: min(100%, 150px); aspect-ratio: ${state.config.baseSize.aspectRatio};`"
             @click.prevent.stop="select"
        >
            <div v-if="f.name.endsWith('.pdf')" class="absolute inset-0 h-full w-full grid place-items-center ">
                <span class="icon icon-mdi--file-pdf-box text-4xl text-orange-700"></span>
            </div>
            <img v-else class="absolute inset-0 h-full w-full" style="object-fit: contain;" :src="f.url[state.config.baseSize.name]" alt="" />
            <div class="absolute el-overlay dark:bg-gray-800 dark:bg-opacity-70"></div>

            <button
                title="Delete the file"
                @click.prevent.stop="askDeleteFile(f)"
                class="group-hover:opacity-100 opacity-0 transition-opacity btn btn-sm btn-danger text-white p-1 absolute top-0 right-0 m-1">
                <svg width="10px" height="10px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                    <path fill="currentColor"
                          d="M160 256H96a32 32 0 0 1 0-64h256V95.936a32 32 0 0 1 32-32h256a32 32 0 0 1 32 32V192h256a32 32 0 1 1 0 64h-64v672a32 32 0 0 1-32 32H192a32 32 0 0 1-32-32zm448-64v-64H416v64zM224 896h576V256H224zm192-128a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32m192 0a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32"></path>
                </svg>
            </button>
            <div
                v-if="isSelection"
                class="btn btn-sm btn-success text-white p-1 absolute top-0 left-0 m-1 show">
                <svg height="12px" width="12px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M77.248 415.04a64 64 0 0 1 90.496 0l226.304 226.304L846.528 188.8a64 64 0 1 1 90.56 90.496l-543.04 543.04-316.8-316.8a64 64 0 0 1 0-90.496z"></path></svg>
            </div>
            <div class="show bg-x0 border border-x3 absolute bottom-0 left-0 right-0 m-1 dark:text-white rounded-sm text-center" style=" font-size:0.8em">
                {{f.name}}
            </div>
        </div>
    </div>
</template>

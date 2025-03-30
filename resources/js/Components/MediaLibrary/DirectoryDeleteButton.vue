<script setup lang="ts">

import Button from "@/Components/Button.vue";
import * as IM from './media-library-types';
import {openConfirmationDialog} from "@/Components/Overlays/confirm_modal_helpers";
import {MediaLibraryState} from "@/Components/MediaLibrary/media_library_utils";

const props = defineProps<{
    dir: IM.Directory,
    state: MediaLibraryState,
}>()

function askToDeleteFolder() {
    const dir = props.dir
    openConfirmationDialog({
        message: 'Are you sure to delete this folder permanently?' + (dir.fileCount ? `<br/><b class="text-red-500 text-lg">It contains ${dir.fileCount} files!</b>` : ''),
        textConfirm: 'Yes, delete it!',
        textCancel: 'Cancel',
        classConfirm: 'btn-danger',
        onConfirm: () => {
            deleteFolder(dir)
        }
    })
}

function deleteFolder(dir: IM.Directory) {
    const state = props.state;
    const siblings = state.directories.filter(d => d.parent === dir.parent);
    state.apiPost('delete-folder', {
        directory: dir.directory,
    }).then(() => {
        state.showMessage('success', `Folder has been deleted: ${dir.directory}`)
        const parent = state.directories.find(d => d.directory == dir.parent);
        state.updateDirsAndFiles().then(() => {
            if (siblings.length == 1) {
                if (parent)
                    state.changeActiveDirectory(parent)
            } else {
                const dirIndex = siblings.findIndex(d => d.directory === dir.directory);
                let activeSibling;
                if (dirIndex >= 1) {
                    activeSibling = siblings[dirIndex - 1];
                } else if (dirIndex < siblings.length - 1) {
                    activeSibling = siblings[dirIndex + 1];
                } else {
                    activeSibling = siblings[0];
                }
                state.changeActiveDirectory(activeSibling)
            }
        });
    });
}
</script>

<template>
    <Button severity="raised" class="whitespace-nowrap"
            @click.prevent.stop="askToDeleteFolder"
            aria-label="delete folder">
        Delete
    </Button>
</template>
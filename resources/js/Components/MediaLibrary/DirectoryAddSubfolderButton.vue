<script setup lang="ts">
import Button from "@/Components/Button.vue";
import * as IM from './media-library-types';
import {openConfirmationDialog} from "@/Components/Overlays/confirm_modal_helpers";
import {MediaLibraryState} from "@/Components/MediaLibrary/media_library_utils";

const props = defineProps<{
    dir: IM.Directory,
    state: MediaLibraryState,
}>()

function createSubfolder() {
    const state = props.state;
    const dir = props.dir
    // if (dir.id !== state.activeDir.id) {
    //     return;
    // }

    openConfirmationDialog({
        title: 'New Folder',
        message: `Please type the name of the new folder:`,
        prompt: {
            value: '',
            regex: /^[^\s^\x00-\x1f\\?*:";<>|\/.][^\x00-\x1f\\?*:";<>|\/]*[^\s^\x00-\x1f\\?*:";<>|\/.]*$/,
            invalidMessage: 'Invalid folder name',
        },
        onConfirm(value?: string) {
            state.apiPost('create-folder', {
                directory: dir.directory,
                name: value,
            }).then(() => {
                state.showMessage('success', `Folder has been created: ${dir.directory}/${value}`)
                state.updateDirsAndFiles().then(() => {
                    const addedFolder = state.directories.find(d => d.directory == dir.directory + '/' + value);
                    if (addedFolder) {
                        state.changeActiveDirectory(addedFolder);
                    }
                });
            });
        },
    })
}
</script>

<template>
    <Button severity="raised" class="whitespace-nowrap"
            @click.prevent.stop="createSubfolder()"
            aria-label="add subfolder">
        Add Subfolder
    </button>
</template>
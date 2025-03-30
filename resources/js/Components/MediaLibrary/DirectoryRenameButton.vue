<script setup lang="ts">

import Button from "@/Components/Button.vue";
import * as IM from './media-library-types';
import {openConfirmationDialog} from "@/Components/Overlays/confirm_modal_helpers";
import {MediaLibraryState} from "@/Components/MediaLibrary/media_library_utils";
import {toast} from "@/Components/Overlays/toast";

const props = defineProps<{
    dir: IM.Directory,
    state: MediaLibraryState,
}>()

function renameFolder() {
    const dir = props.dir
    const state = props.state;
    console.log(dir)
    openConfirmationDialog({
        title: 'Rename Folder',
        message: `Please type the new name for the folder:`,
        prompt: {
            value: '' + dir.pathinfo.basename,
            regex: /^[^\s^\x00-\x1f\\?*:";<>|\/.][^\x00-\x1f\\?*:";<>|\/]*[^\s^\x00-\x1f\\?*:";<>|\/.]*$/,
            invalidMessage: 'Invalid folder name',
            validate: value => {
                if(value === dir.pathinfo.basename) {
                    return 'Please type a different name!';
                }
            }
        },
        onConfirm(value?: string) {
            if(!value) {
                return;
            }
            const newName = dir.pathinfo.dirname + '/' + value;
            state.apiPost<string>('rename-file', {
                old: dir.pathinfo.dirname + '/' + dir.pathinfo.basename,
                new: newName,
            }).then(() => {
                state.showMessage('success', `Folder has been renamed: '${dir.directory}' -> '${value}'`)
                state.updateDirsAndFiles(newName)
                    .then(() => {
                        const renamedDir = state.directories.find(d => d.directory == newName);
                        if (renamedDir) {
                            state.changeActiveDirectory(renamedDir, false)
                        }
                    })
            }).catch(toast.showFromAxiosError)
        },
    })
}
</script>

<template>
    <Button severity="raised" class="whitespace-nowrap"
            @click.prevent="renameFolder"
            aria-label="rename folder">
        Rename
    </Button>
</template>
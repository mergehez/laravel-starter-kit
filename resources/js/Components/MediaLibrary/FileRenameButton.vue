<script setup lang="ts">

import Button from "@/Components/Button.vue";
import * as IM from './media-library-types';
import {openConfirmationDialog} from "@/Components/Overlays/confirm_modal_helpers";
import {MediaLibraryState} from "@/Components/MediaLibrary/media_library_utils";
import Icon from "@/Components/Icon.vue";

const props = defineProps<{
    file: IM.FileInfo,
    state: MediaLibraryState,
}>()

function rename() {
    const file = props.file
    const state = props.state;
    console.log(file)
    const pathWithoutName = file.path.substring(0, file.path.lastIndexOf('/'));
    openConfirmationDialog({
        title: 'Rename File',
        message: `Please type the new name for the file:`,
        prompt: {
            value: '' + file.name,
            regex: /^[^\s^\x00-\x1f\\?*:";<>|\/.][^\x00-\x1f\\?*:";<>|\/]*[^\s^\x00-\x1f\\?*:";<>|\/.]*$/,
            invalidMessage: 'Invalid file name',
        },
        onConfirm(value?: string) {
            state.apiPost('rename-file', {
                old: pathWithoutName + '/' + file.name,
                new: pathWithoutName + '/' + value,
            }).then(() => {
                file.url = Object.fromEntries(
                    Object.entries(file.url)
                        .map(([k, v]) => [k, v.replace('/' + file.name, '/' + value!)])
                );
                file.name = value!;
                file.path = pathWithoutName + '/' + value;
                console.log(file)
                state.showMessage('success', `File has been renamed: '${file.name}' -> '${value}'`)
            });
        },
    })
}
</script>

<template>
    <Button
        severity="raised"
        @click.prevent.stop="rename"
        aria-label="rename file"
        icon-only
    >
        <Icon icon="icon-mingcute--edit-2-fill" />
    </Button>
</template>
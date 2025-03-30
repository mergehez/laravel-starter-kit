<script setup lang="ts">

import Button from "@/Components/Button.vue";
import Icon from "@/Components/Icon.vue";
import {copyToClipboard, hasClipboard} from "@/utils/utils";

const props = defineProps<{
    text: string | (() => string),
    showMessage?: (type: 'success'|'danger', message: string) => void,
}>()

function copyPathToClipboard() {
    const text = typeof props.text === 'function' ? props.text() : props.text;
    copyToClipboard(text)
        .then(() => props.showMessage?.('success', 'Path has been copied to clipboard!'))
        .catch((x) => props.showMessage?.('danger', 'Path couldn\'t be copied to clipboard! Reason: ' + x));
}
</script>

<template>
    <Button
        v-if="hasClipboard"
        severity="raised"
        @click.prevent.stop="copyPathToClipboard"
        aria-label="copy text"
        icon-only
    >
        <Icon icon="icon-mingcute--copy-line"/>
        <slot></slot>
    </Button>
</template>
<script setup lang="ts">
import {TrKey, __} from "@/utils/localization";

defineProps<{
    text?: string,
    textTr?: TrKey,
    full?: boolean
    center?: boolean
}>()
</script>

<template>
    <th :class="{'w-full': full, 'text-center': center}">
        <slot>
            {{ text ?? __(textTr!) }}
        </slot>
    </th>
</template>
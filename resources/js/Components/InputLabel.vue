<script setup lang="ts">
import LocIcon from "@/Components/LocIcon.vue";
import {TrKey, __} from "@/utils/localization";
import TooltipableContent from "@/Components/Overlays/TooltipableContent.vue";
const props = defineProps<{
    label?: string,
    labelKey?: TrKey,
    loc?: boolean,
    for?: string,
}>()
</script>

<template>
    <label class="font-bold inline-flex items-center gap-1.5 justify-between mr-1 whitespace-nowrap" :for="props.for">
        <slot>
            {{ props.labelKey ? __(props.labelKey) :  props.label }}
        </slot>
        <TooltipableContent v-if="loc" text="This is a localized value">
            <LocIcon/>
        </TooltipableContent>
    </label>
</template>
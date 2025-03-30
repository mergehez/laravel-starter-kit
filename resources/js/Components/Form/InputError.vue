<script setup lang="ts">
import {computed} from "vue";
import {twMerge} from "tailwind-merge";
import {loc} from "@/utils/globalState";

const props = defineProps<{
    message?: string | Record<string, any>,
    html?: boolean,
    contentClass?: string,
    labelClass?: string,
    class?: string,
    secondCol?: boolean, // puts a dummy i tag before. Useful for grid layouts
}>();

const cls = computed(() => twMerge('text-sm text-red-600 dark:text-red-400 error-message', props.contentClass))

const finalMessage = computed(() => {
    if(!props.message)
        return '';

    if(typeof props.message === 'object' && loc.value in props.message) {
        return props.message[loc.value];
    }

    return props.message;
})
</script>

<template>
    <template v-if="finalMessage">
        <i v-if="secondCol"></i>
        <div :class="twMerge('flex', props.class)">
            <i v-if="labelClass" :class="labelClass"></i>
            <div v-if="html" v-html="finalMessage" :class="cls"></div>
            <div v-else :class="cls">
                {{ finalMessage }}
            </div>
        </div>
    </template>
</template>

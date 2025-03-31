<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue';
import {twMerge} from "tailwind-merge";
import {useTextareaAutosize} from "@vueuse/core";

const modelValue = defineModel<string>({required: true})
const props = defineProps<{
    placeholder?: string,
    autosize?: boolean,
}>();


const {textarea: refTextarea, input: textareaValue} = useTextareaAutosize({
    input: modelValue.value as string,
})

watch(textareaValue, (nv) => {
    modelValue.value = nv
})

watch(modelValue, nv => {
    if(nv !== textareaValue?.value) {
        textareaValue.value = nv
    }
}, {immediate: true});
</script>

<template>
    <textarea
        ref="refTextarea"
        :class="twMerge(
            'text-sm bg-x1 disabled:bg-x2 dark:text-white border border-x4 outline-x8 font-normal rounded-md shadow-xs px-3 py-1.5 placeholder:text-gray-400',
            'scrollbar-none resize-none',
            $attrs.class as string
        )"
        v-model="modelValue"
        :placeholder="placeholder"
    />
    <!--@input="$emit('update:modelValue', $event.target.value)"-->
</template>

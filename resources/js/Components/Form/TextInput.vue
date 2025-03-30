<script setup lang="ts">
import {onMounted, ref, watch} from 'vue';
import {twMerge} from "tailwind-merge";

const modelValue = defineModel<string | number | undefined>({required: true})
defineProps<{
    tag?: 'input' | 'textarea' | 'number' | 'password' | 'button',
    type?: 'button' | 'checkbox' | 'color' | 'date' | 'datetime' | 'email' | 'file' | 'hidden' | 'image' | 'month' | 'number' | 'password' | 'radio' | 'range' | 'reset' | 'search' | 'submit' | 'tel' | 'text' | 'time' | 'url' | 'week',
    placeholder?: string,
    autocomplete?: 'on' | 'off' | 'new-password' | 'current-password' | 'username',
}>();

const input = ref<HTMLElement>();

onMounted(() => {
    if (input.value && input.value.hasAttribute('autofocus')) {
        input.value.focus();
    }
});

defineExpose({focus: () => input.value?.focus()});


</script>

<template>
    <component
        :is="tag ?? 'input'"
        ref="input"
        :class="twMerge(
            'text-sm bg-x1 disabled:bg-x2 dark:text-white border border-x4 focus:outline-none focus-visible:ring-2 focus:border-x4 font-normal rounded-md shadow-sm px-3 py-1.5 placeholder:text-gray-400',
            $attrs.class as string
            )"
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        @input="modelValue = $event.target.value"
    />
</template>

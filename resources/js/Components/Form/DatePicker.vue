<script setup lang="ts">

import {computed} from "vue";
import dayjs from "dayjs";
import {twMerge} from "tailwind-merge";
import TextInput from "@/Components/Form/TextInput.vue";

type TValue = number | string;

const modelValue = defineModel<TValue>();
const props = withDefaults(defineProps<{
    type?: 'date' | 'datetime' | 'time',
}>(), {
    type: 'datetime'
});

const formatPattern = props.type === 'date' ? 'YYYY-MM-DD' : props.type === 'datetime' ? 'YYYY-MM-DDTHH:mm' : 'HH:mm';
const isNumber = Number.isInteger(modelValue.value);

const proxy = computed<TValue, string>({
    get: () => isNumber ? dayjs(modelValue.value).format(formatPattern) : modelValue.value as string,
    set: (value: string) => {
        modelValue.value = isNumber ? dayjs(value).unix() : value;
    }
})

</script>

<template>
    <TextInput
        v-model="proxy"
        :type="type"
        :class="twMerge('flex-1 justify-start block', $attrs.class as any)"
    />
</template>
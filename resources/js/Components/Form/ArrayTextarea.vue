<script setup lang="ts">

import {computed} from "vue";
import {twMerge} from "tailwind-merge";
import TextInput from "@/Components/Form/TextInput.vue";

const modelValue = defineModel<string[] | string>();

const proxy = computed<string, string>({
    get: () => {
        let v = modelValue.value;
        if (typeof v === 'string') {
            v = JSON.parse(v);
            modelValue.value = v;
        }
        if (Array.isArray(v)) {
            return v.join('\n');
        }

        throw new Error('Invalid value');
    },
    set: (value: string) => {
        modelValue.value = value.split('\n').map(t => t.trim()).filter(v => v.length > 0);
    }
})

</script>

<template>
    <TextInput
        v-model="proxy"
        tag="textarea"
        :class="twMerge('flex-1 justify-start block', $attrs.class as any)"
    />
</template>
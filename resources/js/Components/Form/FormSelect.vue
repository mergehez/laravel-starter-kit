<script setup lang="ts" generic="TValue extends string | number, TLabel = string|TrObj">
import {twMerge} from "tailwind-merge";
import {computed} from "vue";
import {uniqueId} from "@/utils/utils";
import {__, TrKey} from "@/utils/localization";
import {TrObj, TSelectOption} from "@/utils/common_models";
import {loc} from "@/utils/globalState";

const props = withDefaults(defineProps<{
    trFunc?: (key: TLabel) => string,
    options: TSelectOption<TValue, TLabel>[],
    translate?: boolean,
    class?: string,
    placeholder?: string,
}>(), {
    translate: true,
    trFunc: (t: any) => __(t),
});
const modelValue = defineModel<TValue|undefined>({required: true});

const isNumberKey = computed(() => props.options.every(k => typeof k.value === 'number'));

function onChange(event: Event) {
    let val = (event.target as HTMLSelectElement).value as any;
    if (isNumberKey.value) {
        val = parseInt(val);
    }
    modelValue.value = val as TValue;
}

const id = uniqueId();

function getText(text: TLabel) {
    if(!text)
        return '';

    if(typeof text === 'object' && loc.value in text)
        return (text as TrObj)[loc.value];

    return props.translate
        ? props.trFunc(text)
        : text;
}

// const query = ref('');
</script>

<template>
    <label
        :for="id"
        :class="twMerge('text-sm btn bg-x1 disabled:bg-x2 dark:text-white border border-x4 focus:ring-x4 focus:border-x4 font-normal pl-3 py-1.5 pr-7 relative justify-start', props.class)"
    >
        <select aria-labelledby="categories" :value="modelValue" @change="onChange" :id="id"
                class="absolute inset-0 w-full cursor-pointer px-0 opacity-0 md:w-auto">
            <option
                v-for="({value, label}) in options"  :key="value"
                :value="value"
                :selected="modelValue == value"
            >
                {{ getText(label) }}
            </option>
        </select>
        <!--<template v-if="searchable">-->
        <!--    <TextInput v-model="query" class="absolute inset-0 h-full w-full cursor-pointer px-0" placeholder="Search"/>-->
        <!--</template>-->
        <!--<template v-else>-->
        <span v-if="options.some(t => t.value == modelValue)">
            {{ getText(options.find(t => t.value == modelValue)!.label) }}
        </span>
        <span v-else-if="placeholder">
            {{ placeholder }}
        </span>
        <span v-else class="opacity-0">A</span>
        <i class="pointer-events-none absolute right-2 select-none text-lg icon icon-mdi--chevron-down"></i>
        <!--</template>-->
    </label>
</template>
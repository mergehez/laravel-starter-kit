<script setup lang="ts">
import {enumToSelectOptions} from "@/utils/utils";
import Button from "@/Components/Button.vue";
import {localeNames} from "@/utils/constants";
import globalState from "@/utils/globalState";

const langOpts = enumToSelectOptions(localeNames, true)

const props = defineProps<{
    formErrors?: Record<string, any>,
    center?: boolean,
}>()

function hasError(lang: string) {
    if(!props.formErrors)
        return false

    for (const k in props.formErrors) {
        if(typeof props.formErrors[k] !== 'object')
            continue;

        if(lang in props.formErrors[k])
            return true;
    }

    return false;
}
</script>

<template>
    <div class="flex gap-2" :class="{ 'w-full justify-center': props.center }">
        <Button
            v-for="opt in langOpts"
            :key="opt.value"
            :severity="globalState.panelLang === opt.value ? 'primary' : 'secondary'"
            @click.prevent="globalState.panelLang = opt.value"
            small
        >
            <i v-if="hasError(opt.value)" class="icon icon-emojione-monotone--exclamation-mark  text-red-400"></i>
            {{ opt.label }}
        </Button>
    </div>
</template>
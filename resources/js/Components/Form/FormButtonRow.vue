<script setup lang="ts">
import {InertiaForm} from '@inertiajs/vue3';
import {twMerge} from 'tailwind-merge';
import {__} from '@/utils/localization';
import Button, {TButtonSeverity} from "@/Components/Button.vue";

const props = withDefaults(
    defineProps<{
        form: InertiaForm<any>;
        class?: string;
        severity?: TButtonSeverity;
        btnClass?: string;
        btnText?: string;
        mt2?: boolean;
        mt3?: boolean;
    }>(),
    {
        mt2: true,
        mt3: false,
    }
);
</script>

<template>
    <div :class="twMerge('col-span-2 flex justify-end items-center gap-3', props.class, props.mt2 ? 'mt-2' : props.mt3 ? 'mt-3' : '')">

        <slot name="before"/>

        <span v-if="form.recentlySuccessful" class="text-green-700 dark:text-green-500">{{ __('saved_successfully') }}</span>
        <span v-if="form.errors._error" class="text-red-700 dark:text-red-500">{{ form.errors._error }}</span>

        <slot name="middle"/>

        <Button
            :loading="form.processing"
            :disabled="!form.isDirty"
            :severity="severity || 'primary'"
            type="submit"
            :class="twMerge('px-7 gap-1', btnClass, form.isDirty ? '' : '!opacity-50')"
        >
            <i v-if="!form.processing" class="icon icon-mdi--content-save text-lg"></i>
            {{ btnText ?? __('save') }}
        </Button>

        <slot name="after"/>
    </div>
</template>
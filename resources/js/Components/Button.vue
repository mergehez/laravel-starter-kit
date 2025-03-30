<script setup lang="ts">
import {computed} from "vue";
import {twMerge} from "tailwind-merge";
import Icon from "@/Components/Icon.vue";

export type TButtonSeverity = 'primary' | 'raised' | 'secondary' | 'success' | 'info' | 'warning' | 'danger';

const props = defineProps<{
    severity?: TButtonSeverity,
    as?: any,
    loading?: boolean,
    small?: boolean,
    smallY?: boolean,
    iconOnly?: boolean,
    icon?: `icon-${string}`,
}>()

const severityClass = computed(() => {
    if(!props.severity) return '';
    return {
        primary: 'btn-primary',
        raised: 'btn-raised',
        secondary: 'btn-secondary',
        success: 'btn-success',
        info: 'btn-info',
        warning: 'btn-warning',
        danger: 'btn-danger'
    }[props.severity]
})

</script>

<template>
    <component
        :is="props.as || 'button'"
        class="btn"
        :class="twMerge(severityClass, iconOnly || small ? 'btn-sm rounded' : '', smallY ? 'small-y' : '', iconOnly ? 'px-1' : '', $attrs.class as any)"
        :disabled="props.loading"
    >
        <Icon v-if="props.loading" icon="icon-mingcute--loading-fill animate-spin" />
        <slot>
            <Icon v-if="props.icon" :icon="props.icon" />
        </slot>
    </component>
</template>

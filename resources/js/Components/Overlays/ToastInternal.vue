<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Icon from "@/Components/Icon.vue"; // Assuming path
import {ToastInstance} from "@/Components/Overlays/toast"; // Assuming path
import Button from "@/Components/Button.vue"; // Assuming path

const p = defineProps<{
    opts: ToastInstance,
    onDismissInternal: () => void, // Function from container to trigger removal
}>()
const opts = computed(() => p.opts);

// No internal isVisible needed, handled by parent v-for and transition-group

const severityClass = computed(() => {
    if (!opts.value.severity) return 'alert-info';
    return {
        primary: 'alert-primary',
        secondary: 'alert-secondary',
        success: 'alert-success',
        info: 'alert-info',
        warning: 'alert-warning',
        danger: 'alert-danger'
    }[opts.value.severity]
})

const timer = ref<ReturnType<typeof setTimeout> | undefined>();

const startDismissTimer = () => {
    clearDismissTimer(); // Prevent duplicate timers
    if (opts.value.duration && opts.value.duration > 0) {
        timer.value = setTimeout(dismiss, opts.value.duration);
    }
};

const clearDismissTimer = () => {
    if (timer.value) {
        clearTimeout(timer.value);
        timer.value = undefined;
    }
};

const dismiss = () => {
    clearDismissTimer(); // Ensure timer is cleared
    p.onDismissInternal(); // Signal container to remove this toast
};


onMounted(() => {
    startDismissTimer()
});
onUnmounted(() => {
    clearDismissTimer() // Important cleanup
});

// Expose methods for the container
defineExpose({
    startTimer: startDismissTimer,
    clearTimer: clearDismissTimer,
});
</script>

<template>
    <div
        :class="['alert pr-2', severityClass ]"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        :data-toast-id="opts.id"
        @click.prevent="opts.onClick"
    >
        <div class="pb-1">
            <div class="flex items-start gap-3">
                <div v-if="opts.icon" class="flex-shrink-0 pt-2.5">
                    <Icon :icon="opts.icon" class="text-lg"/>
                </div>
                <div class="w-0 flex-1 pt-1.5">
                    <span v-if="opts.title" class="font-semibold leading-none">{{ opts.title }}</span>
                    <p class="text-sm">{{ opts.message }}</p>
                </div>
                <Button
                    v-if="opts.closable"
                    class="hover:opacity-70"
                    icon-only
                    variant="ghost"
                    color="currentColor"
                    size="sm"
                    @click.prevent.stop="dismiss"
                    aria-label="Close"
                >
                    <Icon icon="icon-mdi--close" class="text-xl"/>
                </Button>
            </div>
        </div>
    </div>
</template>
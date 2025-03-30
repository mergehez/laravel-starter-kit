<template>
    <div aria-live="polite" aria-atomic="true" class="fixed top-0 right-0 pt-4 pr-4 z-50 w-full max-w-sm pointer-events-none">
        <transition-group
            tag="div"
            name="toast-list"
            class="w-full flex flex-col items-end" appear
            @before-leave="onBeforeLeaveToastRef"
        >
            <ToastInternalNotification
                v-for="t in _toasts"
                :key="t.id"
                :ref="(el) => setToastRef(el, t.id)" :opts="t"
                :on-dismiss-internal="() => toast.remove(t.id)"
                class="pointer-events-auto w-full mb-2"
                @mouseenter="handleMouseEnterToast"    @mouseleave="handleMouseLeaveToast"    />
        </transition-group>
    </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUpdate } from 'vue';
import {_toasts, toast} from './toast'; // Assuming path
import ToastInternalNotification from './ToastInternal.vue'; // Assuming path


interface ToastComponentExposed {
    startTimer: () => void;
    clearTimer: () => void;
}

const toastRefs = ref(new Map<number, ToastComponentExposed>());

const setToastRef = (el: any, id: number) => {
    // Check if el is mounted (el is not null)
    if (el) {
        toastRefs.value.set(id, el as ToastComponentExposed);
    }
};

// Before the component updates (list changes), clear the refs map.
// The :ref function will repopulate it with the current elements.
onBeforeUpdate(() => {
    toastRefs.value.clear();
});

// Optional: Explicitly remove ref when element leaves DOM (before-leave hook)
const onBeforeLeaveToastRef = (el: Element) => {
    // Find the toast id associated with this element if possible
    // This requires adding a data attribute or finding the component instance
    // For simplicity, relying on onBeforeUpdate is often sufficient, but
    // for absolute certainty, you could add `data-toast-id` to the root element
    // inside ToastNotification and read it here to remove from the map.
    const id = parseInt(el.getAttribute('data-toast-id') || '-1');
    if (id !== -1) {
        toastRefs.value.delete(id);
    }
};

const resumeTimerId = ref<ReturnType<typeof setTimeout> | null>(null);

const pauseAllToastTimers = () => {
    console.log("Pausing ALL toast timers");
    toastRefs.value.forEach((toastComponentInstance) => {
        // Check if instance exists (might be unmounted)
        toastComponentInstance?.clearTimer();
    });
};

const resumeAllToastTimers = () => {
    console.log("Resuming ALL toast timers");
    toastRefs.value.forEach((toastComponentInstance) => {
        // Check if instance exists
        toastComponentInstance?.startTimer();
    });
};

// Called when mouse enters *any* toast component rendered by this container
const handleMouseEnterToast = () => {
    console.log("Mouse Enter Toast Area");
    // If there's a pending resume action, cancel it
    if (resumeTimerId.value) {
        clearTimeout(resumeTimerId.value);
        resumeTimerId.value = null;
    }
    // Pause all timers immediately
    pauseAllToastTimers();
};

// Called when mouse leaves *any* toast component rendered by this container
const handleMouseLeaveToast = () => {
    console.log("Mouse Leave Toast Area");
    // Clear any previous pending resume timer
    if (resumeTimerId.value) {
        clearTimeout(resumeTimerId.value);
    }
    // Set a short delay before resuming. If the mouse enters another toast
    // quickly, handleMouseEnterToast will clear this timeout.
    resumeTimerId.value = setTimeout(() => {
        console.log("Resume timeout executed");
        resumeAllToastTimers();
        resumeTimerId.value = null; // Clear the stored timer ID
    }, 100); // 100ms delay - adjust if needed
};

</script>

<style>
.toast-list-enter-active {
    transition: all 0.3s ease-out;
}
.toast-list-leave-active {
    transition: all 0.5s ease-in;
    position: absolute !important;
    width: 100%;
    right: 0; /* Adjust if container has padding */
}
.toast-list-enter-from,
.toast-list-leave-to {
    opacity: 0;
    transform: translateX(100%);
}
.toast-list-move {
    transition: transform 0.5s ease;
}
</style>
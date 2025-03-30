<script setup lang="ts">
import {twMerge} from "tailwind-merge";
import {modalZIndexState} from "./overlay_utils";
import {onUnmounted, watch} from "vue";
import {uniqueId} from "@/utils/utils";

const props = withDefaults(defineProps<{
    show?: boolean
    contentClass?: string
    contentStyle?: string
    closeOnOutside?: boolean
    closeButton?: boolean
    verticalCenter?: boolean
    tag?: string
}>(), {
    show: false,
    contentClass: '',
    contentStyle: '',
    closeOnOutside: true,
    verticalCenter: true,
    closeButton: false,
    tag: () => uniqueId(11),
})

const id = uniqueId(11);
const emit = defineEmits(['update:show', 'close']);

watch(() => props.show, (nv, ov) => {
    if (nv) {
        modalZIndexState.increment(id);
    } else {
        modalZIndexState.decrement(id);
    }
}, {immediate: true})

function updateShow(v: boolean) {
    emit('update:show', v)
    if (!v) {
        emit('close');
    }
}

onUnmounted(() => {
    modalZIndexState.remove(id);
})
</script>

<template>
    <Teleport to="body">
        <div
            :style="[
                {
                    'z-index': modalZIndexState._ids[id],
                    'visibility': show ? 'visible' : 'hidden',
                    'opacity': show ? '1' : '0',
                    'transition': 'visibility 0.3s linear,opacity 0.3s linear'
                },
                $attrs.style as any
            ]"
            :class="[
                tag,
                twMerge('fixed left-0 top-0 w-screen h-screen flex justify-center', $attrs.class as any),
                {
                    'items-center':verticalCenter,
                    'items-start': !verticalCenter,
                }
            ]"
            aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div @click="() => closeOnOutside ? updateShow(false) : {}"
                 class="fixed inset-0 bg-gray-500/75 dark:bg-gray-700/75"></div>

            <transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
            >
                <div class="z-10 flex justify-center" :class="{
                    'items-center':verticalCenter,
                    'items-start': !verticalCenter,
                 }">
                    <div :class="twMerge('rounded-md ring-1 ring-x3 ring-opacity-5 py-1 bg-x0 max-h-[95vh] relative', contentClass)" :style="contentStyle">
                        <slot/>
                        <button
                            v-if="closeButton"
                            class="p-1 inline-flex border border-transparent hover:border-gray-100 dark:hover:border-gray-600 rounded-full absolute top-2 right-2"
                            @click="updateShow(false)">
                            <i class="icon icon-mdi--close font-bold"></i>
                        </button>
                    </div>
                </div>
            </transition>
        </div>
    </Teleport>
</template>

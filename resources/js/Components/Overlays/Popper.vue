<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import {arrow, autoPlacement, autoUpdate, offset, Placement, shift, useFloating} from '@floating-ui/vue';
import {twMerge} from "tailwind-merge";
import {onClickOutside, useDebounceFn} from "@vueuse/core";

export type PopperProps = {
    placement?: Placement,
    offset?: number,
    triggerClass?: string,
    hover?: boolean,
    hoverDelay?: number,
    contentClass?: string,
    contentStyle?: string | object,
    closeOnClickOnContent?: boolean,
}

const props = withDefaults(defineProps<PopperProps>(), {
    closeOnClickOnContent: true,
    triggerClass: 'btn p-0'
})

const refWrapper = ref();
const reference = ref();
const floating = ref();
const floatingArrow = ref();
const isOpen = ref(false);

const middlewares = [
    shift(),
    offset(props.offset ?? 5),
    arrow({element: floatingArrow})
];

if(!props.placement) {
    middlewares.push(autoPlacement());
}

const {floatingStyles, middlewareData, update} = useFloating(reference, floating, {
    placement: props.placement,
    middleware: middlewares,
    open: isOpen,
    whileElementsMounted(referenceEl, floatingEl, update) {
        return autoUpdate(referenceEl, floatingEl, update, {
            ancestorScroll: false,
        });
    },
});

function toggle(mayDelay = false){
    if(isOpen.value)
        close();
    else
        open(mayDelay);
}

function close(){
    isOpen.value = false;
}

let debounceEnabled = false;
const debouncedOpen = useDebounceFn(() => {
    if(!debounceEnabled) return;
    isOpen.value = true;
}, props.hoverDelay ?? 0);

function open(mayDelay = false){
    if(mayDelay && props.hoverDelay)
        debouncedOpen();
    else
        isOpen.value = true;
}

onMounted(() => {
    if (props.hover) {
        reference.value.addEventListener('mouseenter', () => {
            debounceEnabled = true;
            open(true);
        });
        reference.value.addEventListener('mouseleave', () => {
            debounceEnabled = false;
            isOpen.value = false;
        });
    }
});


const finalContentStyles = computed(() => {
    const propsStyles = typeof props.contentStyle === 'string' ? {cssText: props.contentStyle} : props.contentStyle;
    return {
        ...floatingStyles.value,
        zIndex: 1000,
        ...propsStyles,
    }
});

const finalContentClass = computed(() => {
    const def = 'bg-x3 px-1 py-0.5 rounded';
    return props.contentClass ? twMerge(def, props.contentClass) : def;
});

onClickOutside(refWrapper, () => {
    if (isOpen.value) {
        close();
    }
}, {
    ignore: [reference, floating],
});

function onClickContent() {
    console.log('click content', props.closeOnClickOnContent);
    if (props.closeOnClickOnContent) {
        close();
    }
}

</script>

<template>
    <div class="relative" ref="refWrapper">
        <component ref="reference" :is="hover ? 'span': 'button'" :class="triggerClass" @click.stop.prevent="toggle">
            <slot name="trigger" :close="close" :toggle="toggle" :isOpen="isOpen"></slot>
        </component>
        <div
            ref="floating"
            v-show="isOpen"
            :style="finalContentStyles"
            :class="finalContentClass"
            @click.prevent.stop="onClickContent"
        >
            <slot name="content" :close="close" :toggle="toggle" :isOpen="isOpen"></slot>
            <div
                ref="floatingArrow"
                :style="{
                position: 'absolute',
                left:
                  middlewareData.arrow?.x != null
                    ? `${middlewareData.arrow.x}px`
                    : '',
                top:
                  middlewareData.arrow?.y != null
                    ? `${middlewareData.arrow.y}px`
                    : '',
              }"
            ></div>
        </div>
    </div>
</template>
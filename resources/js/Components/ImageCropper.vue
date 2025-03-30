<script setup lang="ts">
import {CircleStencil, Cropper, RectangleStencil} from 'vue-advanced-cropper';
import {computed} from "vue";
import 'vue-advanced-cropper/dist/style.css';

export type TCropperProps = {
    image: string,
    height: number,
    width: number,
    modelValue?: string,
    minHeight?: number,
    minWidth?: number,
    aspectRatio?: number,
    circle?: boolean,
    noTransparency?: boolean,
    defaultFull?: boolean,
}
const props = withDefaults(defineProps<TCropperProps>(), {
    circle: true,
    minHeight: 200,
    minWidth: 200,
    defaultFull: false,
})

const emit = defineEmits(['update:modelValue']);

function change(vals: { canvas: HTMLCanvasElement }) {
    console.log(vals)
    emit('update:modelValue', vals.canvas.toDataURL());
}

const stencilProps = computed(() => ({
    aspectRatio: props.aspectRatio,
    previewClass: props.circle ? 'border !border-white bg-white' : '',
}))

function defaultSize(data: { imageSize: { width: number, height: number }, visibleArea: { width: number, height: number } }) {
    return {
        width: ((props.defaultFull ? data.visibleArea : undefined) || data.imageSize).width,
        height: ((props.defaultFull ? data.visibleArea : undefined) || data.imageSize).height,
    };
}
</script>

<template>
    <Cropper
        :src="image"
        @change="change"
        :min-height="minHeight"
        :min-width="minWidth"
        :width="width"
        :height="height"
        :stencil-component="circle ? CircleStencil : RectangleStencil"
        :stencil-props="stencilProps"
        :image-class="noTransparency ? '!bg-white' : ''"
        :default-size="defaultSize"
    />
</template>


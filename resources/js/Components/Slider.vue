<script setup lang="ts">

const currentIndex = defineModel({
    default: 0,
});
const props = withDefaults(defineProps<{
    // enable?: boolean,
    count: number,
    buttons?: boolean,
    changeSlide?: (direction: 1|-1) => void
}>(), {
    // enable: true,
    buttons: true,
})

function change(direction: 1|-1){
    if(props.changeSlide){
        props.changeSlide(direction);
        return;
    }

    currentIndex.value = (currentIndex.value + direction + props.count) % props.count;
}
</script>

<template>
    <div class="relative flex overflow-x-hidden">
        <div class="flex flex-none transition-transform duration-500 ease-in-out" :style="{
                        width: (count * 100) + '%',
                        transform: 'translateX(-' + (currentIndex * 100 / count) + '%)'
                    }">
            <template v-for="num in count" :key="num" >
                <div class="relative" :style="{ width: (100 / count) + '%' }">
                    <slot name="item" :index="num-1" :currentIndex="currentIndex">
                        <div class="w-full h-full grid place-items-center">
                            Slide {{ num }}
                        </div>
                    </slot>
                </div>
            </template>
        </div>
        <template v-if="buttons">
            <button class="absolute h-full top-0 left-0 flex items-center px-0 md:px-5 hover:bg-x0/5 group" @click="change(-1)">
                <span class="icon icon-mdi--chevron-left text-5xl opacity-50 group-hover:opacity-100"></span>
            </button>
            <button class="absolute h-full top-0 right-0 flex items-center px-0 md:px-5 hover:bg-x0/5 group" @click="change(1)">
                <span class="icon icon-mdi--chevron-right text-5xl opacity-50 group-hover:opacity-100"></span>
            </button>
        </template>
    </div>
</template>

<!--suppress CssUnusedSymbol -->
<style>
.slider-item {
    position: absolute;
    width: 100%;
    height: 100%;
    min-width: 100%;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
}

.slider-wrapper > .slider-item:nth-child(1) {
    left: 0;
}

.slider-wrapper > .slider-item:nth-child(2) {
    left: 100%;
}

.slider-wrapper > .slider-item:nth-child(3) {
    left: 200%;
}

.slider-wrapper > .slider-item:nth-child(4) {
    left: 400%;
}

.slider-wrapper > .slider-item:nth-child(5) {
    left: 500%;
}

.slider-wrapper > .slider-item:nth-child(6) {
    left: 600%;
}

.slider-wrapper > .slider-item:nth-child(7) {
    left: 700%;
}

.slider-wrapper > .slider-item:nth-child(8) {
    left: 800%;
}

.slider-wrapper > .slider-item:nth-child(9) {
    left: 900%;
}

.slider-wrapper > .slider-item:nth-child(10) {
    left: 1000%;
}
</style>

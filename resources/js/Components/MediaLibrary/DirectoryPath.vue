<script setup lang="ts">

import {Directory} from "./media-library-types";
import {computed} from "vue";

const props = defineProps<{
    current: Directory,
    allDirs: Directory[]
}>()

const emit = defineEmits<{
    visitDir: [dir: Directory],
    addFile: [dir: Directory],
}>();

const dirArray = computed(() => {
    let curr = props.current;
    const arr = [curr];
    while(curr.parent) {
        const parent = props.allDirs.find(d => d.directory === curr.parent);
        if(!parent)
            break;
        arr.unshift(parent);
        curr = parent;
    }
    return arr;
})

function visit(dir: Directory, force = false) {
    if(!force && dir.directory === props.current.directory)
        return;
    emit('visitDir', dir);
}

</script>

<template>
    <div class="border border-x2 bg-x1 flex divide-x divide-x2 gap-1 items-center p-px mb-2">
        <button class="p-1 gap-px aspect-square flex items-center border-r border-x2 bg-x0 hover:bg-x1"
                :disabled="!current.parent"
                @click="visit(dirArray.find(t => t.directory == current.parent)!)">
            <span class="icon icon-mdi--arrow-back"></span>
        </button>
        <div class="flex-1 flex items-center truncate">
            <template v-for="d in dirArray" :key="d.directory">
                <button class="px-2 py-1 gap-px hover:bg-x2 text-xs text-left truncate"
                        @click="visit(d)">
                    {{ d.pathinfo?.basename }}
                </button>
                <span v-if="d.directory != current.directory" class="icon icon-mdi--chevron-right opacity-70"></span>
            </template>
        </div>
        <button class="p-1 gap-px aspect-square flex items-center border-l border-x2"
                @click="visit(current, true)">
            <span class="icon icon-mdi--refresh"></span>
        </button>
        <button class="p-1 gap-px aspect-square flex items-center border-l border-x2"
                @click="$emit('addFile', current)">
            <span class="icon icon-mdi--plus"></span>
        </button>
    </div>
</template>
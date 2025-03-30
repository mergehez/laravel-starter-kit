<script setup lang="ts">
import {Directory} from "./media-library-types";
import {vAutoAnimate} from "@formkit/auto-animate/vue";
import MenuPopper from "@/Components/Overlays/MenuPopper.vue";
import DirectoryRenameButton from "@/Components/MediaLibrary/DirectoryRenameButton.vue";
import {MediaLibraryState} from "@/Components/MediaLibrary/media_library_utils";
import DirectoryDeleteButton from "@/Components/MediaLibrary/DirectoryDeleteButton.vue";
import DirectoryAddSubfolderButton from "@/Components/MediaLibrary/DirectoryAddSubfolderButton.vue";
import Icon from "@/Components/Icon.vue";

const props = defineProps<{
    directories: Directory[],
    active?: Directory,
    state: MediaLibraryState,
}>()
const emit = defineEmits([
    'selected',
])

function selectFolder(dir: Directory) {
    dir.open = true;
    emit('selected', dir)
}
</script>
<template>
    <div class="flex flex-col image-manager-dir-tree pl-2" v-auto-animate>
        <template v-for="dir in directories" :key="dir.directory">
            <div
                v-if="!dir.parent || directories.find(d => d.directory === dir.parent)?.open"
                class="mb-1 flex items-center"
                :style="{
                paddingLeft: (dir.indent - 1) * 20 + 'px'
            }">
                <button
                    v-if="dir.indent"
                    class="icon text-reverse"
                    :class="dir.inner.length ? (!dir.open ? 'icon-mdi--plus-bold' : 'icon-mdi--minus') : 'invisible'"
                    @click="() => dir.open = !dir.open">

                </button>
                <div
                    class="dir-btn flex-1 w-full font-bold text-sm px-3 py-1 cursor-pointer pr-1 relative items-center justify-start flex gap-2 group"
                    :class="dir.directory === active?.directory ? 'bg-green-500 dark:bg-green-800 text-white' : 'bg-x2 hover:bg-x3'"
                    @click="selectFolder(dir)"
                >
                    <div class="flex-1 text-left truncate">{{ dir.pathinfo.basename }}</div>
                    <span class="text-xs opacity-60">
                        {{ dir.fileCount || '-' }}
                    </span>
                    <MenuPopper
                        content-class="bg-x4"
                    >
                        <template #trigger>
                            <Icon icon="icon-mdi--dots-vertical text-lg text-gray-500/50 dark:text-gray-500 dark:group-hover:text-gray-300" />
                        </template>
                        <template #content>
                            <div class="flex flex-col items-stretch divide-y divide-x3">
                                <DirectoryRenameButton
                                    :dir="dir"
                                    :state="state"
                                />
                                <DirectoryDeleteButton
                                    :dir="dir"
                                    :state="state"
                                />
                                <DirectoryAddSubfolderButton
                                    :dir="dir"
                                    :state="state"
                                />
                            </div>
                        </template>
                    </MenuPopper>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">

import {localeNames} from "@/utils/constants";
import AutosizeTextarea from "@/Components/Form/AutosizeTextarea.vue";
import {computed} from "vue";
import globalState from "@/utils/globalState";

const loc = computed(() => globalState.panelLang)
</script>

<template>
    <div class="relative w-full">
        <template
            v-for="l in Object.keys(localeNames)"
            :key="l"
        >
            <slot
                name="item"
                :style="{
                        visibility: loc == l ? 'visible' : 'hidden',
                        position: loc == l ? 'static' : 'absolute',
                    }"
                :className="'inset-0'"
                :l="l"
            >
            </slot>
        </template>
    </div>
</template>
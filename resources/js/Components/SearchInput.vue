<script setup lang="ts">

import {__} from "@/utils/localization";
import TextInput from "@/Components/Form/TextInput.vue";

const query = defineModel<string>({
    required: true,
})
</script>

<template>
    <div class="relative flex items-center group">
        <TextInput v-model="query" :placeholder="__('search')" class="w-40 pr-6 py-1 max-md:w-full"/>
        <button
            @click="query = ''"
            class="cursor-pointer absolute right-0 top-0 bottom-0 pl-0.5 pr-2 opacity-30 group-hover:opacity-50 group-hover:hover:opacity-70 grid place-items-center">
            <span class="icon icon-mdi--close"></span>
        </button>
    </div>
</template>

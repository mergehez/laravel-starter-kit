<script setup lang="ts">
import TextInput from "@/Components/Form/TextInput.vue";
import {TSeo} from "@/utils/models";
import { __ } from "@/utils/localization";
import {loc} from "@/utils/globalState";
import InputLabel from "@/Components/InputLabel.vue";

defineProps<{
    form: TSeo
}>()
</script>

<template>
    <div class="border border-x2 pt-3 pb- px-5 mt-3">
        <h2 class="text-xl font-bold">SEO</h2>
        <div class="grid mt-4 gap-2 items-center" style="grid-template-columns: auto 1fr">

            <!--<label class="font-bold">{{ __('title') }}: </label>-->
            <InputLabel loc label-key="title" />
            <TextInput v-model="form.title[loc]" class="flex-1" maxlength="60"/>

            <!--<label class="font-bold self-start">{{ __('description') }}: </label>-->
            <InputLabel loc label-key="description" class="self-start" />
            <TextInput v-model="form.description[loc]" tag="textarea" class="flex-1" maxlength="160"/>

            <InputLabel loc label="Keywords" />
            <TextInput v-model="form.keywords[loc]" class="flex-1" maxlength="160"/>
        </div>
    </div>
</template>
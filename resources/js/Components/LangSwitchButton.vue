<script setup lang="ts">

import Button from "@/Components/Button.vue";
import {__} from "@/utils/localization";
import {usePage} from "@/utils/inertia";
import Popper from "@/Components/Overlays/Popper.vue";
import Icon from "@/Components/Icon.vue";
import {localeNames} from "@/utils/constants";
import {api} from "@/utils/api_helpers";
import {Link} from "@inertiajs/vue3";

const page = usePage();

defineProps<{
    icClass?: string,
}>()

function toggleTheme() {
    window.themeManager.toggle();
}

</script>

<template>
    <Popper
        content-class="bg-x4 px-0.5"
        placement="bottom"
    >
        <template #trigger>
            <Button
                as="span"
                severity="raised"
                class="p-2"
                :title="__('change_language')"
            >
                <Icon icon="icon-mingcute--translate-2-line" :class="icClass" />
            </Button>
        </template>
        <template #content>
            <template v-for="l in page.props.localization.locales" :key="l">
                <Button
                    :as="Link"
                    severity="raised"
                    class="w-full px-4"
                    :class="{'selected': page.props.localization.locale == l}"
                    :title="localeNames[l]"
                    :href="route('change-locale', l) + '?same_url=1'"
                    v-text="localeNames[l]"
                />
            </template>
        </template>
    </Popper>
</template>
<script setup lang="ts">
import {computed} from "vue";
import globalState from "@/utils/globalState";
import {usePage} from "@/utils/inertia";
import LayoutBase from "@/Components/Layout/LayoutBase.vue";
import Nav from "@/Components/Layout/Nav.vue";
import Button from "@/Components/Button.vue";

const page = usePage();
console.log(page.props)
const info = computed(() => page.props.info);

const socials = {
    'email': ['icon-mingcute--mail-line', "E-Mail", info.value.contactEmail ? "mailto:" + info.value.contactEmail : undefined],
    'instagram': ['icon-mingcute--instagram-line', "Instagram", info.value.instagramUrl],
    'facebook': ['icon-mingcute--facebook-line', "Facebook", info.value.facebookUrl],
    'youtube': ['icon-mingcute--youtube-line', "YouTube", info.value.youtubeUrl],
    // 'telegram': ['icon-mingcute--telegram-line', "Telegram", info.value.telegramNumber ? "https://t.me/+" + info.value.telegramNumber : undefined],
    // 'whatsapp': ['icon-mingcute--whatsapp-line', "Whatsapp", info.value.whatsappNumber ? "https://wa.me/" + info.value.whatsappNumber : undefined],
    // 'twitter': ['icon-mingcute--social-x-line', "Twitter", info.value.twitterUrl],
};
</script>

<template>
    <LayoutBase>
        <div class="h-screen flex flex-col bg-x0 overflow-y-auto" scroll-region :data-current-route="globalState.currentRoute">
            <Nav/>
            <div class="flex-1 w-full flex flex-col overflow-y-auto md:px-12 container mx-auto">
                <slot/>
            </div>

            <div class="py-3 sm:py-2 w-full border-t-2 border-x4 flex justify-center bg-x2" id="footer">
                <div class="container">
                    <div class="flex items-center justify-center gap-8 sm:gap-6">
                        <template v-for="(v, k) in socials" :key="v[1]">
                            <Button
                                v-if="v[2]"
                                as="a"
                                severity="raised"
                                :href="v[2]"
                                target="_blank"
                                :aria-label="k"
                                class="text-base">
                                <i class="icon text-2xl sm:text-lg" :class="v[0]"></i>
                                <span class="hidden sm:block">{{ v[1] }}</span>
                            </Button>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </LayoutBase>
</template>

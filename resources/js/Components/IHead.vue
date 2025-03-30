<script setup lang="ts">

import {onMounted, watch} from "vue";

const props = defineProps<{
    title?: string,
    description?: string,
    image?: string,
    url?: string,
}>();

const dom = {
    titles: [] as HTMLMetaElement[],
    descriptions: [] as HTMLMetaElement[],
    images: [] as HTMLMetaElement[],
    urls: [] as HTMLMetaElement[],
    cononical: [] as HTMLLinkElement[],

}

function update() {
    const p = {
        title: props.title?.replace('\n', ' '),
        description: props.description?.replace('\n', ' '),
        image: props.image,
        url: props.url,
    }

    const t = p.title;
    if (t) {
        dom.titles.forEach(x => x.content = t);
        document.title = t;
    }

    const d = p.description;
    if (d) {
        dom.descriptions.forEach(x => x.content = d);
    }

    const i = p.image;
    if (i) {
        dom.images.forEach(x => x.content = i);
    }

    let u = p.url;
    if (u) {
        if (!u.includes('www.')) {
            u = u.replace('http://', 'http://www.');
            u = u.replace('https://', 'https://www.');
        }
        dom.urls.forEach(x => x.content = u!);
        dom.cononical.forEach(x => x.href = u!);
    }
}

onMounted(() => {
    dom.titles = [
        document.querySelector('meta[name="title"]') as HTMLMetaElement,
        document.querySelector('meta[property="og:title"]') as HTMLMetaElement,
        document.querySelector('meta[name="twitter:title"]') as HTMLMetaElement,
        document.querySelector('meta[name="apple-mobile-web-app-title"]') as HTMLMetaElement,
        document.querySelector('meta[name="og:image:alt"]') as HTMLMetaElement,
    ]
    dom.descriptions = [
        document.querySelector('meta[name="description"]') as HTMLMetaElement,
        document.querySelector('meta[property="og:description"]') as HTMLMetaElement,
        document.querySelector('meta[name="twitter:description"]') as HTMLMetaElement,
        document.querySelector('meta[name="abstract"]') as HTMLMetaElement,
    ]
    dom.images = [
        document.querySelector('meta[property="og:image"]') as HTMLMetaElement,
        document.querySelector('meta[name="twitter:image"]') as HTMLMetaElement,
    ]

    dom.urls = [
        document.querySelector('meta[property="og:url"]') as HTMLMetaElement,
        document.querySelector('meta[name="twitter:url"]') as HTMLMetaElement,
    ]

    dom.cononical = [document.querySelector('link[rel="canonical"]') as HTMLLinkElement]

    update();
});

watch(() => props, () => {
    update();
});
</script>

<template>
    <!--<Head>-->
    <!--    <template v-if="title">-->
    <!--        <title>{{ finalTitle }}</title>-->
    <!--        <meta head-key="a" name="title" :content="finalTitle"/>-->
    <!--        <meta head-key="b" property="og:title" :content="finalTitle"/>-->
    <!--        <meta head-key="c" name="twitter:title" :content="finalTitle"/>-->
    <!--        <meta head-key="d" name="apple-mobile-web-app-title" :content="finalTitle"/>-->
    <!--        <meta head-key="e" name="og:image:alt" :content="finalTitle"/>-->
    <!--    </template>-->

    <!--    <template v-if="description">-->
    <!--        <meta head-key="f" name="description" :content="desc"/>-->
    <!--        <meta head-key="g" property="og:description" :content="desc"/>-->
    <!--        <meta head-key="h" name="twitter:description" :content="desc"/>-->
    <!--        <meta head-key="i" name="abstract" :content="desc"/>-->
    <!--    </template>-->

    <!--    <template v-if="image">-->
    <!--        <meta head-key="j" property="og:image" :content="image"/>-->
    <!--        <meta head-key="k" name="twitter:image" :content="image"/>-->
    <!--    </template>-->
    <!--</Head>-->
</template>
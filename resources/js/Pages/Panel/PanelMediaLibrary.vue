<script setup lang="ts">
import LayoutPanel from "@/Components/Layout/LayoutPanel.vue";
import {__} from "@/utils/localization";
import {defaultMediaLibraryConfigWithPdf} from "@/Components/MediaLibrary/media-library-types";
import MediaLibrary from "@/Components/MediaLibrary/MediaLibrary.vue";
import IHead from "@/Components/IHead.vue";

defineOptions({layout: LayoutPanel});
</script>

<template>
    <IHead :title="__('media_library')"/>
    <MediaLibrary visible embed :config="defaultMediaLibraryConfigWithPdf" id="panel-media-lib"/>
</template>
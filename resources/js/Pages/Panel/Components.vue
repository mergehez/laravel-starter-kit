<script setup lang="ts">

import LayoutPanel from "@/Components/Layout/LayoutPanel.vue";
import Button from "@/Components/Button.vue";
import Alert from "@/Components/Alert.vue";

defineOptions({
    layout: LayoutPanel
})

const btnSeverities = [
    'primary',
    'raised',
    'secondary',
    'success',
    'info',
    'warning',
    'danger'
] as const
const alerts = [
    'primary',
    'secondary',
    'success',
    'info',
    'warning',
    'danger'
] as const
const bgColors = ['bg-x0', 'bg-x1', 'bg-x2', 'bg-x3', 'bg-x4', 'bg-x5', 'bg-x6', 'bg-x7', 'bg-x8'] as const
const bgCombinations = [];
for (let i = 0; i < bgColors.length; i++) {
    for (let j = 0; j < bgColors.length; j++) {
        if (i !== j) {
            bgCombinations.push([bgColors[i], bgColors[j]]);
        }
    }
}
</script>

<template>
    <div class="flex flex-col gap-1">
        <div>Background Colors</div>
        <div class="flex gap-2 flex-wrap">
            <div
                v-for="s in bgColors" :key="s"
                class="size-12 dborder border-black dark:border-white grid place-items-center text-sm"
                :class="s"
            >
                {{ s }}
            </div>
        </div>
        <div class="gap-2 grid w-min" :style="{gridTemplateColumns: `repeat(${bgColors.length}, 1fr)`}">
            <template
                v-for="b1 in bgColors" :key="b1"
            >
                <template
                    v-for="b2 in bgColors" :key="b2"
                >
                    <div
                        class="size-16 border-black dark:border-white grid place-items-center text-xs"
                        :class="b1"
                    >
                        <!--{{ b1 }}-->
                        <div
                            class="size-7 border-black dark:border-white grid place-items-center"
                            :class="b2"
                        >
                            <!--{{ b2 }}-->
                        </div>
                    </div>

                </template>

            </template>
        </div>

        <div class="mt-12">Buttons</div>
        <div class="gap-2 flex-wrap grid" :style="{gridTemplateColumns: `repeat(${btnSeverities.length}, 1fr)`}">
            <Button v-for="s in btnSeverities" :key="s" :severity="s">{{ s[0].toUpperCase() + s.substring(1) }}</Button>
            <Button v-for="s in btnSeverities" :key="s" :severity="s" small>{{ s[0].toUpperCase() + s.substring(1) }}</Button>
        </div>

        <div class="mt-12">Alerts</div>
        <div class="gap-2 flex-wrap grid" :style="{gridTemplateColumns: `repeat(${Math.ceil(alerts.length/2)}, 1fr)`}">
            <Alert v-for="s in alerts" :key="s" :severity="s" class="flex items-center ">
                <span>This is a {{ s.split('-').join(' ') }} alert</span>
            </Alert>
        </div>
        <div class="gap-2 flex-wrap grid" :style="{gridTemplateColumns: `repeat(${Math.ceil(alerts.length/2)}, 1fr)`}">
            <Alert v-for="s in alerts" :key="s" :severity="s" class="flex items-center" small>
                <span>This is a {{ s.split('-').join(' ') }} alert</span>
            </Alert>
        </div>
        <div class="gap-2 flex-wrap grid" :style="{gridTemplateColumns: `repeat(${Math.ceil(alerts.length/2)}, 1fr)`}">
            <Alert v-for="s in alerts" :key="s" :severity="s" class="flex items-center" small closable>
                <span>This is a {{ s.split('-').join(' ') }} alert</span>
            </Alert>
        </div>
    </div>
</template>
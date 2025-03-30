<script setup lang="ts">
import {__} from "@/utils/localization";
import {router} from "@inertiajs/vue3";
import PostQuickForm from "@/Parts/Panel/PostQuickForm.vue";
import PanelTable from "@/Components/PanelTable.vue";
import {TPost} from "@/utils/models";
import {PostType} from "@/utils/generated_enums";
import {createPostForm} from "@/utilsForm/createPostForm";
import FormStateModal from "@/Components/Overlays/FormStateModal.vue";
import {loc} from "@/utils/globalState";
import {useTable} from "@/Components/Table/useTable";
import PanelTableTitleCell from "@/Components/Table/PanelTableTitleCell.vue";
import TableThSortable from "@/Components/Table/TableThSortable.vue";
import TooltipableContent from "@/Components/Overlays/TooltipableContent.vue";
import Button from "@/Components/Button.vue";

const props = defineProps<{
    posts: TPost[],
    postType: PostType,
    title: string
}>()

const tableState = useTable<TPost, 'title' | 'updated_at' | 'status' | 'views'>('posts-grid', {
    title: props.title,
    itemsGetter: () => props.posts,
    routeGroup: 'posts',
    changeSequenceUrl: undefined,
    deletion: {
        canBe: () => true,
        apiUrl: 'default',
        askToTitle: undefined,
    },
    searchText: t => t.title[loc.value],
    defaultSort: {
        field: 'updated_at',
        desc: true,
    },
    sortFn: (items, field, desc) => {
        return items.sort((a, b) => {
            if (field === 'updated_at')
                return !desc ? a.updated_at - b.updated_at : b.updated_at - a.updated_at

            if (field === 'status')
                return desc ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status)

            if (field === 'views')
                return !desc ? a.views - b.views : b.views - a.views

            return desc
                ? a.title[loc.value].localeCompare(b.title[loc.value])
                : b.title[loc.value].localeCompare(a.title[loc.value])
        })
    },
    editFn: (item) => {
        router.visit(route('panel.post', item.id))
    },
    createFn: () => {
        router.visit(props.postType == PostType.post ? route('panel.posts.create') : route('panel.pages.create'))
    },
})

const toEdit = createPostForm(props.postType, {
    currentItem: () => undefined,
})
</script>

<template>
    <div class="flex h-full overflow-y-auto">
        <PanelTable
            :state="tableState"
            overflow-auto
        >
            <template #head-cols>
                <TableThSortable full :state="tableState" field="title" text-tr="title"/>
                <TableThSortable :state="tableState" field="status" text-tr="status"/>
                <TableThSortable center :state="tableState" field="views" text-tr="views"/>
                <TableThSortable :state="tableState" field="updated_at" text-tr="last_modified"/>
                <th></th>
            </template>

            <template #columns="{item}: {item: TPost}">
                <PanelTableTitleCell :item="item" :state="tableState"/>
                <td>{{ item.status }}</td>
                <td class="text-center">{{ item.views }}</td>
            </template>

            <template #buttons="{item}: {item: TPost}">
                <Button
                    v-if="item.status !== 'draft'"
                    severity="warning" icon-only
                    as="a"
                    :href="route('page.post', item.slug)" target="_blank"
                    title="open post"
                    icon="icon-mdi--external-link text-base text-reverse"
                />
                <Button
                    v-else
                    severity="warning" icon-only
                    disabled
                    title="Draft post cannot be viewed"
                    icon="icon-mdi--external-link text-base text-reverse"
                />

                <TooltipableContent text="quick edit button">
                    <Button
                        severity="success" icon-only
                        icon="icon-mdi--clock-edit-outline text-base"
                        aria-label="quick edit button"
                        @click="toEdit.setData(item)"
                    />
                </TooltipableContent>
            </template>
        </PanelTable>

        <FormStateModal
            :form-state="toEdit"
            content-style="width: min(60vw, 500px)"
            :header="__('quick_edit_post')"
        >
            <PostQuickForm :formState="toEdit"/>
        </FormStateModal>
    </div>
</template>
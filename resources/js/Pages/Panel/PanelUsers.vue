<script setup lang="ts">

import {TUser as TModel} from "@/utils/models";
import {__} from "@/utils/localization";
import {usePage} from "@/utils/inertia";
import PanelTable from "@/Components/PanelTable.vue";
import {UserRole} from "@/utils/generated_enums";
import UserForm from "@/Parts/Panel/UserForm.vue";
import LayoutPanel from "@/Components/Layout/LayoutPanel.vue";
import IHead from "@/Components/IHead.vue";
import {createUserForm} from "@/utilsForm/createUserForm";
import FormStateModal from "@/Components/Overlays/FormStateModal.vue";
import {useTable} from "@/Components/Table/useTable";
import PanelTableTitleCell from "@/Components/Table/PanelTableTitleCell.vue";
import Icon from "@/Components/Icon.vue";
import TableTh from "@/Components/Table/TableTh.vue";
import {toast} from "@/Components/Overlays/toast";

defineOptions({layout: LayoutPanel});

const page = usePage<{
    pageData: {
        users: TModel[]
    }
}>()

const formState = createUserForm({
    currentItem: () => undefined,
})

const tableState = useTable('users', {
    title: __('users'),
    routeGroup: 'users',
    itemsGetter: () => page.props.pageData.users,
    changeSequenceUrl: undefined,
    deletion: {
        canBe: (p) => {
            const loggedUser = page.props.auth!.user!;
            if (loggedUser.id == p.id) {
                toast.showError("You can't delete yourself!")
                return false;
            }
            if (p.role == UserRole.superadmin && loggedUser.role != UserRole.superadmin) {
                toast.showError('You can\'t delete superadmins!')
                return false;
            }
            return true;
        },
        apiUrl: 'default',
    },
    defaultSort: {
        field: 'name',
        desc: false,
    },
    canEditInline: false,
    createFn: formState.setData,
    editFn: formState.setData,
})
</script>

<template>
    <div class="flex h-full overflow-y-auto">
        <IHead :title="__('users')"/>
        <PanelTable
            :state="tableState"
            hide-last-modified
        >
            <template #head-cols>
                <TableTh full text-tr="name" />
                <TableTh text-tr="email_address" />
                <TableTh text-tr="role" />
                <TableTh text-tr="active" />
                <th></th>
            </template>

            <template #columns="{item} : {item: TModel}">
                <PanelTableTitleCell :state="tableState" :item="item" />
                <td>{{ item.email }}</td>
                <td>
                    <span v-if="item.role == UserRole.superadmin">Superadmin</span>
                    <span v-else-if="item.role == UserRole.admin">Admin</span>
                    <span v-else-if="item.role == UserRole.editor">Editor</span>
                    <span v-else>-</span>
                </td>
                <td>
                    <div class="flex justify-center items-center">
                        <Icon icon="icon-mingcute--check-circle-fill text-xl" :class="item.active ? 'text-green-600' : 'text-red-600'"></Icon>
                    </div>
                </td>
            </template>
        </PanelTable>

        <FormStateModal :form-state="formState"  :close-on-outside="false" :header="__('edit')">
            <UserForm :form-state="formState" :logged-user="page.props.auth!.user!" />
        </FormStateModal>
    </div>
</template>
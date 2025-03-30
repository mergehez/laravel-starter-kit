<script setup lang="ts">

import {computed} from "vue";
import LayoutPanel from "@/Components/Layout/LayoutPanel.vue";
import {usePage} from "@/utils/inertia";
import {__} from "@/utils/localization";
import IHead from "@/Components/IHead.vue";
import InputError from "@/Components/Form/InputError.vue";
import TextInput from "@/Components/Form/TextInput.vue";
import FormButtonRow from "@/Components/Form/FormButtonRow.vue";
import {createPasswordForm, createUserForm} from "@/utilsForm/createUserForm";
import UserForm from "@/Parts/Panel/UserForm.vue";
import FormStateModal from "@/Components/Overlays/FormStateModal.vue";

defineOptions({layout: LayoutPanel});

const page = usePage()

const user = computed(() => page.props.auth!.user!)

const formState = createUserForm({
    currentItem: () => user.value,
})

const formStatePwd = createPasswordForm()
const iid = formStatePwd.iid;

function showPwdModal() {
    formStatePwd.setData(user.value)
}

</script>

<template>
    <div class="flex flex-col overflow-y-auto px-2 flex-1">
        <IHead :title="__('profile')"/>
        <div class="flex items-center gap-3 mb-2">
            <h1 class="text-2xl font-bold">{{ __('profile') }}</h1>

            <i class="flex-1"></i>

            <button class="btn btn-secondary" @click.prevent="showPwdModal">{{ __('change_password') }}</button>
            <button class="btn btn-success">{{ __('save') }}</button>
        </div>
        <div class="-mx-2 mt-3">
            <UserForm :form-state="formState" :logged-user="user" hide-button/>
        </div>
    </div>

    <FormStateModal
        :form-state="formStatePwd"
        :header="__('change_password')"
        content-style="min-width: 400px;"
        >
        <form @submit.prevent="formStatePwd.submit" class="grid gap-2 p-3 items-center" style="grid-template-columns: auto 1fr;">
            <label :for="iid('old_password')">{{ __('old_password') }}</label>
            <TextInput v-model="formStatePwd.form.old_password" type="password" required :id="iid('old_password')"/>
            <InputError :message="formStatePwd.form.errors.old_password" second-col/>

            <label :for="iid('password')">{{ __('new_password') }}</label>
            <TextInput v-model="formStatePwd.form.password" type="password" required :id="iid('password')" autocomplete="new-password"/>
            <InputError :message="formStatePwd.form.errors.password" second-col/>

            <label :for="iid('password_confirmation')">{{ __('password_again') }}</label>
            <TextInput v-model="formStatePwd.form.password_confirmation" type="password" required :id="iid('password_confirmation')" autocomplete="new-password"/>
            <InputError :message="formStatePwd.form.errors.password_confirmation" second-col/>

            <FormButtonRow class="col-span-2" :form="formStatePwd.form" />
        </form>
    </FormStateModal>
</template>
<script setup lang="ts">

import {vAutoAnimate} from "@formkit/auto-animate";
import {computed} from "vue";
import {TUser} from "@/utils/models";
import {createUserForm} from "@/utilsForm/createUserForm";
import {UserRole} from "@/utils/generated_enums";
import {__} from "@/utils/localization";
import TextInput from "@/Components/Form/TextInput.vue";
import InputError from "@/Components/Form/InputError.vue";
import Checkbox from "@/Components/Form/Checkbox.vue";
import FormButtonRow from "@/Components/Form/FormButtonRow.vue";
import FormSelect from "@/Components/Form/FormSelect.vue";
import {enumToSelectOptions} from "@/utils/utils";

const props = defineProps<{
    formState: ReturnType<typeof createUserForm>,
    loggedUser: TUser,
    hideButton?: boolean
}>()

const form = computed(() => props.formState.form)
const iid = props.formState.iid
</script>

<template>
    <form
        @submit.prevent="formState.submit" class="grid gap-x-3 gap-y-0.5 px-3 items-center pb-2 flex-1"
        style="min-width: min(500px, 95vw); grid-template-columns: auto 1fr"
        v-auto-animate>

        <label :for="iid('name')">{{ __('name') }}</label>
        <TextInput v-model="form.name" required :id="iid('name')"/>
        <InputError :message="form.errors.name" second-col/>

        <i class="py-0.5 col-span-2"></i>

        <label :for="iid('email')">E-Mail</label>
        <TextInput v-model="form.email" required :id="iid('email')"/>
        <InputError :message="form.errors.email" second-col/>

        <i class="py-0.5 col-span-2"></i>

        <template v-if="loggedUser.role == UserRole.admin || loggedUser.role == UserRole.superadmin">
            <template v-if="loggedUser.role == UserRole.superadmin">
                <label :for="iid('role')">{{ __('role') }}</label>
                <!--<FormSelectFromEnum :options="UserRole" v-model="form.role" required :id="iid('role')"/>-->
                <FormSelect :options="enumToSelectOptions(UserRole)" v-model="form.role" required :id="iid('role')"/>
                <InputError :message="form.errors.role" second-col/>
            </template>

            <i class="py-0.5 col-span-2"></i>

            <label :for="iid('active')">{{ __('active') }}</label>
            <!--<div class="flex items-stretch">-->
            <Checkbox v-model:checked="form.active" :id="iid('active')" class="w-5 h-5"/>
            <!--</div>-->
            <InputError :message="form.errors.active" second-col/>

            <i class="py-0.5 col-span-2"></i>

            <label :for="iid('password')">{{ __('password') }}</label>
            <TextInput type="password" v-model="form.password" :id="iid('password')" autocomplete="new-password"/>
            <InputError :message="form.errors.password" second-col/>

            <i class="py-0.5 col-span-2"></i>

            <label :for="iid('password_confirmation')">{{ __('password_again') }}</label>
            <TextInput type="password" v-model="form.password_confirmation" :id="iid('password_confirmation')" autocomplete="new-password"/>
            <InputError :message="form.errors.password_confirmation" second-col/>

            <i class="py-0.5 col-span-2"></i>
        </template>

        <FormButtonRow v-if="!hideButton" :form="form" mt3/>
    </form>
</template>
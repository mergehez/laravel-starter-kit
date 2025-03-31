<script setup lang="ts">
import {Link, router, useForm} from "@inertiajs/vue3";
import {useUrlSearchParams} from "@vueuse/core";
import {handleFormValidationErrors} from "@/utils/form_helpers";
import InputError from "@/Components/Form/InputError.vue";
import TextInput from "@/Components/Form/TextInput.vue";
import {__} from "@/utils/localization";
import {api} from "@/utils/api_helpers";
import Button from "@/Components/Button.vue";

const props = defineProps<{
    redirect_url?: string
}>()

const searchParams = useUrlSearchParams();
console.log(props, searchParams.redirect_url)

const form = useForm({
    email: '',
    password: '',
});

const onSubmit = () => {
    api.post(route('api.login'), form.data())
        .then(() => {
            router.reload({
                only: ['auth'],
                onFinish: () => {
                    window.location.href = props.redirect_url ?? searchParams.redirect_url as string ?? route('panel.home')
                }
            })
        })
        .catch(e => handleFormValidationErrors(form, e));
};

// function onLostPassword() {
//     alert('contact mazlum!');
// }
</script>

<template>
    <div class="w-screen h-screen flex justify-center items-center bg-x0">
        <form method="POST" @submit.prevent="onSubmit"
              class="w-full max-w-md p-4 bg-x1 border border-x2 rounded-lg shadow-md sm:p-6 md:p-8 flex flex-col">
            <h5 class="text-2xl font-bold text-gray-900 dark:text-white text-center"> {{ __('admin_panel') }}</h5>

            <label for="form-email" class="mt-3 text-sm font-bold">{{ __('your_email_address') }}</label>
            <TextInput
                v-model="form.email"
                @input="form.errors.email = undefined"
                id="form-email"
                type="email"
                required/>
            <InputError :message="form.errors.email"/>

            <label for="form-password" class="mt-3 text-sm font-bold">{{ __('your_password') }}</label>
            <TextInput
                v-model="form.password"
                @input="form.errors.password = undefined"
                id="form-password"
                type="password"
                required/>
            <InputError :message="form.errors.email"/>

            <Button
                type="submit"
                severity="primary"
                class="mt-3 py-2"
            >
                Login to your account
            </Button>

            <div class="text-center pt-4 flex flex-col gap-4">
                <!--<button @click="onLostPassword()" type="button" class="text-sm text-blue-700 hover:underline dark:text-blue-500">Lost password?</button>-->
                <Link :href="route('page.home')" type="button" class="mx-auto text-sm text-blue-700 hover:underline dark:text-blue-500">Back to home page</Link>
            </div>
        </form>
    </div>
</template>
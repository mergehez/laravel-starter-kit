import {InertiaForm as OriginalInertiaForm, router, useForm as useFormOriginal} from '@inertiajs/vue3';
import {computed, reactive, ref, ShallowUnwrapRef, watch} from 'vue'
import {__} from '@/utils/localization';
import {defineStore} from 'pinia';
import {TAxiosError, TModelForm} from "@/utils/common_models";
import {uniqueId} from "@/utils/utils";
import {api} from "@/utils/api_helpers";
import {FormDataConvertible} from "@inertiajs/core";
import {routerAsync} from "@/utils/inertia";
import {toast} from "@/Components/Overlays/toast";

export type InertiaForm<TForm extends Record<string, FormDataConvertible>> = OriginalInertiaForm<TForm> & {
    errors: InertiaErrors<TForm>;
}

export function useForm<TForm extends Record<string, FormDataConvertible>>(data: TForm | (() => TForm)): InertiaForm<TForm> {
    return useFormOriginal(data) as InertiaForm<TForm>;
}

async function _formSubmitFn<TModel extends { id: number }, TForm extends { id: number } = TModelForm<TModel>>(
    form: InertiaForm<TForm>,
    original: TModel | undefined,
    // apiCall: (isPost: boolean, data: TForm, standardReq: (url: string) => Promise<TModel>) => Promise<TModel>,
    apiCall: string | ((isPost: boolean, data: TForm, original: TModel | undefined) => Promise<TModel>),
    throwError = false,
    onSuccess: (res: TModel) => Promise<any>
) {
    try {
        console.log('clear errors');
        form.clearErrors();
        form.processing = true;
        console.log('get data');
        const data = form.data();
        console.log('got data', JSON.parse(JSON.stringify(data)));
        const isPost = !form.id || form.id < 1;
        let res = typeof apiCall === 'string'
            ? await api.request<TModel>({
                method: isPost ? 'post' : 'put',
                url: isPost ? apiCall : apiCall + '/' + form.id,
                data: data,
            }).then(t => t.data)
            : await apiCall(isPost, data, original);

        res = res ?? data

        if (original) {
            console.log('updating original');
            for (const key in res) {
                if (res[key] !== original[key]) {
                    original[key] = res[key]
                }
            }
        }

        await onSuccess(res)

        toast.showSuccess(__('saved_successfully'))

        form.processing = false
        form.recentlySuccessful = true
        setTimeout(() => (form.recentlySuccessful = false), 3000)

        return res
    } catch (e) {
        form.processing = false;
        handleFormValidationErrors(form, e as TAxiosError);
        if (!(e as TAxiosError).response?.data.errors) {
            (form.errors as any)._error = (e as TAxiosError).response?.data.message || (e as TAxiosError).message;
        }
        if (throwError) throw e;
        return undefined;
    }
}

export type TCreateFormStateOpts<TModel extends { id: number }, TForm extends { id: number }> = {
    uniqueKey?: string;
    currentItem?: () => TModel | undefined;
    autoFill?: (form: TForm) => any;
    onSuccess?: (data: TModel) => any;
    onSuccessAsync?: (data: TModel) => Promise<any>;
    closePopupOnSuccess?: boolean;
    closePopupDelay?: number;
    reloadOnSuccess?: boolean | string;
    waitForReloadFinish?: boolean | string;
    throwError?: boolean;
    extraState?: Record<string, any>,
};

export function _createFormState<TModel extends { id: number }, TForm extends { id: number }, TComputed extends ((...args: any) => any)>(
    opts: undefined | TCreateFormStateOpts<TModel, TForm>,
    formGetter: (item: TModel | undefined) => TForm,
    apiCall: string | ((isPost: boolean, data: TForm, original: TModel | undefined) => Promise<TModel>),
    computedState?: (form: TForm, original?: TModel) => TComputed
) {
    const extra = reactive(opts?.extraState ?? {})

    const key = opts?.uniqueKey || uniqueId()
    const storeSetupFn = () => {
        const currentOriginal = ref(opts?.currentItem?.())
        const _key = ref(key)

        function createForm() {
            console.warn('createForm')
            const formData = formGetter(currentOriginal.value);
            if (opts?.autoFill)
                opts.autoFill(formData)
            return useForm<TForm & { _error: string }>(() => {
                return {
                    ...formData,
                    _error: ''
                }
            })
        }

        const currentForm = ref(createForm())

        async function submit() {
            return await _formSubmitFn<TModel, TForm>(
                currentForm.value,
                currentOriginal.value,
                apiCall,
                opts?.throwError ?? true,
                async (res1) => {
                    if (res1) {
                        const _onSuccessListeners = [] as ((data: TModel) => Promise<any>)[]

                        if (opts?.closePopupOnSuccess ?? true) {
                            _onSuccessListeners.push(async () => {
                                if (opts?.closePopupDelay)
                                    await new Promise(resolve => setTimeout(resolve, opts.closePopupDelay))

                                if (!opts?.reloadOnSuccess) {
                                    closePopup()
                                    return
                                }

                                const reloadOpts = typeof opts.reloadOnSuccess === 'string'
                                    ? {only: [opts.reloadOnSuccess]}
                                    : undefined
                                if (opts?.waitForReloadFinish ?? true) {
                                    await routerAsync.reload(reloadOpts)
                                } else {
                                    router.reload(reloadOpts)
                                }
                                closePopup()
                            })
                        }

                        if (opts?.onSuccessAsync) {
                            _onSuccessListeners.push(opts.onSuccessAsync)
                        }

                        if (opts?.onSuccess) {
                            _onSuccessListeners.push(() => new Promise((resolve) => {
                                resolve(opts.onSuccess!(res1))
                            }))
                        }

                        for (const l of _onSuccessListeners) {
                            await l(res1);
                        }
                        currentForm.value.reset()
                    }
                }
            )
        }

        function setData(newItem?: TModel) {
            currentOriginal.value = newItem
            currentForm.value = createForm()
            _key.value = uniqueId()
            visible.value = true
        }

        const visible = ref(currentOriginal.value !== undefined)

        const closePopup = () => {
            currentOriginal.value = undefined
            currentForm.value = createForm()
            visible.value = false
            _key.value = uniqueId()
        }
        const clear = () => {
            closePopup()
        }

        watch(visible, (n) => {
            if (!n) {
                closePopup()
            }
        })

        return {
            extra,
            computed: computed(computedState?.(currentForm.value, currentOriginal.value) ?? (() => ({}) as TComputed)),
            visible,
            closePopup,
            clear,
            currentOriginal: computed(() => currentOriginal.value),
            form: computed<InertiaForm<TForm & { _error: string }>>(() => currentForm.value),
            iid: (prop: keyof TForm) => `${key}-${prop as any}`,
            key: _key,
            submit,
            setData,
            forceRecreateForm: () => {
                currentForm.value = createForm()
            }
        }
    }
    const res = defineStore(key, storeSetupFn)() //satisfies TFormState<TModel, TForm>;

    // type aaa = PiniaStore<typeof res>;
    // type aaa = Pick<typeof res, 'extra' | 'computed' | 'visible' | 'closePopup' | 'clearData' | 'currentOriginal' | 'form' | 'key' | 'submit' | 'setData' | 'forceRecreateForm'>;
    type bbb = ReturnType<typeof storeSetupFn>
    type ccc = ShallowUnwrapRef<bbb>
    return res as unknown as ccc
    // return res as unknown as CreateFormStateResult<TModel, TForm, TComputed>;
}

export type TGenericFormState<
    TModel extends { id: number } = any,
    TForm extends { id: number } = TModelForm<TModel>,
    TComputed extends ((...args: any) => any) = any
>
    = ReturnType<typeof _createFormState<TModel, TForm, TComputed>>

export function handleFormValidationErrors(form: { errors: any }, err: TAxiosError) {
    const errors = err.response?.data.errors;
    form.errors = {};
    if (errors) {
        form.errors = populateFormErrors(form.errors, errors);
    } else {
        console.error(err);
    }
}

function populateFormErrors(formErrors: Record<string, any>, errors: Record<string, any>) {
    formErrors ??= {};
    for (const key in errors) {
        if (key.includes('.')) {
            const [parentKey, childKey] = key.split('.');
            formErrors[parentKey] ??= {};
            formErrors[parentKey] = populateFormErrors(formErrors[parentKey], {
                [childKey]: errors[key]
            });
            if (typeof formErrors[parentKey][childKey] === 'string') {
                console.log('string', `${parentKey}.${childKey}`, formErrors[parentKey][childKey]);
                formErrors[parentKey][childKey] = formErrors[parentKey][childKey].replace(`${parentKey}.${childKey}`, parentKey);
            }
        } else if (!Array.isArray(errors[key]))
            formErrors[key] = errors[key];
        else if (errors[key].length === 0)
            formErrors[key] = __('something_went_wrong');
        else if (errors[key].length === 1)
            formErrors[key] = errors[key][0];
        else
            formErrors[key] = '- ' + errors[key].join('<br/>- ');
    }
    return formErrors;
}


export type InertiaErrors<T extends object> = {
    [K in keyof T]?: T[K] extends (infer U | undefined)
        ? U extends object
            ? U extends null
                ? string
                : U extends Array<any>
                    ? string
                    : InertiaErrors<U>
            : string
        : T[K] extends object
            ? T[K] extends null
                ? string
                : T[K] extends Array<any>
                    ? string
                    : InertiaErrors<T[K]>
            : string
}

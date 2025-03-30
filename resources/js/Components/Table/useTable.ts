import {defineStore} from "pinia";
import {search, uniqueId} from "@/utils/utils";
import {computed, ref, ShallowUnwrapRef} from "vue";
import {loc} from "@/utils/globalState";
import {api} from "@/utils/api_helpers";
import {router} from "@inertiajs/vue3";
import {__} from "@/utils/localization";
import {openConfirmationDialog} from "@/Components/Overlays/confirm_modal_helpers";
import {TModelWithTitle} from "@/utils/models";
import {TGenericFormState} from "@/utils/form_helpers";
import {TModelForm} from "@/utils/common_models";
import {toast} from "@/Components/Overlays/toast";

export function useTable<
    T extends TModelWithTitle,
    TSortField,
    TForm extends { id: number } = TModelForm<T>,
    TFormState extends TGenericFormState<T, TForm> = TGenericFormState<T, TForm>
>(
    id: string,
    props: {
        title: string,
        itemsGetter: () => T[],
        searchFn?: (t: T, q: string) => boolean,
        defaultSort?: {
            field: TSortField,
            desc?: boolean
        },
        routeGroup: string,
        changeSequenceUrl?: 'default' | ((id1: number, id2: number) => string),
        deletion: ({
            canBe: (p: T) => boolean,
        } & ({
            customAskToFn: (p: T) => void
        } | {
            canBe: (p: T) => boolean,
            apiUrl: 'default' | ((id: number) => string),
            askToTitle?: (p: T) => string,
        })) | undefined,
        sortFn?: (items: T[], sortField: TSortField, desc?: boolean) => T[],
    } & ({
        canEditInline?: false,
        editFn: (item: T, data?: any) => any,
        createFn: (data?: any) => any,
    } | {
        canEditInline: true,
        inlineFormCreator: (item: T|undefined, data?: any) => TFormState
    })
){
    function getTitle(item: T, or?: string) {
        const val = item.title ?? item.name;
        if(val && typeof val === 'object')
            return val[loc.value] || or || '';

        return val || or || '';
    }
    props.sortFn ??= items => items;
    props.searchFn ??= (t,q) => search(getTitle(t), q);

    const storeSetupFn = () => {
        const items = computed(props.itemsGetter);

        const searchQuery = ref('');
        const currentSortField = ref(props.defaultSort?.field ?? (props.changeSequenceUrl ? 'sequence' : undefined));
        const currentSortDesc = ref(props.defaultSort?.desc)

        const sort = (sortField: TSortField, desc?: boolean) => {
            if (currentSortField.value === sortField) {
                currentSortDesc.value = desc ?? !currentSortDesc.value
            } else {
                currentSortField.value = sortField
                currentSortDesc.value = desc ?? true
            }
        }

        const filteredItems = computed(() => {
            const res = searchQuery.value
                ? items.value.filter(t => props.searchFn!(t, searchQuery.value))
                : items.value;

            if (currentSortField.value && props.sortFn) {
                console.log('execute sort')
                return props.sortFn(res, currentSortField.value, currentSortDesc.value)
            }

            return res;
        });

        function changeSequence(p: T, direction: 'up' | 'down') {
            const index = items.value.indexOf(p);
            const otherIndex = direction === 'up' ? index - 1 : index + 1;
            const other = items.value[otherIndex];
            const url = props.changeSequenceUrl == 'default'
                ? route(`api.${props.routeGroup}.swap-sequence`, {id1: p.id, id2: other.id})
                : props.changeSequenceUrl!(p.id, other.id);

            api.put(url)
                .then(() => {
                    router.reload({only: ['pageData']})
                })
                .catch((e) => {
                    if (e.message == 'CSRF token mismatch.') {
                        toast.showError("please_reload_page_and_try_again");
                        return;
                    }
                    toast.showError(__('something_went_wrong'));
                })
        }

        function askToDelete(p: T) {
            const deletion = props.deletion;
            if(!deletion)
                return;

            if ('customAskToFn' in deletion) {
                deletion.customAskToFn(p);
                return;
            }

            router.reload({
                only: ['info'],
                onSuccess: () => {
                    if (!deletion.canBe(p)) {
                        return;
                    }
                    const title = deletion.askToTitle?.(p) ?? getTitle(p);
                    openConfirmationDialog({
                        message: `<b>${title}</b><br/>` + __('delete_confirm_message'),
                        onConfirm: () => {
                            const url = deletion.apiUrl == 'default'
                                ? route(`api.${props.routeGroup}.destroy`, p.id)
                                : deletion.apiUrl(p.id);
                            api.delete(url)
                                .then(() => router.reload())
                                .catch(toast.showFromAxiosError)
                        }
                    })
                }
            })
        }


        const inlineFormState = ref<TFormState>();
        function onEditClicked(item: T, data?: any) {
            if('editFn' in props){
                props.editFn(item, data);
            }else{
                if (inlineFormState.value?.form.id === item.id) {
                    closeInlineForm();
                    return;
                }
                inlineFormState.value = {
                    ...props.inlineFormCreator(item, data) as any,
                    id: item.id,
                };
            }
        }
        function onCreateClicked(data?: any) {
            if('createFn' in props){
                props.createFn(data);
            }else{
                inlineFormState.value = props.inlineFormCreator(undefined, data);
            }
        }
        async function submitInlineForm() {
            if (inlineFormState.value) {
                if (await inlineFormState.value.submit()) {
                    closeInlineForm();
                }
            }
        }

        function closeInlineForm() {
            console.warn('closeInlineForm')
            inlineFormState.value = undefined;
        }

        const isBeingEditedInline = (item: T) => props.canEditInline && !!inlineFormState.value && inlineFormState.value.form.id === item.id;
        const getInlineFormState = (item: T) => !!inlineFormState.value && inlineFormState.value.form.id === item.id ? inlineFormState.value!.form : undefined;
        return {
            tableTitle: props.title,
            searchQuery,
            filteredItems,
            changeSequence,
            askToDelete,
            sort,
            currentSortField,
            currentSortDesc,
            isSequenced: !!props.changeSequenceUrl,
            canEditInline: props.canEditInline === true,
            getItemTitle: (t: T, or?: string) => getTitle(t, or),

            inlineFormState,
            closeInlineForm,
            // isInlineCreateMode: computed(() => inlineFormState.value && inlineFormState.value?.form.id === 0),
            isBeingEditedInline,
            getInlineFormState,
            onEditClicked,
            onCreateClicked,
            submitInlineForm,
        }
    };

    const res = defineStore(id + uniqueId(), storeSetupFn)();

    type bbb = ReturnType<typeof storeSetupFn>
    type ccc = ShallowUnwrapRef<bbb>
    return res as unknown as ccc
}

export type TTableState<T extends TModelWithTitle, TSortField = never> = ReturnType<typeof useTable<T, TSortField>>;
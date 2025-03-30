import {computed, reactive, WritableComputedRef} from "vue";
import {overlayState} from "./overlay_utils";

type TPromptOptions = {
    value: string,
    placeholder?: string,
    regex?: RegExp,
    required?: boolean,
    invalidMessage?: string,
    validate?: (value: string) => string | undefined,
}

type TOptions = {
    title?: string,
    message: string,
    data?: any,
    textConfirm?: string,
    textCancel?: string,
    classCancel?: string,
    classConfirm?: string,
    onConfirm?: (promptValue?: string) => void,
    onCancel?: () => void
    onClose?: () => void,
    prompt?: TPromptOptions,
}

type TState = Required<Omit<TOptions, 'data'|'prompt'>> & {
    _show: boolean,
    data?: any,
    prompt?: TPromptOptions & {errorMessage?: string},
    promptValue: string,
    show: WritableComputedRef<boolean>,
    defaultTitle?: string,
    defaultTextConfirm?: string,
    defaultTextCancel?: string,
}
export type ConfirmModalConfigurable = {
    defaultTitle?: string,
    defaultTextConfirm?: string,
    defaultTextCancel?: string,
}

export const confirmModalState = reactive<TState>({
    prompt: undefined,
    promptValue: '',
    _show: false,
    show: computed({
        get: (): boolean => confirmModalState._show,
        set: (v) => {
            overlayState.modalZIndex++;
            if (v === confirmModalState._show)
                return;
            confirmModalState._show = v;
            if (!v)
                confirmModalState.onClose?.();
        }
    }),
    title: '',
    message: '',
    textConfirm: '',
    textCancel: '',
    classCancel: '',
    classConfirm: '',
    defaultTitle: undefined as string | undefined,
    defaultTextConfirm: undefined as string | undefined,
    defaultTextCancel: undefined as string | undefined,
    data: undefined as any,
    onConfirm: () => {},
    onCancel: () => {},
    onClose: () => {},
})

export function openConfirmationDialog(opts: TOptions) {
    confirmModalState.title = opts.title ?? confirmModalState.defaultTitle ?? 'Warning';
    confirmModalState.message = opts.message;
    confirmModalState.data = opts.data;
    confirmModalState.textConfirm = opts.textConfirm ?? confirmModalState.defaultTextConfirm ?? 'Yes';
    confirmModalState.textCancel = opts.textCancel ?? confirmModalState.defaultTextCancel ?? 'No';
    confirmModalState.onConfirm = opts.onConfirm ?? (() => {});
    confirmModalState.onCancel = opts.onCancel ?? (() => {});
    confirmModalState.onClose = opts.onClose ?? (() => {});
    confirmModalState.prompt = opts.prompt ?? undefined;
    if(opts.prompt){
        onConfirmationPromptValueChange(opts.prompt.value);
    }

    if(!opts.classConfirm || !opts.classConfirm.includes('btn-')){
        opts.classConfirm += ' btn-success'
    }

    if(!opts.classCancel || !opts.classCancel.includes('btn-')){
        opts.classCancel += ' btn-light'
    }

    confirmModalState.classConfirm = opts.classConfirm ?? '';
    confirmModalState.classCancel = opts.classCancel ?? '';
    confirmModalState.show = true;
}


export function onConfirmationPromptValueChange(value: string) {
    if(!confirmModalState.prompt)
        return;

    confirmModalState.promptValue = value;

    if(value && confirmModalState.prompt.regex && !confirmModalState.prompt.regex.test(value)){
        confirmModalState.prompt.errorMessage = confirmModalState.prompt.invalidMessage ?? 'Invalid input';
    }else {
        const err = confirmModalState.prompt.validate?.(value);
        confirmModalState.prompt.errorMessage = err || '';
    }
}
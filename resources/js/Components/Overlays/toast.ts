import { ref } from 'vue';
import {__} from "@/utils/localization";
import {TAxiosError} from "@/utils/common_models";
import {TAlertSeverity} from "@/Components/Alert.vue";
import {AxiosError} from "axios";

export interface ToastOptions {
    severity: TAlertSeverity;
    message: string;
    title?: string;
    duration?: number; // In milliseconds
    icon?:
        | `icon-${string}`
        | 'icon-fa-solid--info-circle'
        | 'icon-fa-solid--check-circle'
        | 'icon-fa-solid--exclamation-triangle'
        | 'icon-fa-solid--exclamation-circle'
        | 'icon-fa-solid--bell'
    onClick?: () => void;
    closable?: boolean,
    onDismiss?: () => void;
}

export interface ToastInstance extends Required<ToastOptions> {
    id: number;
}

export const _toasts = ref<ToastInstance[]>([]);


let toastIdCounter = 0;
const showToast = (options: ToastOptions): number => {
    const id = toastIdCounter++;
    const newToast: ToastInstance = {
        closable: options.closable ?? true,
        duration: options.duration ?? 3000,
        icon: options.icon ?? 'icon-fa-solid--info-circle',
        onClick: options.onClick ?? (() => {}),
        onDismiss: options.onDismiss ?? (() => {}),
        severity: options.severity,
        message: options.message,
        title: options.title ?? '',
        id,
    };
    _toasts.value.push(newToast);
    return id;
};

const removeToast = (id: number) => {
    const toastIndex = _toasts.value.findIndex(t => t.id === id);
    if (toastIndex > -1) {
        const toastToRemove = _toasts.value[toastIndex];
        _toasts.value.splice(toastIndex, 1); // Use splice for potential reactivity benefits
        // Call the original onDismiss if provided in options
        toastToRemove?.onDismiss?.();
    }
};

export const toast = {
    show: (options: ToastOptions) => {
        return showToast(options);
    },
    showWarning(message: string, title?: string, duration?: number) {
        return showToast({
            severity: 'warning',
            message,
            title,
            duration,
            icon: 'icon-fa-solid--exclamation-triangle',
        });
    },
    showSuccess(message: string, title?: string, duration?: number) {
        return showToast({
            severity: 'success',
            message,
            title,
            duration,
            icon: 'icon-fa-solid--check-circle',
        });
    },
    showInfo(message: string, title?: string, duration?: number) {
        return showToast({
            severity: 'info',
            message,
            title,
            duration,
            icon: 'icon-fa-solid--info-circle',
        });
    },
    showError(message: string, title?: string, duration?: number) {
        return showToast({
            severity: 'danger',
            message,
            title: title || __('error'),
            duration,
            icon: 'icon-fa-solid--exclamation-circle',
        });
    },
    showFromAxiosError: (err: TAxiosError|AxiosError, fallbackMsg?: string, duration = 5000) => {
        showToast({
            message: (err.response?.data as any)?.message ?? err.message ?? fallbackMsg ?? __('something_went_wrong'),
            severity: 'danger',
            title: __('error'),
            icon: 'icon-fa-solid--exclamation-triangle',
            duration: duration
        });
    },
    remove: (id: number|ToastInstance) => {
        removeToast(typeof id === 'number' ? id : id.id);
    },
    clear: () => {
        _toasts.value = [];
    },
}
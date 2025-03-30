import {usePage as usePageOriginal} from "@inertiajs/vue3";
import type {Page as PageOriginal} from "@inertiajs/core";
import { PageProps, ReloadOptions, router, VisitOptions } from '@inertiajs/core';
import {TUser} from "@/utils/models";
import {AppDisplayLang, KeyValueKey} from "@/utils/generated_enums";

export function usePage<T extends PageProps = PageProps>() {
    return usePageOriginal<T & {
        auth?: {
            user?: TUser;
            token: string;
        },
        localization: {
            locale: AppDisplayLang,
            locales: AppDisplayLang[],
        },
        session_lifetime: number,
        app_version: string,
        php_version: string,

        errors: PageOriginal["props"]['errors'] // Errors & ErrorBag;

        info: Record<KeyValueKey, string>,
        navStats: Record<string, number>,
    }>()
}


function changeLanguage(langKey: string){
    router.visit(route('change-locale', langKey))
    // api.get(route('language', {language: langKey})).then();
    // usePage().props.localization.locale = langKey;
}


function makeAsyncOptions<TOptions extends Omit<VisitOptions, 'preserveScroll' | 'preserveState'>, T = unknown>(
    options: TOptions | undefined,
    resolve: (value: T | PromiseLike<T>) => void,
    reject: (reason?: any) => void
): TOptions {
    return {
        ...(options ?? {} as TOptions),
        onFinish: () => {
            resolve(true as any)
        },
        onError: (error: any) => {
            reject(error)
        }
    }
}
export const routerAsync = {
    visit: (url: string | URL, options?: VisitOptions) => {
        return new Promise((resolve, reject) => {
            router.visit(url, makeAsyncOptions(options, resolve, reject))
        })
    },
    reload: async (options?: ReloadOptions) => {
        await new Promise((resolve, reject) => {
            router.reload(makeAsyncOptions(options, resolve, reject))
        })
    }
}
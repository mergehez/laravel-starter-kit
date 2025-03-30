// noinspection JSUnusedGlobalSymbols

import _Echo from 'laravel-echo';
import { Pinia } from 'pinia';
import {ParameterValue, route as routeFn, Router, ValidRouteName} from 'ziggy-js';
import { Config, RouteParams } from 'ziggy-js';
import {FormDataConvertible, Method, Progress} from "@inertiajs/core";
import {InertiaErrors} from "@/utils/form_helpers";

export {};

declare global {
    interface Window {
        axios: any
        pinia: Pinia;

        Echo: _Echo<any>;

        themeManager: {
            update: (newTheme: "dark" | "light") => "dark" | "light";
            toggle: () => "dark" | "light";
            isDark: boolean;
            listener: Function;
            _init: () => void;
        };
    }

    const route: typeof routeFn;
    function route(): Router;
    // function route(name: string, params?: RouteParams<typeof name> | undefined, absolute?: boolean): string;
    export function route<T extends ValidRouteName>(
        name: T,
        params?: RouteParams<T> | undefined,
        absolute?: boolean,
        config?: Config,
    ): string;

    export function route<T extends ValidRouteName>(
        name: T,
        params?: ParameterValue | undefined,
        absolute?: boolean,
        config?: Config,
    ): string;
}

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        route: typeof route;
    }
}
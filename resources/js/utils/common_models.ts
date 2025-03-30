import type { InertiaForm } from "@inertiajs/vue3";

export type TrObj = Record<string, string>;

export type PaginatedData<T> = {
    data: T[];
    per_page: number;
    total: number;
    from: number;
    to: number;
    current_page: number;
    last_page: number;
    first_page_url?: string;
    prev_page_url?: string | null;
    next_page_url?: string;
    last_page_url: string;
    links: {
        url?: string | null;
        label: string;
        active: boolean;
    }[]
    path: string;
}

export type TSelectOption<TValue = string | number, TLabel = string|TrObj> = {
    label: TLabel
    value: TValue
}

export type TApiResponse<T> = {
    message: string,
    result: T
}

export type TAxiosError = {
    message: string,
    status: number,
    response: {
        status: number,
        data: {
            errors?: Record<string, any>
            result: string,
            message: string,
            data?: any,
        },
    }
}

type AuditColumns = {
    updated_at: string,
    created_at: string,
    deleted_at?: string,
    created_by: number,
    updated_by: number,
    deleted_by?: number,
}

export type TErrorLog = {
    id: number;
    url: string;
    route: string;
    message: string;
    count: number;
    created_at: number;
    updated_at: number;
}

export type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};


type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? A : B;
export type OmitReadonly<T> = {
    [K in keyof T as IfEquals<{ -readonly [Q in K]: T[K] }, { [Q in K]: T[K] }, K, never>]: T[K]
};

export type TModelForm<TModel extends { id: number }> = Prettify<{ id: number } & Omit<OmitReadonly<TModel>, keyof AuditColumns> & Partial<AuditColumns>>;

export type PiniaStore<T> = Omit<T, '$state' | "$patch" | "$reset" | "$subscribe" | "$onAction" | "$dispose" | "$id" | "_customProperties">
// export type PiniaStorePretty<T> = FlatType<PiniaStore<T>>

// type FlatType<T> = {
//     [K in keyof T]: T[K] extends infer U
//         ? U extends object | undefined      // Check if union contains object/undefined
//             ? U extends Function              // Preserve functions
//                 ? U
//                 : U extends undefined           // Handle pure undefined case
//                     ? undefined
//                     : object                      // Convert complex objects to 'object'
//             : U                               // Preserve primitives and other types
//         : never;
// };
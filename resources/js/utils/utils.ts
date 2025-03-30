// noinspection JSUnusedGlobalSymbols

import _latinize from "@/utils/latinize";
import {computed, reactive, ref, watch} from "vue";
import {TrObj, TSelectOption} from "@/utils/common_models";
import {emptyTrObj} from "@/utils/constants";
export const latinize = (str: string) => _latinize(str);
export function uniqueId(len = 10) {
    const arr = new Uint8Array(len / 2);
    window.crypto.getRandomValues(arr)
    return Array.from(arr, dec => dec.toString(16).padStart(2, "0")).join('')
}

export function sizeToString(s: number) {
    return s > 1024 * 1024 ? (s / 1024 / 1024).toFixed(2) + ' MB' : (s > 1024 ? (s / 1024).toFixed(2) + ' KB' : s + ' B')
}

export const hasClipboard = 'clipboard' in navigator;

export async function copyToClipboard(text: string) {
    console.log('copying', text)
    await navigator.clipboard.writeText(text);
    return true;
}
export function stripHTML(str: string, maxLength?: number) {
    const parsedHTML = new DOMParser().parseFromString(str, "text/html");
    const text = parsedHTML.body.textContent || '';

    if ((!maxLength || text.length < maxLength) && /(<([^>]+)>)/gi.test(text)) {
        return stripHTML(text);
    }

    return text?.replace(/\n/g, ' ')?.substring(0, maxLength) || "";
}

type TArrayItem<TArray> = TArray extends (infer T)[] ? T : never;

export function arrToObj<TArr extends string[] | number[], R>(arr: TArr, map: (key: TArrayItem<TArr>) => R) {
    return arr?.reduce((obj, key) => {
        return {
            ...obj,
            [key]: map(key as TArrayItem<TArr>)
        };
    }, {} as Record<TArrayItem<TArr>, R>);
}

export function arrToSelectOpts<TArrItem extends string | number, RValue = TArrItem>(
    arr: TArrItem[],
    value: (key: TArrItem) => RValue = (key) => key as any,
    label: (key: TArrItem) => string = (key) => key?.toString(),
) {
    return arr?.map(t => {
        return {
            label: label(t),
            value: value(t),
        } satisfies TSelectOption<RValue>
    })
}

export function enumToSelectOptions<
    TKey extends string,
    TValue extends string | number,
    ValueAsKey extends boolean = false,
>(e: Record<TKey, TValue>, valueAsKey?: ValueAsKey) {
    const res = Object.entries(e)
        .filter(([key, val]) => Number.isNaN(Number(key)))
        .map(([key, value]) => ({
            value: valueAsKey ? key : value as TValue,
            label: valueAsKey ? value as TValue : key,
        }))

    return res  as ValueAsKey extends true
        ? TSelectOption<TKey, TValue>[]
        : TSelectOption<TValue, TKey>[]
}

export function search(str: string|number, q: string|number) {
    if (typeof str === 'number') str = str.toString();
    if (typeof q === 'number') q = q.toString();
    return latinize(str.toLowerCase()).includes(latinize(q.toLowerCase()));
}

export function cloneTrObj(obj: TrObj | undefined){
    if(!obj) obj = emptyTrObj;

    return JSON.parse(JSON.stringify(obj)) as TrObj;
}
export function compareTrObjs(obj: TrObj | undefined, obj2: TrObj | undefined) {
    if(!obj) obj = emptyTrObj;
    if(!obj2) obj2 = emptyTrObj;

    return JSON.stringify(obj) === JSON.stringify(obj2);
}

type UseAsyncFnOpts<TRes> = {
    fn: () => Promise<TRes>
    then?: (res: TRes) => void
    catch?: (err: any, setError: (err: any) => any) => void
    finally?: () => void,
    alwaysStopProcessingOnFinally?: boolean
}
export function useAsyncFn<TRes>(opts: UseAsyncFnOpts<TRes>) {
    const processing = ref(false)
    const error = ref<string | null>(null)
    const result = ref<any>(null)

    async function execute() {
        processing.value = true
        error.value = null
        try {
            result.value = await opts.fn()
            opts.then?.(result.value)
        } catch (e) {
            error.value = e as string
            opts.catch?.(e, (err) => {
                error.value = err
            })
        } finally {
            if(opts.finally) {
                opts.finally()
            }
            if(opts.alwaysStopProcessingOnFinally || !opts.finally) {
                processing.value = false
            }
        }
    }

    return reactive({ processing, error, result, execute })
}


export function usePageDependentState<TState, TData, Y>(_: TState|undefined, computeFn: (state: TState) => TData|Promise<TData>, extra: Y = {} as Y) {
    const _state = ref<TState>()
    const _data = ref<TData>()

    watch(_state, (newState) => {
        if (!newState) {
            _data.value = undefined
            return
        }

        const result = computeFn(newState)
        if (result instanceof Object && 'then' in result && typeof result.then === 'function') {
            console.log('result is a promise')
            result.then((data) => {
                console.log(data)
                _data.value = data
            })
        } else {
            _data.value = result as TData
        }
    })

    return reactive({
        state: computed(() => _state.value),
        key: uniqueId(),
        hasState: computed({
            get: () => !!_state.value,
            set: (value) => {
                if(!value)
                    _state.value = undefined
            }
        }),
        data: computed(() => _data.value),
        updateState(state: TState | undefined) {
            _state.value = state
            this.key = uniqueId()
        },
        clearState() {
            _state.value = undefined
            this.key = uniqueId()
        },
        ...extra
    })
}
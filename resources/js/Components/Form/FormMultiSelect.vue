<script setup lang="ts" generic="TValue extends string | number">
import {computed, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {vOnClickOutside} from '@vueuse/components'
import {twMerge} from "tailwind-merge";
import {__, TrKey} from "@/utils/localization";
import {search} from "@/utils/utils";
import {TSelectOption} from "@/utils/common_models";

type TOpt = TSelectOption<TValue>

const selection = defineModel<TValue[]>({required: true});
const props = withDefaults(defineProps<{
    options: TOpt[],
    translate?: boolean,
    id?: string,
    placeholder?: string
    wrapperClass?: string,
    acceptInput?: boolean,
    trFunc?: (key: string | TrKey) => string,
    singleSelection?: boolean,
}>(), {
    trFunc: (t: string) => t,
    translate: true,
    acceptInput: false
})

function getOptByValue(key: TValue | any) {
    return props.options.find(k => k.value == key)!;
}

const query = ref('');
const focused = ref(false);

function removeSelection(opt: TOpt) {
    selection.value = selection.value.filter(t => t !== opt.value)
}

function addSelection(opt: TOpt, keepFocus = false) {
    if (props.singleSelection) {
        selection.value = [opt.value];
        query.value = '';
        setTimeout(() => {
            focused.value = false;
            // focusedRow.value = undefined;
        }, 1)
    } else {
        selection.value.push(opt.value)
        if (keepFocus) {
            refInput.value?.focus();
        }
    }
}

const inputRect = ref<{ left: number, width: number }>();
const refTopWrapper = ref<HTMLDivElement>();
const onFocusListener = () => {
    inputRect.value = {
        left: refTopWrapper.value!.getBoundingClientRect().left,
        width: refTopWrapper.value!.offsetWidth,
    }
    focused.value = true;

    if (props.singleSelection && selection.value.length > 0) {
        setTimeout(() => {
            focusedRow.value = filteredOptions.value.findIndex(t => t.value == selection.value[0]);
            scrollToFocusedRow();
        }, 50)
    }
};
const refInput = ref<HTMLInputElement>();
onMounted(() => {
    if (!refInput.value) return;

    refInput.value.addEventListener('keydown', onQueryKeyUp);
    refInput.value.addEventListener('focusin', onFocusListener);
    if (props.singleSelection && selection.value.length > 0) {
        setTimeout(() => {
            focusedRow.value = filteredOptions.value.findIndex(t => t.value == selection.value[0]);
            scrollToFocusedRow();
        }, 50)
    }
})
onBeforeUnmount(() => {
    if (!refInput.value) return;

    refInput.value.removeEventListener('focusin', onFocusListener);
    refInput.value.removeEventListener('keydown', onQueryKeyUp);
})

function onClickedOutside() {
    focused.value = false;
    if (!props.singleSelection)
        focusedRow.value = undefined;
    if (props.acceptInput && query.value.trim().length > 0) {
        addSelection(getOptByValue(query.value.trim()));
        query.value = '';
    }
}

// const filteredOptions = ref(props.options.filter(k => !selection.value.includes(k.value)));
const filteredOptions = computed(() => {
    if (query.value.length == 0) {
        return props.options
            .filter(k => !selection.value.includes(k.value));
    }

    return props.options
        .filter(k => search(getText(k), query.value))
        .filter(k => !selection.value.includes(k.value));
});
const focusedRow = ref<number>();
// watch(focusedRow, () => {
//     scrollToFocusedRow();
// })
watch(query, () => {
    if (!props.singleSelection) {
        focusedRow.value = undefined;
        scrollToFocusedRow();
    }
})

const lastPoppedSelections = ref([] as TValue[]);

function onQueryKeyUp(e: KeyboardEvent) {
    if (e.code == 'Enter')
        e.preventDefault();

    if (e.code == 'Escape' || e.code == 'Tab') {
        focused.value = false;
        if (e.code == 'Escape') {
            (document.activeElement as any).blur();
            query.value = '';
        } else {
            if (props.acceptInput && query.value.trim().length > 0) {
                addSelection(getOptByValue(query.value.trim()));
                query.value = '';
            } else if (!props.acceptInput) {
                query.value = '';
            }
        }
    }
    if (e.key == ',') {
        e.preventDefault()
        if (props.acceptInput && query.value.trim().length > 0) {
            e.preventDefault()
            addSelection(getOptByValue(query.value.trim().replace(',', '')));
            query.value = '';
        }
    }
    if (e.code == 'Backspace' && query.value.length === 0) {
        lastPoppedSelections.value.push(selection.value.pop()! as any);
    } else if (e.code == 'ArrowDown') {
        focusedRow.value = ((focusedRow.value ?? -1) + 1 + filteredOptions.value.length) % filteredOptions.value.length;
        scrollToFocusedRow();
    } else if (e.code == 'ArrowUp') {
        focusedRow.value = ((focusedRow.value ?? 0) - 1 + filteredOptions.value.length) % filteredOptions.value.length;
        scrollToFocusedRow();
    } else if (e.code == 'Enter' && focusedRow.value !== undefined) {
        addSelection(filteredOptions.value[focusedRow.value], true);
        query.value = '';
    }
}

const refFilters = ref<HTMLDivElement>();

function scrollToFocusedRow() {
    if (focusedRow.value === undefined) {
        refFilters.value?.scrollTo({top: 0, behavior: 'instant'})
        return;
    }
    const child = refFilters.value?.children[focusedRow.value] as HTMLElement

    if (!child) return;

    refFilters.value?.scrollTo({
        top: child.offsetTop - refFilters.value.clientHeight / 2,
        behavior: 'instant'
    })
}

function getText(opt: TOpt): any {
    return props.translate ? props.trFunc(opt.label) : opt.label;
}
</script>

<template>
    <div ref="refTopWrapper"
         :class="twMerge('text-xs', singleSelection ? '' : 'w-full', $attrs.class as any)"
         v-on-click-outside="onClickedOutside">
        <div
            :class="[
                {'ring-1': focused},
                twMerge(
                    'flex  items-center flex-1 flex-wrap py-0 form-control',
                    singleSelection ? 'flex-col relative justify-center pr-7' : 'px-1.5 justify-start gap-0.5',
                    wrapperClass
                )
            ]"
            @click.prevent="singleSelection && onFocusListener()"
            class="">
            <template v-for="(selectedVal) in selection">
                <div v-if="singleSelection" class="py-1.5 cursor-pointer flex justify-center">
                    {{ getText(getOptByValue(selectedVal)) }}
                    <i class="icon icon-mdi--chevron-down right-2 text-lg absolute pointer-events-none select-none"></i>
                </div>
                <div v-else class="alert alert-primary p-0 flex items-center cursor-pointer" @click="removeSelection(getOptByValue(selectedVal))">
                    <div class="pl-2 text-xs">
                        {{ getText(getOptByValue(selectedVal)) }}
                    </div>
                    <i class="icon icon-mdi--close text-xs mr-px dark:text-white"></i>
                </div>
            </template>
            <div class="flex-1 ">
                <input v-if="!singleSelection" type="text" v-model="query"
                       ref="refInput" :id="id"
                       :placeholder="selection.length ? '' : placeholder"
                       autocomplete="off"
                       class="ml-1 w-full border-0 bg-transparent text-sm focus:!border-0 focus:!outline-none focus:!ring-0 py-1 px-0">

                <div v-show="focused" class="fixed bg-card-visible z-30 w-full rounded-b-md font-medium"
                     :style="{
                            'left': (inputRect?.left ?? 0) + 'px',
                            'width': singleSelection ? 'auto' : (inputRect?.width ?? 0) + 'px'
                        }">
                    <div v-if="singleSelection" class="relative w-full flex items-center">
                        <input type="text" v-model="query"
                               ref="refInput" :id="id"
                               :placeholder="placeholder ?? __('search')"
                               autocomplete="off"
                               class="border border-x5 bg-x3 text-sm focus:border-x6 focus:ring-0 focus:outline-none py-1 px-2 w-full">
                        <i class="icon icon-mingcute--search-line opacity-80 right-2 text-lg absolute pointer-events-none select-none"></i>
                    </div>
                    <div ref="refFilters" class="border border-light max-h-[500px] overflow-y-auto">
                        <template v-for="(opt, index) in filteredOptions">
                            <span @click="addSelection(opt, !singleSelection)"
                                  class="list-group-item border-t px-2 py-1 border-light cursor-pointer rounded-none"
                                  :class="{
                                    'bg-indigo-300 dark:bg-indigo-900 hover:bg-indigo-300 hover:dark:bg-indigo-900': focusedRow === index,
                                    'hover:bg-x1': focusedRow !== index,
                                    'bg-green-300 dark:bg-green-900': singleSelection && selection.includes(opt.value),
                                }"
                            >
                                {{ getText(opt) }}
                            </span>
                        </template>
                        <template v-if="Object.keys(options).length === 0">
                            <div class="text-gray-500">
                                {{ trFunc('no_results') }}
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

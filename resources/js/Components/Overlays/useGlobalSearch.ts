import {computed, reactive, ref} from "vue";
import {useDebounceFn} from "@vueuse/core";
import {defineStore} from "pinia";
import TextInput from "@/Components/Form/TextInput.vue";
import {router} from "@inertiajs/vue3";
import {api} from "@/utils/api_helpers";
import {__} from "@/utils/localization";
import {arrToSelectOpts, uniqueId} from "@/utils/utils";
import {TSelectOption} from "@/utils/common_models";

type TSearchResult = Record<string, any>
export type TSearchResultSpecifics = Record<string, {
    route: string | ((t: TSearchResult) => string);
    labelProp?: string;
    ic: `icon-${string}`;
    match: (t: TSearchResult) => boolean;
    toText?: (t: TSearchResult) => string;
    selectLabel?: string;
}>;

export type TGlobalSearch = ReturnType<typeof useGlobalSearch>

export const refGlobalSearchInput = ref<InstanceType<typeof TextInput> | null>();
export const useGlobalSearch = defineStore('globalSearch', () => {
    const searchResultSpecifics = ref<TSearchResultSpecifics>({})
    const selectOptions = ref([] as TSelectOption[])
    const allRecentVisits = ref<TSearchResult[]>([]);

    const defaultOnSelected = (res: TSearchResult) => {
        for (const v of Object.values(searchResultSpecifics.value)) {
            if (v.match(res))
                return router.visit(typeof v.route === 'string' ? route(v.route, res.id) : v.route(res));
        }

        // fallback
        return router.visit(route('page.topic', res.id));
    };

    function setSearchResults(val?: TSearchResult[]) {
        _state.results = val;
        _state.resultsToShow = val == null ? [..._state.recentVisits] : [...(_state.results ?? [])];
    }

    async function searchInstant() {
        const q = _state.query;
        if (q.trim().length < _state.minQueryLength) {
            // _state.warningText = __('peyvdivherikem3tipbe');
            _state.warningText = __('type_at_least_X_characters').replace(':x', _state.minQueryLength.toString());
            return;
        }
        _state.warningText = '';
        return await api.get<TSearchResult[]>(route('api.search', {
            query: _state.query,
            include: _state.include,
        })).then((res) => {
            setSearchResults(res.data || []);
            _state.selectedRow = _state.searchPageUrl ? -1 : 0;
        }).catch(_ => [] as TSearchResult[]);
    }

    async function executeGlobalSearch() {
        const q = _state.query;
        if (q.trim().length == 0) {
            _state.warningText = '';
            setSearchResults(undefined);
            return;
        }
        if (q.length < 3) {
            await searchInstant();
        } else {
            await debouncedSearch();
        }
    }

    function goToSearchResult(res: TSearchResult) {
        if (!res) return;

        _state.onSelected(res);

        const existingIndex = allRecentVisits.value.findIndex(t => t.id == res.id && t.title == res.title);
        if (existingIndex > 0)
            allRecentVisits.value.splice(existingIndex, 1);
        if (existingIndex !== 0 && allRecentVisits.value.unshift(res) > 20)
            allRecentVisits.value.splice(20);
        localStorage.setItem('search_recent_visits', JSON.stringify(allRecentVisits.value));

        _state.show = false;
    }

    type TConfig = {
        onSelected?: typeof defaultOnSelected,
        include: string,
        readonlyInclude?: boolean,
    }

    function openSearchPopup(options?: TConfig) {
        if (options) {
            if (!options.include || Object.keys(selectOptions).findIndex(t => t !== options.include) == -1) {
                options.include = 'all';
            }
            if (options.onSelected)
                _state.onSelected = options.onSelected;
            _state.include = options.include;
            _state.readonlyInclude = options.readonlyInclude ?? false;
        }
        // _state.key = uniqueId();
        _state.show = true;
    }

    const _state = reactive({
        tag: uniqueId(),
        key: uniqueId(),
        _show: false,
        show: computed({
            get: (): boolean => _state._show,
            set: (val) => {
                if (_state._show !== val) {
                    _state._show = val;
                    if (val) {
                        setTimeout(() => refGlobalSearchInput.value?.focus(), 500);
                        setSearchResults(undefined);
                    } else {
                        setTimeout(() => {
                            _state.query = '';
                            setSearchResults(undefined);
                            _state.selectedRow = 0;
                            _state.readonlyInclude = false;
                            _state.onSelected = defaultOnSelected;
                        }, 500);
                    }
                } else {
                }
            }
        }),
        query: '',
        results: [] as TSearchResult[] | undefined,
        resultsToShow: [] as TSearchResult[],
        recentVisits: [] as TSearchResult[],
        selectedRow: -1,
        warningText: '',
        _include: 'all',
        include: computed<string>({
            get: () => _state._include,
            set: (newVal: string) => {
                _state._include = newVal;
                if (newVal == 'all') {
                    _state.recentVisits = allRecentVisits.value.slice(0, 9);
                } else {
                    _state.recentVisits = allRecentVisits.value
                        .filter(t => {
                            return Object.keys(searchResultSpecifics.value).some(key => {
                                return key == newVal && searchResultSpecifics.value[key].match(t);
                            })
                        })
                        .slice(0, 9);
                }
                executeGlobalSearch();
            },
        }),
        readonlyInclude: false,
        showSelect: false,
        minQueryLength: 1,
        searchDebounce: 500,
        searchPageUrl: undefined as undefined | ((query: string) => string),
        onSelected: defaultOnSelected,
    });

    const debouncedSearch = useDebounceFn(async () => {
        searchInstant()
    }, _state.searchDebounce);

    function getSearchResultIcon(res: TSearchResult) {
        return Object.values(searchResultSpecifics.value)
            .find(t => t.match(res))?.ic ?? '';
    }

    function getSearchResultText(res: TSearchResult) {
        const spec = Object.values(searchResultSpecifics.value).find(t => t.match(res))
        if (spec?.toText) {
            return spec.toText(res);
        }
        const val = res[spec?.labelProp ?? 'title'];
        return (typeof val == 'object' || ('tr' in res && res.tr)) ? __(val) : val;
    }

    return {
        state: _state,
        openSearchPopup,
        goToSearchResult,
        executeGlobalSearch,
        getSearchResultIcon,
        getSearchResultText,
        setSearchResults,
        selectOptions,
        allRecentVisits,
        searchResultSpecifics
    };
});

export function initGlobalSearch(opts: {
    searchResultSpecifics: TSearchResultSpecifics,
    dropdown: boolean,
    minQueryLength: number,
    searchDebounce?: number,
    searchPageUrl?: (query: string) => string,
}) {
    const globalSearch = useGlobalSearch((window as any).pinia);
    globalSearch.searchResultSpecifics = opts.searchResultSpecifics;
    globalSearch.selectOptions = [
        { value: 'all', label: 'all' },
        ...arrToSelectOpts(Object.keys(globalSearch.searchResultSpecifics), t => globalSearch.searchResultSpecifics[t].selectLabel ?? t)
    ]
    globalSearch.state.showSelect = opts.dropdown;
    globalSearch.state.minQueryLength = opts.minQueryLength;
    globalSearch.state.searchDebounce = opts.searchDebounce ?? 500;
    globalSearch.state.searchPageUrl = opts.searchPageUrl;

    globalSearch.allRecentVisits = JSON.parse(localStorage.getItem('search_recent_visits') ?? '[]') as TSearchResult[];
    // state.recentVisits = allRecentVisits.value.splice(0, 9)
    globalSearch.state.include = 'all';
    globalSearch.setSearchResults(undefined);
    document.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
            globalSearch.state.include = 'all';
            globalSearch.state.show = true;
        } else if (e.key == 'Escape')
            globalSearch.state.show = false;
    })
}

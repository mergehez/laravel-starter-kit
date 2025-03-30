import {computed, reactive, ref} from "vue";
import {defaultMediaLibraryConfig, defaultMediaLibraryConfigWithPdf, MediaLibraryConfig, SelectSizes as MediaLibrarySelectedImage} from "@/Components/MediaLibrary/media-library-types";

export const loc = ref('');

const globalState = reactive({
    initialize: () => {
        window.addEventListener('resize', () => {
            globalState.isMobile = window.innerWidth < 768;
        });
        globalState.isMobile = window.innerWidth < 768;
        globalState.hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || (navigator as any).msMaxTouchPoints > 0;
    },
    auth: {
        isCenterModelOpen: false,
        isNavModelOpen: false,
        openModal: (nav = false) => {
            globalState.auth.isCenterModelOpen = !nav;
            globalState.auth.isNavModelOpen = nav;
        },
        closeModal: () => {
            globalState.auth.isCenterModelOpen = false;
            globalState.auth.isNavModelOpen = false;
        }
    },
    isMobile: false,
    hasTouch: false,
    showNavDropdown: false,
    showNavAlphabet: false,
    mustRefreshPage: false,
    currentRoute: '',
    panelLang: computed({
        get: () => loc.value,
        set: (value) => {
            loc.value = value;
        }
    }),

    mediaLibrary: {
        visible: false,
        config: defaultMediaLibraryConfig,
        onSelect: (_: MediaLibrarySelectedImage) => {
        },
        open: (onSelect: (url: MediaLibrarySelectedImage) => void, config?: MediaLibraryConfig) => {
            globalState.mediaLibrary.visible = true;
            globalState.mediaLibrary.onSelect = onSelect;
            globalState.mediaLibrary.config = config ?? defaultMediaLibraryConfig;
        }
    },
    mediaLibraryWithPdf: {
        visible: false,
        config: defaultMediaLibraryConfigWithPdf,
        onSelect: (_: MediaLibrarySelectedImage) => {
        },
        open: (onSelect: (url: MediaLibrarySelectedImage) => void, config?: MediaLibraryConfig) => {
            globalState.mediaLibrary.onSelect = onSelect;
            globalState.mediaLibrary.config = config ?? defaultMediaLibraryConfigWithPdf;
            globalState.mediaLibrary.visible = true;
        }
    },
})

export default globalState;

import {computed, reactive, ref, unref, watch} from "vue";
import {useUrlSearchParams} from "@vueuse/core";
import {AxiosError, AxiosRequestConfig} from "axios";
import {defaultMediaLibraryConfig, Directory, FileInfo, MediaLibraryConfig} from "./media-library-types";
import {defineStore} from "pinia";
import {TCropperProps} from "../ImageCropper.vue";
import {api} from "@/utils/api_helpers";
import * as IM from "@/Components/MediaLibrary/media-library-types";
import {uniqueId} from "@/utils/utils";
import {TAlertSeverity} from "@/Components/Alert.vue";
import {toast} from "@/Components/Overlays/toast";


type TEndpoints = 'setup' | 'select-files' | 'upload-files' | 'create-folder' | 'delete-files' | 'delete-folder' | 'rename-file';

export function useMediaLibraryState(id: string, configGetter: () => MediaLibraryConfig | undefined, embed: boolean) {
    const urlParams = embed ? useUrlSearchParams() : undefined;

    function showMessage(severity: TAlertSeverity, message: string) {
        toast.show({
            message,
            severity,
            duration: 5000,
        })
    }

    return defineStore(id + uniqueId(), () => {
        const isReady = ref(false);
        const loading = ref(false);
        const config = configGetter() ?? defaultMediaLibraryConfig;
        const activeDirDirectory = ref<string>();
        const baseDirDirectory = ref<string>();
        const allDirectories = ref<Directory[]>([]);
        const activeFiles = ref<FileInfo[]>([]);
        const selectedPath = ref<string>();

        const selection = computed(() => activeFiles.value.find(f => f.path == selectedPath.value))
        const activeDir = computed(() => allDirectories.value.find(d => d.directory == activeDirDirectory.value))
        const baseDir = computed(() => allDirectories.value.find(d => d.directory == baseDirDirectory.value))

        async function apiPost<T>(endpoint: TEndpoints, data: FormData | Record<string, any>, axiosConfig?: AxiosRequestConfig) {
            const url = route(`arg-media-library.${endpoint}`);
            if (data instanceof FormData) {
                data.append('config', JSON.stringify(config));
            } else {
                data = {config: config, ...data};
            }
            try {
                loading.value = true;
                return await api.post<T>(url, data, axiosConfig);
            } finally {
                loading.value = false;
            }
        }

        function handleApiError(r: AxiosError, fallbackMessage?: string, duration = 5000) {
            toast.showFromAxiosError(r, fallbackMessage);
        }

        function getCurrentDirectory(): string | undefined {
            return activeDirDirectory.value ?? baseDirDirectory.value;
        }
        async function getDirectoryFiles(dir: IM.Directory) {
            try {
                let res = await apiPost<IM.SetupResponse>('setup', {
                    directory: dir.directory,
                    filesOnly: true,
                });
                const resFiles = res.data.files;
                dir.fileCount = resFiles.length;
                selectedPath.value = undefined;
                activeFiles.value = resFiles.sort((x, y) => x.time - y.time);
            } catch (e) {
                handleApiError(e as any, `Couldn't get the files for '${dir.directory}'`);
            }
        }

        async function updateDirsAndFiles(folder = ''){
            try {
                const directory = folder || urlParams?.dir as string || getCurrentDirectory() || config.baseDir;
                let {files, directories, base_dir, active_dir} = (await apiPost<IM.SetupResponse>('setup', {
                    directory: directory,
                    filesOnly: false,
                })).data;

                if (directories) {
                    allDirectories.value = directories.sort((x, y) => x.directory.localeCompare(y.directory));
                }

                // allDirectories.value = [base_dir].concat(directories).sort((x, y) => x.directory.localeCompare(y.directory));
                activeFiles.value = files.sort((x, y) => x.time - y.time)

                if (!baseDirDirectory.value) {
                    baseDirDirectory.value = base_dir;
                    if(baseDir.value)
                        baseDir.value.open = true
                }

                let dirDirectory = directory ?? baseDirDirectory.value!;
                activeDirDirectory.value ||= dirDirectory;
                const dir = allDirectories.value.find(d => d.directory == dirDirectory);
                if(dir)
                    dir.open = true;
            } catch (e) {
                handleApiError(e as any, 'Couldn\'t update media library!');
            }
        }

        return {
            isReady,
            loading,
            config,

            activeDir,
            baseDir,
            directories: allDirectories,
            selection,
            files: computed(() => activeFiles.value),
            showMessage,
            getCurrentDirectory,
            apiPost,
            getDirectoryFiles,
            updateDirsAndFiles,
            handleApiError,
            selectFile: (file: FileInfo|undefined) => {
                if (!file || file.path == selectedPath.value) {
                    selectedPath.value = undefined;
                } else {
                    selectedPath.value = file.path;
                }
            },
            changeActiveDirectory: (p: IM.Directory, callApi = true) => {
                if (urlParams) {
                    urlParams.dir = p.directory ?? '';
                }
                activeDirDirectory.value = p.directory;
                setTimeout(() => {
                    let d = activeDir.value;
                    while(d){
                        d.open = true;
                        d = allDirectories.value.find(x => x.directory == d?.parent);
                        if(!d)
                            break;
                    }
                    if(callApi)
                        getDirectoryFiles(p);
                }, 200)
            },
        }
    })()
}

export type MediaLibraryState = ReturnType<typeof useMediaLibraryState>;


export function useMediaLibraryUploadState(opts: {
    id: string,
    forcedName?: () => string,
    cropperProps?: Omit<TCropperProps, 'image' | 'width' | 'height'>,
    maxSize?: number,
    submit: (name: string, base64: string | File, ext: string) => void
}) {
    const {id, forcedName, cropperProps, maxSize, submit} = opts;
    // const uploadModalData = reactive({
    //     visible: false,
    //     file: undefined as File | undefined,
    //     fileAsStr: '',
    //     size: {width: 0, height: 0}
    // })
    return defineStore(id, () => {
        const visible = ref(false);
        const _file = ref<File | undefined>(undefined);
        const fileAsStr = ref('');
        const size = ref({width: 0, height: 0});

        function showModal(file: File, el?: HTMLImageElement, img?: HTMLImageElement) {
            _file.value = file;
            fileAsStr.value = img?.src ?? '';
            form.unrefFileAsStr = '' + unref(fileAsStr.value)
            originalName.value = file?.name.substring(0, file.name.lastIndexOf('.')) || ''
            size.value = {width: el?.width ?? 0, height: el?.height ?? 0};
            visible.value = true;
        }

        const originalName = ref(_file.value?.name.substring(0, _file.value.name.lastIndexOf('.')) || '')

        const form = reactive({
            name: computed({
                get: () => forcedName?.() || originalName.value,
                set: (v) => {
                    if (forcedName?.()) return;
                    return originalName.value = v;
                }
            }),
            unrefFileAsStr: '' + unref(fileAsStr.value),
            image: computed({
                get: () => fileAsStr.value,
                set: (v) => fileAsStr.value = v
            }),
            errors: {} as Record<'name' | 'image', string>
        })

        function _submit() {
            if (maxSize) {
                const sizeInBytes = new Blob([form.image!]).size
                console.log('size', sizeInBytes, maxSize)
                if (sizeInBytes > maxSize) {
                    form.errors.image = `File size is too big. Max size is ${(maxSize / 1024).toFixed(2)} KB but the file is ${(sizeInBytes / 1024).toFixed(2)} KB`
                    return false
                }
            }
            console.log('submitting', fileAsStr.value, _file.value)

            const ext = _file.value!.name.split('.').pop()
            submit(form.name, fileAsStr.value || _file.value!, ext!)
        }

        return {
            id,
            isVisible: computed(() => visible.value),
            close: () => visible.value = false,
            hasFile: computed(() => !!_file.value),
            canEditName: computed(() => !forcedName),
            fileAsStr,
            size,
            cropperProps,
            maxSize,
            form,
            originalName,
            showModal,
            submit: _submit,
        };
    })();
}

export type TUploadState = ReturnType<typeof useMediaLibraryUploadState>;
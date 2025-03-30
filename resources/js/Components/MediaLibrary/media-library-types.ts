export type ConfigSize = {
    /**
     * key or name of the size. e.g. 'Small' or 'Original'
     */
    name: string,
    /**
     * suffix to add to the filename. e.g. '-sm' for small images or '' for the original
     */
    nameSuffix: string,
    /**
     * between 0 and 100
     */
    scale: number,
    aspectRatio?: number,
    uploadConstraints?: {
        max: { width: number } | { height: number } | {
            width: number,
            height: number,
        }
    } | {
        required: {
            width: number,
            height: number,
        }
    },
}
export type MediaLibraryConfig = {
    forcedName?: () => string,
    baseDir: string,
    baseSize: ConfigSize,
    resizes: ConfigSize[],
    extensions: string[],
    // this updates 'selected' property in SelectFileResponse and returns true
    autoSizeSelector?: ((response: SelectFileResponse) => boolean) | undefined,
}

export type Directory = {
    readonly directory: string,
    readonly indent: number,
    readonly inner: Array<string>,
    readonly parent?: string,
    readonly pathinfo: {
        basename: string,
        dirname: string,
        filename: string,
    },
    open?: boolean,
    fileCount?: number,
}
export type SelectSizes = {
    readonly height: number,
    readonly width: number,
    readonly size: string,
    readonly url: string,
    readonly path: string,
}
export type SelectFileResponse = {
    // images: Array<{
    readonly fileNameNoSuffix: string,
    readonly aspectRatio: number,
    readonly select: SelectSizes,
    selected: string,
    readonly values: { [key: string]: SelectSizes },
    // }>,
}
export type FileInfo = {
    name: string,
    path: string,
    readonly time: number,
    readonly size: number,
    url: {
        [name: string]: string,
    }
}
export type SetupResponse = {
    readonly base_dir: string,
    readonly active_dir: string,
    readonly directories?: Array<Directory>,
    readonly files: Array<FileInfo>,
}


export const mediaLibraryDefaultSize = {name: 'Original', nameSuffix: '', aspectRatio: 1, scale: 100};

export const defaultMediaLibraryConfig: MediaLibraryConfig = {
    baseDir: 'uploads',
    baseSize: mediaLibraryDefaultSize,
    resizes: [],
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
}
export const defaultMediaLibraryConfigWithPdf: MediaLibraryConfig = {
    baseDir: 'uploads',
    baseSize: mediaLibraryDefaultSize,
    resizes: [],
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
}
export const defaultMediaLibraryConfigWithResizes: MediaLibraryConfig = {
    baseDir: 'uploads',
    baseSize: mediaLibraryDefaultSize,
    resizes: [
        {name: 'Large', nameSuffix: '-xl', scale: 125},
        {name: 'Medium', nameSuffix: '-md', scale: 75},
        {name: 'Small', nameSuffix: '-sm', scale: 50},
    ],
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
}
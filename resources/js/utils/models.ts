import {KeyValueKey, MenuItemType, PostStatus, PostType, UserRole} from "@/utils/generated_enums";
import {TrObj} from "@/utils/common_models";

export type TBaseModel = {
    id: number;
}
export type TModelWithTitle = TBaseModel & {
    title?: TrObj | string;
    name?: TrObj | string;
    created_at: number;
    updated_at: number;
}

export type TUser = {
    id: number;
    name: string;
    email: string;
    role: UserRole
    created_at: number;
    updated_at: number;
    active: boolean;
}

export type TPost = {
    id: number;
    title: TrObj;
    content: TrObj;
    // content_tiptap: object;
    slug: string;
    image_url?: string;
    status: PostStatus;
    type: PostType;
    created_at: number;
    updated_at: number;
    published_at?: number;
    seo_id: number;
    views: number;
    excerpt: TrObj;
    tags: TrObj[];

    seo?: TSeo;

    // debug
    contentOriginal?: string;
}

export type TSliderItem = {
    id: number;
    title: TrObj;
    subtitle: TrObj;
    image_url: string;
    url: string;
    sequence: number;
    is_active: boolean;
    slider_id: number;
    text_color: string;
    bg_color: string;

    created_at: number;
    updated_at: number;
}

export type TSlider = {
    id: number;
    title: TrObj;
    created_at: number;
    updated_at: number;

    items: TSliderItem[];
}


export type TMenu = {
    id: number;
    title: TrObj;
    created_at: number;
    updated_at: number;

    items: TMenuItem[];
}

export type TMenuItem = {
    id: number;
    type: MenuItemType;
    title: TrObj;
    url?: string;
    post_id?: number;
    sequence: number;
    menu_id: number;
    created_at: number;
    updated_at: number;

    post?: TPost;
}

export type TKeyVal = {
    key: KeyValueKey;
    value: string;

    created_at: number;
    updated_at: number;
}

export type TSeo = {
    id: number;
    title: TrObj;
    description: TrObj;
    keywords: TrObj;
    image_url: string;
    created_at: number;
    updated_at: number;
}
import {TModelForm} from "@/utils/common_models";
import {TPost} from "@/utils/models";
import {PostStatus, PostType} from "@/utils/generated_enums";
import {_createFormState, TCreateFormStateOpts} from "@/utils/form_helpers";
import {__} from "@/utils/localization";
import {cloneTrObj} from "@/utils/utils";

export type TPostForm = TModelForm<TPost>;

export function createPostForm(type: PostType, opts?: TCreateFormStateOpts<TPost, TPostForm>) {
    return _createFormState(
        opts,
        (post?: TPost) => {
            let tags: any = post?.tags || [];
            for (let i = 0; i < tags.length; i++) {
                if (typeof tags[i] === 'string') {
                    if (tags[i].startsWith('[') && tags[i].endsWith(']')) {
                        try {
                            tags[i] = JSON.parse(tags[i]);
                        } catch (e) {
                            tags[i] = [];
                        }
                    } else {
                        tags[i] = tags[i].split(',').map((tag: string) => tag.trim());
                    }
                }
            }
            const res: TPostForm = {
                id: post?.id || 0,
                title: cloneTrObj(post?.title),
                content: cloneTrObj(post?.content),
                status: post?.status || PostStatus.draft,
                type: post?.type || type,
                image_url: post?.image_url || '',
                slug: post?.slug || '',
                seo_id: post?.seo_id || 0,
                views: post?.views || 0,
                excerpt: cloneTrObj(post?.excerpt),
                tags: tags,
                // content_tiptap: post?.content_tiptap || {},
                seo: {
                    id: post?.seo_id || 0,
                    title: cloneTrObj(post?.seo?.title),
                    description: cloneTrObj(post?.seo?.description),
                    keywords: cloneTrObj(post?.seo?.keywords),
                    image_url: post?.seo?.image_url || '',
                    created_at: post?.seo?.created_at || 0,
                    updated_at: post?.seo?.updated_at || 0,
                },
            };

            return res;
        },
        route('api.posts.store')
    );
}


export function getPostStatusOptions(post: { published_at?: number }) {
    const opts = [
        { value: PostStatus.draft, label: __('draft') },
        { value: PostStatus.published, label: __('published') },
    ]

    if (post.published_at) {
        opts.push({ value: PostStatus.archived, label: __('archived') });
    }

    return opts;
}
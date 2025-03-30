import {TModelForm} from "@/utils/common_models";
import {TMenu, TMenuItem} from "@/utils/models";
import {_createFormState, TCreateFormStateOpts} from "@/utils/form_helpers";
import {MenuItemType} from "@/utils/generated_enums";
import {cloneTrObj} from "@/utils/utils";

export type TMenuForm = TModelForm<TMenu>;
export type TMenuItemForm = TModelForm<TMenuItem>;
export function createMenuForm(opts?: TCreateFormStateOpts<TMenu, TMenuForm>) {
    return _createFormState(
        opts,
        (item) => {
            const res: TMenuForm = {
                id: item?.id || 0,
                title: cloneTrObj(item?.title),
                items: [],
            };

            return res;
        }, route('api.menus.store')
    );
}

export function createMenuItemForm(menu: TMenu, type: MenuItemType, opts?: TCreateFormStateOpts<TMenuItem, TMenuItemForm>) {
    return _createFormState(
        opts,
        (item) => {
            const res: TMenuItemForm = {
                id: item?.id || 0,
                type: item?.type || type,
                title: cloneTrObj(item?.title),
                url: item?.url || '',
                post_id: item?.post_id || undefined,
                sequence: item?.sequence || menu.items.reduce((max, i) => Math.max(max, i.sequence), 0) + 1,
                menu_id: item?.menu_id || menu.id,
            };

            return res;
        }, route('api.menu_items.store')
    );
}
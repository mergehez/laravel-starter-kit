import {TModelForm} from "@/utils/common_models";
import {TSlider, TSliderItem} from "@/utils/models";
import {_createFormState, TCreateFormStateOpts} from "@/utils/form_helpers";
import {cloneTrObj} from "@/utils/utils";


export type TSliderForm = TModelForm<TSlider>;
export type TSliderItemForm = TModelForm<TSliderItem>;

export function createSliderForm(opts?: TCreateFormStateOpts<TSlider, TSliderForm>) {
    return _createFormState(
        opts,
        (item) => {
            const res: TSliderForm = {
                id: item?.id || 0,
                title: cloneTrObj(item?.title),
                items: [],
            };

            return res;
        }, route('api.sliders.store')
    );
}

export function createSliderItemForm(slider: TSlider, opts?: TCreateFormStateOpts<TSliderItem, TSliderItemForm>) {
    return _createFormState(
        opts,
        (item) => {
            const res: TSliderItemForm = {
                id: item?.id || 0,
                title: cloneTrObj(item?.title),
                subtitle: cloneTrObj(item?.subtitle),
                sequence: item?.sequence || slider.items.reduce((max, i) => Math.max(max, i.sequence), 0) + 1,
                slider_id: item?.slider_id || slider.id,
                url: item?.url || '',
                image_url: item?.image_url || '',
                text_color: item?.text_color || '',
                bg_color: item?.bg_color || '',
                is_active: item?.is_active || true
            };

            return res;
        }, route('api.slider_items.store')
    );
}
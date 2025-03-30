import {TModelForm} from "@/utils/common_models";
import {TUser, TUser as TModel} from "@/utils/models";
import {UserRole} from "@/utils/generated_enums";
import {_createFormState, TCreateFormStateOpts} from "@/utils/form_helpers";
import {api} from "@/utils/api_helpers";

export type TUserForm = TModelForm<TModel> & { password: string, password_confirmation: string };

export function createUserForm(opts?: TCreateFormStateOpts<TModel, TUserForm>) {
    return _createFormState(
        opts,
        (item) => {
            const res: TUserForm = {
                id: item?.id || 0,
                name: item?.name || '',
                email: item?.email || '',
                role: item?.role || UserRole.editor,
                active: item?.active || false,
                password: '',
                password_confirmation: '',
            };

            return res;
        }, route('api.users.store')
    );
}

type TPwd = {
    id: number;
    old_password?: '',
    password?: '',
    password_confirmation?: ''
}
type TPwdForm = TModelForm<TPwd>

export function createPasswordForm(opts?: TCreateFormStateOpts<TUser, TPwdForm>) {
    return _createFormState(
        opts,
        (_) => {
            const res: TPwdForm = {
                id: 1,
                old_password: '',
                password: '',
                password_confirmation: '',
            };

            return res;
        }, async (isPost, data, original) => {
            return (await api.put<TUser>(route('api.users.password.update', original!.id), data)).data;
        }
    );
}
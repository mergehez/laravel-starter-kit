import axios, {AxiosRequestConfig as AxiosConfig, AxiosResponse, AxiosResponseHeaders, InternalAxiosRequestConfig, RawAxiosResponseHeaders} from "axios";
import {usePage} from "@/utils/inertia";

type Response<T> = {
    data: T;
    status: number;
    statusText: string;
    headers: RawAxiosResponseHeaders | AxiosResponseHeaders;
    config: InternalAxiosRequestConfig<any>;
    request?: any;
}
export const api = {
    request: async <T = any>(config: AxiosConfig): Promise<Response<T>> => {
        return await axios.request<T>(config);
    },
    get: <T = any>(url: string, config?: AxiosConfig) => api.request<T>({method: 'get', url, ...config}),
    post: <T = any>(url: string, data?: any, config?: AxiosConfig) => api.request<T>({method: 'post', url, data, ...config}),
    put: <T = any>(url: string, data?: any, config?: AxiosConfig) => api.request<T>({method: 'put', url, data, ...config}),
    delete: <T = any>(url: string, config?: AxiosConfig) => api.request<T>({method: 'delete', url, ...config}),
    logout: async (then?: any) => {
        await api.post(route('auth.logout'));
        // globalState.activity.stopListeners();
        const auth = usePage().props.auth
        if(auth)
            auth.user = undefined;
        if (then) then();
    },
    changeLanguage: (langKey: string) => {
        api.get(route('language', {language: langKey})).then();
        usePage().props.localization.locale = langKey;
    },
    // logout:  () => router.post(route('logout'), null, {onFinish: globalState.removeAuthListener}),
}
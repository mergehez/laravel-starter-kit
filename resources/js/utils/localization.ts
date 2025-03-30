import {translations} from "@/utils/translations";
import {usePage} from "@/utils/inertia";
import {TrObj} from "@/utils/common_models";
import {localeNames} from "@/utils/constants";

export type TrKey = keyof typeof translations;


let page: ReturnType<typeof usePage>;
export function __(
    key: TrKey|TrObj|undefined,
    replace?: Record<string, any> | undefined,
    fallbackLocale: string = 'en',
): string {
    if(!key)
        return '';

    page ??= usePage()

    if (typeof key === 'number') key = (key as any).toString();
    if (!key) return '';

    const currLocale = page.props?.localization.locale;

    if (typeof key !== 'string') {
        if(typeof key === 'object' && currLocale in key) {
            return key[currLocale] || key[fallbackLocale] || '';
        }
        console.error('Key is not a string', key);
        return '';
    }

    const trimmedKey = key.trim() as TrKey;
    if (!(trimmedKey in translations)) {
        return trimmedKey;
    }

    const translationObj = translations[trimmedKey] as any
    let translation = translationObj[currLocale] || (fallbackLocale && translationObj[fallbackLocale]) || trimmedKey;

    if (replace) {
        Object.keys(replace).forEach((replaceKey) => {
            translation = translation.replace(new RegExp(replaceKey, 'g'), replace[replaceKey]);
        });
    }

    return translation;
}

export function __ToTrObj(key: TrKey & string){
    const obj = translations[key] as any;
    return {
        de: obj?.de ?? '',
        tr: obj?.tr ?? '',
        kmr: obj?.kmr ?? '',
        en: obj?.en ?? '',
    } satisfies Record<keyof typeof localeNames, string> satisfies TrObj
}

import _dayjsOriginal, { type Dayjs } from 'dayjs'
import _dayJsIsoWeek from 'dayjs/plugin/isoWeek'
import _dayJsUtc from 'dayjs/plugin/utc'
import _dayJsTimezone from 'dayjs/plugin/timezone'
import {__} from "@/utils/localization";

_dayjsOriginal.extend(_dayJsIsoWeek);
_dayjsOriginal.extend(_dayJsUtc);
_dayjsOriginal.extend(_dayJsTimezone);
_dayjsOriginal.tz.setDefault("Etc/GMT");
export const dayjs = _dayjsOriginal.utc

type DtInput = Date | string | Dayjs | number
export const dt = {
    toStringDate: (date: DtInput) => dayjs(date).format('DD.MM.YYYY'),
    toDate: (date: string) => dayjs(date).toDate(),
    toStringDateWithWeekDay: (date: DtInput) => {
        const djs = dayjs(date)
        return __(djs.format('dd').toLowerCase() as any) + ' ' + djs.format('DD.MM.YYYY')
    },
    toString: function (date?: DtInput) {
        if(!date) return '';
        return dayjs(date).format('DD.MM.YYYY HH:mm')
    },
    toStringFromString: (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm'),
    toIsoStringForApi: (date: DtInput) => dayjs(date).toISOString(),
    monthDiff: (date1: DtInput, date2: Date | string) => {
        return Math.round(dayjs(date1).diff(dayjs(date2), 'month', true))
    },
    asDayjs: (date: DtInput) => {
        return dayjs(date);
    },
    part: (date: DtInput, unit: _dayjsOriginal.UnitType) => {
        return dayjs(date).get(unit)
    },
    diff: (date: DtInput, date2: DtInput, unit: _dayjsOriginal.UnitType) => {
        return dayjs(date).diff(dayjs(date2), unit)
    },
    from: (date: DtInput) => {
        return dayjs(date);
    },
    max: (date: DtInput, date2: DtInput) => {
        const d1 = dayjs(date),
            d2 = dayjs(date2)
        return d1.isAfter(d2) ? d1 : d2
    },
    min: (date: DtInput, date2: DtInput) => {
        const d1 = dayjs(date),
            d2 = dayjs(date2)
        return d1.isBefore(d2) ? d1 : d2
    },
    minMax: (date: DtInput, min: DtInput, max: DtInput) => {
        const d = dayjs(date),
            minD = dayjs(min),
            maxD = dayjs(max)
        return d.isBefore(minD) ? minD : d.isAfter(maxD) ? maxD : d
    },
    isBetween: (date: DtInput, min: DtInput, max: DtInput) => {
        const d = dayjs(date),
            minD = dayjs(min),
            maxD = dayjs(max)
        return (d.isAfter(minD, 'date') && d.isBefore(maxD, 'date')) || d.isSame(minD, 'date') || d.isSame(maxD, 'date')
    },
}
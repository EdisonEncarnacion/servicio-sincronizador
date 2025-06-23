import { DateTime } from 'luxon';

const TIMEZONE = 'America/Lima';

export function getStartOfDay(date: string | Date): Date {
    return DateTime.fromISO(String(date)).startOf('day').toJSDate();
}
export function getEndOfDay(date: string | Date): Date {
    const dateTime = typeof date === 'string'
        ? DateTime.fromISO(date)
        : DateTime.fromJSDate(date);

    if (!dateTime.isValid) {
        throw new Error(`Invalid date provided: ${date}`);
    }
    return dateTime.endOf('day').toJSDate();
}
export function getCurrentDate() {
    return DateTime.now().setZone(TIMEZONE);
}
export function getCurrentTime(): string {
    return DateTime.now().setZone(TIMEZONE).toFormat('HH:mm:ss');
}
export function getNowTimestamp(): string {
    return DateTime.utc().setZone(TIMEZONE).toFormat('yyyy-MM-dd HH:mm:ss.SSS');
}
export function getNow(): Date {
    return DateTime.now().setZone(TIMEZONE).toJSDate();
}

import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from 'adhan';

export interface JadwalSholat {
    Fajr: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
    [key: string]: string;
}

export function getPrayerTimes(lat: number, lng: number, date: Date = new Date()): JadwalSholat {
    const coordinates = new Coordinates(lat, lng);

    // Konfigurasi Kemenag RI
    // Fajr: 20 degrees, Isha: 18 degrees
    const params = CalculationMethod.Singapore(); // Singapore uses 20/18 usually, close to Indonesia
    params.fajrAngle = 20;
    params.ishaAngle = 18;
    params.madhab = Madhab.Shafi;

    const prayerTimes = new PrayerTimes(coordinates, date, params);

    // Helper to add ihtiyat (safety margin) +2 minutes and format
    const formatTime = (time: Date) => {
        // Clone date to avoid mutation if library reuses refs (safety)
        const t = new Date(time.getTime());
        // Add 2 minutes Ihtiyat
        t.setMinutes(t.getMinutes() + 2);

        // Format to HH:mm (WIB/Local)
        return t.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).replace('.', ':'); // Ensure colon separator
    };

    return {
        Fajr: formatTime(prayerTimes.fajr),
        Dhuhr: formatTime(prayerTimes.dhuhr),
        Asr: formatTime(prayerTimes.asr),
        Maghrib: formatTime(prayerTimes.maghrib),
        Isha: formatTime(prayerTimes.isha),
    };
}

export function getHijriDate(date: Date = new Date()): string {
    return new Intl.DateTimeFormat('id-ID', {
        calendar: 'islamic',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date);
}

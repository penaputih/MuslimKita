import { Preferences } from '@capacitor/preferences';

const CACHE_PREFIX = 'api_cache_';
const TTL_SurahList = 7 * 24 * 60 * 60 * 1000; // 7 days
const TTL_SurahDetail = 30 * 24 * 60 * 60 * 1000; // 30 days (text rarely changes)
const TTL_Doa = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

export async function fetchWithCache<T>(url: string, ttl: number = 86400000): Promise<T> {
    const key = CACHE_PREFIX + url;

    // Network First Strategy
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Network response was not ok: ${res.status}`);
        const data = await res.json();

        // Save to cache (fire and forget / await)
        await saveData(key, data);

        return data;
    } catch (networkError) {
        console.warn(`Network failed for ${url}, trying cache...`, networkError);

        // Fallback to Cache
        const cached = await getData<T>(key);
        if (cached) {
            return cached;
        }

        throw networkError; // Re-throw if no cache available
    }
}

async function saveData<T>(key: string, data: T) {
    try {
        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
        };
        await Preferences.set({
            key,
            value: JSON.stringify(entry),
        });
    } catch (e) {
        console.error('Failed to save to cache', e);
    }
}

async function getData<T>(key: string): Promise<T | null> {
    try {
        const { value } = await Preferences.get({ key });
        if (!value) return null;

        const entry = JSON.parse(value) as CacheEntry<T>;
        return entry.data;
    } catch (e) {
        console.error('Failed to read from cache', e);
        return null;
    }
}

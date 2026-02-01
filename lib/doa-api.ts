
export interface DoaItem {
    id: string | number;
    doa: string;
    ayat: string;
    artinya: string;
}

// Direct API URL
const API_BASE_URL = "https://equran.id/api/doa";

import { fetchWithCache } from './cache-manager';

export async function getDoaList(): Promise<DoaItem[]> {
    try {
        const response = await fetchWithCache<any>(API_BASE_URL);
        const data = response.data || response; // Handle wrapper if exists

        // Data from equran.id usually comes as array of objects
        // Structure: { id, nama, ar, tr, idn }
        return Array.isArray(data) ? data.map((item: any) => ({
            id: item.id,
            doa: item.nama,
            ayat: item.ar,
            artinya: item.idn
        })) : [];
    } catch (error) {
        console.error("Error fetching doa:", error);
        return [];
    }
}

export async function getDoaDetail(id: string): Promise<DoaItem | null> {
    try {
        // Fetch list and find (since detail endpoint might differ or require diff proxy)
        // Check if endpoint supports ID directly: /proxy/equran/doa/{id}
        const res = await fetch(`${API_BASE_URL}/${id}`);
        if (res.ok) {
            const item = await res.json();
            return {
                id: item.id,
                doa: item.nama,
                ayat: item.ar,
                artinya: item.idn
            };
        }

        // Fallback to list filter
        const list = await getDoaList();
        return list.find((d) => String(d.id) === String(id)) || null;

    } catch (error) {
        console.error("Error fetching doa detail:", error);
        return null;
    }
}

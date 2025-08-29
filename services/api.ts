import type { SurahReference, SurahDetail, Edition, TafsirInfo, TafsirContent, RadioStation, SearchResult, SurahTafsir, AyahTafsir } from '../types';

const ALQURAN_CLOUD_API = 'https://api.alquran.cloud/v1';
const TAFSIR_API = 'https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir';
const MP3QURAN_API = 'https://mp3quran.net/api/v3';

export async function getSurahs(): Promise<SurahReference[]> {
  try {
    const response = await fetch(`${ALQURAN_CLOUD_API}/surah`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Failed to fetch surahs:", error);
    return [];
  }
}

export async function getMergedSurahData(surahNumber: number, audioEditionIdentifier: string): Promise<SurahDetail | null> {
    try {
        const response = await fetch(`${ALQURAN_CLOUD_API}/surah/${surahNumber}/editions/quran-uthmani,${audioEditionIdentifier}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        if (data.code === 200 && data.data.length === 2) {
            const textSurah = data.data[0];
            const audioSurah = data.data[1];
            
            const mergedAyahs = textSurah.ayahs.map((ayah: any, index: number) => ({
                ...ayah,
                audio: audioSurah.ayahs[index].audio,
            }));

            return { ...textSurah, ayahs: mergedAyahs };
        }
        return null;
    } catch (error) {
        console.error(`Failed to fetch merged surah data for ${surahNumber}:`, error);
        return null;
    }
}

export async function searchQuran(query: string): Promise<SearchResult | null> {
    if (!query) return null;
    try {
        const response = await fetch(`${ALQURAN_CLOUD_API}/search/${encodeURIComponent(query)}/all/quran-uthmani`);
        // FIX: Corrected a typo in the response check from `response.,ok` to `response.ok`.
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        if (data.code === 200) {
            return data.data;
        }
        return null;
    } catch (error) {
        console.error("Failed to perform Quran search:", error);
        return null;
    }
}


export async function getAudioEditions(): Promise<Edition[]> {
    try {
        const response = await fetch(`${ALQURAN_CLOUD_API}/edition/format/audio`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error("Failed to fetch audio editions:", error);
        return [];
    }
}

export async function getRadios(): Promise<RadioStation[]> {
    try {
        const response = await fetch(`${MP3QURAN_API}/radios`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        // The API returns an object with a 'radios' property which is an array
        return data.radios.map((station: any): RadioStation => ({
            id: station.id,
            name: station.name,
            url: station.url,
        }));
    } catch (error) {
        console.error("Failed to fetch radios:", error);
        return [];
    }
}

export async function getTafsirs(): Promise<TafsirInfo[]> {
    try {
        const response = await fetch(`${TAFSIR_API}/editions.json`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch tafsirs:", error);
        return [];
    }
}

export async function getTafsirForAyah(tafsirSlug: string, surahNumber: number, ayahNumber: number): Promise<TafsirContent | null> {
    try {
        const response = await fetch(`${TAFSIR_API}/${tafsirSlug}/${surahNumber}/${ayahNumber}.json`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return { text: data.text };
    } catch (error) {
        console.error(`Failed to fetch tafsir for ayah ${surahNumber}:${ayahNumber}:`, error);
        return null;
    }
}

export async function getTafsirForSurah(tafsirSlug: string, surahNumber: number): Promise<SurahTafsir | null> {
    try {
        const response = await fetch(`${TAFSIR_API}/${tafsirSlug}/${surahNumber}.json`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        const ayahs: AyahTafsir[] = (data.text && typeof data.text === 'object')
            ? Object.entries(data.text).map(([ayahNum, text]) => ({
                ayahInSurah: parseInt(ayahNum, 10),
                text: text as string,
            }))
            : [];

        return {
            tafsirId: data.tafsir_id,
            tafsirName: data.tafsir_name,
            surahId: data.surah_id,
            surahName: data.surah_name,
            ayahs: ayahs,
        };
    } catch (error) {
        console.error(`Failed to fetch tafsir for surah ${surahNumber}:`, error);
        return null;
    }
}

export async function getStats(): Promise<any> {
    try {
        const response = await fetch(`${ALQURAN_CLOUD_API}/meta`);
        if(!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error("Failed to fetch stats:", error);
        return null;
    }
}
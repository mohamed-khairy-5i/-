export interface SurahReference {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: 'Meccan' | 'Medinan';
  numberOfAyahs: number;
}

export interface Ayah {
  number: number;
  audio: string;
  audioSecondary?: string[];
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
}

export interface SurahDetail extends SurahReference {
  ayahs: Ayah[];
}

export interface Edition {
    identifier: string;
    language: string;
    name: string;
    englishName: string;
    format: string;
    type: string;
    direction: 'ltr' | 'rtl' | null;
}

export interface RadioStation {
    id: number;
    name: string;
    url: string;
}

export interface TafsirInfo {
    slug: string;
    name: string;
    author: string;
    language: string;
}

export interface TafsirContent {
    text: string;
}

export interface FavoriteAyah {
    surahNumber: number;
    surahName: string;
    ayahNumber: number;
    text: string;
}

export interface AppSettings {
    fontSize: number;
    defaultReciterIdentifier: string;
}

export interface SearchResultMatch {
    number: number;
    text: string;
    surah: SurahReference;
    numberInSurah: number;
}

export interface SearchResult {
    count: number;
    matches: SearchResultMatch[];
}

export interface AyahTafsir {
    ayahInSurah: number;
    text: string;
}

export interface SurahTafsir {
    tafsirId: number;
    tafsirName: string;
    surahId: number;
    surahName: string;
    ayahs: AyahTafsir[];
}
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getTafsirForSurah, getSurahs, getMergedSurahData } from '../services/api';
import type { SurahTafsir, SurahReference, Ayah } from '../types';
import Spinner from '../components/Spinner';

interface MergedAyahTafsir {
    numberInSurah: number;
    ayahText: string;
    tafsirText: string;
}

const TafsirDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [surahs, setSurahs] = useState<SurahReference[]>([]);
    const [selectedSurah, setSelectedSurah] = useState<string>('1');
    const [tafsirData, setTafsirData] = useState<SurahTafsir | null>(null);
    const [mergedData, setMergedData] = useState<MergedAyahTafsir[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            const surahsList = await getSurahs();
            setSurahs(surahsList);
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (!slug || !selectedSurah) return;

        const fetchData = async () => {
            setLoading(true);
            setMergedData([]);
            
            const surahNum = parseInt(selectedSurah, 10);
            
            const [tafsirRes, surahRes] = await Promise.all([
                getTafsirForSurah(slug, surahNum),
                getMergedSurahData(surahNum, 'ar.alafasy') 
            ]);

            if (tafsirRes && surahRes) {
                setTafsirData(tafsirRes);

                const merged = surahRes.ayahs.map(ayah => {
                    const tafsirForAyah = tafsirRes.ayahs.find(t => t.ayahInSurah === ayah.numberInSurah);
                    return {
                        numberInSurah: ayah.numberInSurah,
                        ayahText: ayah.text,
                        tafsirText: tafsirForAyah ? tafsirForAyah.text : 'التفسير غير متوفر لهذه الآية.',
                    };
                });
                setMergedData(merged);
            }
            
            setLoading(false);
        };

        fetchData();
    }, [slug, selectedSurah]);
    
    const selectedSurahInfo = surahs.find(s => s.number.toString() === selectedSurah);

    return (
        <div className="container mx-auto p-4 animate-fade-in">
            <header className="py-6 text-center space-y-4">
                <h1 className="text-4xl font-bold font-amiri-quran text-yellow-400">{tafsirData?.tafsirName || 'عرض التفسير'}</h1>
                {selectedSurahInfo && <p className="text-2xl text-gray-300">سورة {selectedSurahInfo.name}</p>}
            </header>
            
            <div className="sticky top-0 bg-gray-900 py-4 z-10 mb-6">
                <label htmlFor="surah-select" className="block mb-2 text-sm font-medium text-gray-300">اختر السورة:</label>
                <select
                    id="surah-select"
                    value={selectedSurah}
                    onChange={(e) => setSelectedSurah(e.target.value)}
                    className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5"
                >
                    {surahs.map(surah => (
                        <option key={surah.number} value={surah.number}>{surah.number}. {surah.name} ({surah.englishName})</option>
                    ))}
                </select>
            </div>

            {loading ? <Spinner /> : (
                <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 space-y-6">
                    {mergedData.map(item => (
                        <div key={item.numberInSurah} className="border-b border-gray-700 pb-4 last:border-b-0">
                            <p className="font-amiri-quran text-2xl text-right leading-loose mb-3">
                                {item.ayahText} <span className="text-yellow-400 text-lg font-sans">({item.numberInSurah})</span>
                            </p>
                            <p className="text-gray-300 whitespace-pre-wrap">{item.tafsirText}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TafsirDetailPage;
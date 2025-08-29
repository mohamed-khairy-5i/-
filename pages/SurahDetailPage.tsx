import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { getMergedSurahData, getTafsirForAyah, getTafsirs } from '../services/api';
import type { SurahDetail, Ayah, FavoriteAyah, TafsirContent, TafsirInfo } from '../types';
import Spinner from '../components/Spinner';
import { PlayIcon, StarIcon } from '../components/icons';
import useLocalStorage from '../hooks/useLocalStorage';
import { AppContext } from '../App';

interface AyahListItemProps {
    ayah: Ayah;
    surah: SurahDetail;
    isPlaying: boolean;
    isFavorite: boolean;
    onPlay: (ayah: Ayah) => void;
    onToggleFavorite: (ayah: Ayah) => void;
    fontSize: number;
    selectedTafsirSlug: string;
}

const AyahListItem: React.FC<AyahListItemProps> = ({ ayah, surah, isPlaying, isFavorite, onPlay, onToggleFavorite, fontSize, selectedTafsirSlug }) => {
    const [tafsir, setTafsir] = useState<TafsirContent | null>(null);
    const [showTafsir, setShowTafsir] = useState(false);
    const [isLoadingTafsir, setIsLoadingTafsir] = useState(false);

    const handleShowTafsir = async () => {
        if (!showTafsir) {
            setIsLoadingTafsir(true);
            const tafsirData = await getTafsirForAyah(selectedTafsirSlug, surah.number, ayah.numberInSurah);
            setTafsir(tafsirData);
            setIsLoadingTafsir(false);
        }
        setShowTafsir(!showTafsir);
    };
    
    useEffect(() => {
        // If tafsir is shown and user changes selection, refetch
        if (showTafsir) {
            const fetchTafsir = async () => {
                setIsLoadingTafsir(true);
                const tafsirData = await getTafsirForAyah(selectedTafsirSlug, surah.number, ayah.numberInSurah);
                setTafsir(tafsirData);
                setIsLoadingTafsir(false);
            };
            fetchTafsir();
        }
    }, [selectedTafsirSlug, showTafsir, surah.number, ayah.numberInSurah]);


    return (
        <div className="p-4 border-b border-gray-700 group">
            <p 
                className="font-amiri-quran text-right leading-loose mb-4 transition-colors duration-300 group-hover:text-yellow-100"
                style={{ fontSize: `${fontSize}px`}}
            >
                {ayah.text}
                <span className="text-yellow-400 text-lg mr-2 font-sans">({ayah.numberInSurah})</span>
            </p>
            <div className="flex items-center gap-4 flex-wrap">
                <button onClick={() => onPlay(ayah)} className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors">
                    <PlayIcon className={`w-5 h-5 ${isPlaying ? 'text-yellow-400' : ''}`} />
                    <span>{isPlaying ? 'تشغيل' : 'استماع'}</span>
                </button>
                <button onClick={() => onToggleFavorite(ayah)} className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors">
                    <StarIcon className={`w-5 h-5 ${isFavorite ? 'text-yellow-400' : ''}`} />
                    <span>{isFavorite ? 'في المفضلة' : 'إضافة للمفضلة'}</span>
                </button>
                <button onClick={handleShowTafsir} className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors">
                    <span>{showTafsir ? 'إخفاء التفسير' : 'عرض التفسير'}</span>
                </button>
            </div>
            {showTafsir && (
                <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border-r-4 border-yellow-400">
                    {isLoadingTafsir ? <Spinner /> : <p className="text-gray-300 whitespace-pre-wrap">{tafsir?.text}</p>}
                </div>
            )}
        </div>
    );
};


const SurahDetailPage: React.FC = () => {
  const { number } = useParams<{ number: string }>();
  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { setAudioSrc, setIsPlaying, setCurrentlyPlaying, currentlyPlaying, settings } = useContext(AppContext);
  const [favorites, setFavorites] = useLocalStorage<FavoriteAyah[]>('favorites:verses', []);
  const [tafsirs, setTafsirs] = useState<TafsirInfo[]>([]);
  const [selectedTafsirSlug, setSelectedTafsirSlug] = useState<string>('ar-tafsir-muyassar'); // Default to "Tafsir Al-Muyassar"

  useEffect(() => {
    const fetchSurah = async () => {
      if (number) {
        setLoading(true);
        const surahData = await getMergedSurahData(parseInt(number, 10), settings.defaultReciterIdentifier);
        setSurah(surahData);
        setLoading(false);
      }
    };
    const fetchTafsirs = async () => {
        const tafsirsData = await getTafsirs();
        setTafsirs(tafsirsData);
    };

    fetchSurah();
    fetchTafsirs();
  }, [number, settings.defaultReciterIdentifier]);

  const handlePlay = useCallback((ayah: Ayah) => {
    if (surah) {
        setAudioSrc(ayah.audio);
        setCurrentlyPlaying({ type: 'ayah', surah, ayah });
        setIsPlaying(true);
    }
  }, [surah, setAudioSrc, setIsPlaying, setCurrentlyPlaying]);

  const handleToggleFavorite = useCallback((ayah: Ayah) => {
    if(!surah) return;
    const favorite: FavoriteAyah = {
        surahNumber: surah.number,
        surahName: surah.name,
        ayahNumber: ayah.numberInSurah,
        text: ayah.text
    };
    const isFavorite = favorites.some(f => f.surahNumber === favorite.surahNumber && f.ayahNumber === favorite.ayahNumber);
    if(isFavorite) {
        setFavorites(favorites.filter(f => !(f.surahNumber === favorite.surahNumber && f.ayahNumber === favorite.ayahNumber)));
    } else {
        setFavorites([...favorites, favorite]);
    }
  }, [favorites, setFavorites, surah]);

  const isAyahFavorite = (ayah: Ayah) => {
    if(!surah) return false;
    return favorites.some(f => f.surahNumber === surah.number && f.ayahNumber === ayah.numberInSurah);
  }

  if (loading || !surah) {
    return <Spinner />;
  }

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <header className="text-center py-8 bg-gray-800/50 rounded-lg mb-6">
        <h1 className="text-5xl font-amiri-quran text-yellow-400">{surah.name}</h1>
        <p className="text-xl text-gray-300">{surah.englishName}</p>
        <p className="text-gray-400">{surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} - {surah.numberOfAyahs} آيات</p>
      </header>

      <div className="bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="p-4 border-b border-gray-700">
            <label htmlFor="tafsir-select" className="block mb-2 text-sm font-medium text-gray-300">اختر التفسير:</label>
            <select
                id="tafsir-select"
                value={selectedTafsirSlug}
                onChange={(e) => setSelectedTafsirSlug(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5"
            >
                {tafsirs.map(tafsir => (
                    <option key={tafsir.slug} value={tafsir.slug}>{tafsir.name}</option>
                ))}
            </select>
        </div>
        <div className="overflow-hidden">
            {surah.ayahs.map(ayah => (
            <AyahListItem
                key={ayah.number}
                ayah={ayah}
                surah={surah}
                isPlaying={currentlyPlaying?.type === 'ayah' && currentlyPlaying.ayah?.number === ayah.number && currentlyPlaying.surah?.number === surah.number}
                isFavorite={isAyahFavorite(ayah)}
                onPlay={handlePlay}
                onToggleFavorite={handleToggleFavorite}
                fontSize={settings.fontSize}
                selectedTafsirSlug={selectedTafsirSlug}
            />
            ))}
        </div>
      </div>
    </div>
  );
};

export default SurahDetailPage;
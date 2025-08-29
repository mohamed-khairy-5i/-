import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { getMergedSurahData, getTafsirForAyah, getTafsirs } from '../services/api';
import type { SurahDetail, Ayah, FavoriteAyah, TafsirContent, TafsirInfo } from '../types';
import Spinner from '../components/Spinner';
import { PlayIcon, StarIcon, ClipboardIcon, CheckIcon, CloseIcon } from '../components/icons';
import useLocalStorage from '../hooks/useLocalStorage';
import { AppContext } from '../App';

const SurahDetailPage: React.FC = () => {
  const { number } = useParams<{ number: string }>();
  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { setAudioSrc, setIsPlaying, setCurrentlyPlaying, currentlyPlaying, settings } = useContext(AppContext);
  const [favorites, setFavorites] = useLocalStorage<FavoriteAyah[]>('favorites:verses', []);
  const [tafsirs, setTafsirs] = useState<TafsirInfo[]>([]);
  const [selectedTafsirSlug, setSelectedTafsirSlug] = useState<string>('ar-tafsir-muyassar');

  // New state for inline interaction
  const [selectedAyah, setSelectedAyah] = useState<Ayah | null>(null);
  const [tafsir, setTafsir] = useState<TafsirContent | null>(null);
  const [showTafsir, setShowTafsir] = useState(false);
  const [isLoadingTafsir, setIsLoadingTafsir] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const fetchSurah = async () => {
      if (number) {
        setLoading(true);
        setSelectedAyah(null); // Reset selection when surah changes
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
  
  const handleSelectAyah = (ayah: Ayah) => {
      if (selectedAyah && selectedAyah.number === ayah.number) {
          setSelectedAyah(null);
          setShowTafsir(false);
      } else {
          setSelectedAyah(ayah);
          setShowTafsir(false);
          setTafsir(null);
      }
  };

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

  const handleShowTafsir = async () => {
      if (!selectedAyah) return;
      const newShowTafsir = !showTafsir;
      setShowTafsir(newShowTafsir);
      if (newShowTafsir && !tafsir) {
          setIsLoadingTafsir(true);
          const tafsirData = await getTafsirForAyah(selectedTafsirSlug, surah!.number, selectedAyah.numberInSurah);
          setTafsir(tafsirData);
          setIsLoadingTafsir(false);
      }
  };

  useEffect(() => {
      if (showTafsir && selectedAyah && surah) {
          const fetchTafsir = async () => {
              setIsLoadingTafsir(true);
              const tafsirData = await getTafsirForAyah(selectedTafsirSlug, surah.number, selectedAyah.numberInSurah);
              setTafsir(tafsirData);
              setIsLoadingTafsir(false);
          };
          fetchTafsir();
      }
  }, [selectedTafsirSlug, showTafsir, selectedAyah, surah]);

  const handleCopyToClipboard = (ayah: Ayah) => {
      navigator.clipboard.writeText(ayah.text).then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
      }).catch(err => {
          console.error('Failed to copy ayah text: ', err);
      });
  };

  const isAyahFavorite = (ayah: Ayah) => {
    if(!surah) return false;
    return favorites.some(f => f.surahNumber === surah.number && f.ayahNumber === ayah.numberInSurah);
  }

  if (loading || !surah) {
    return <Spinner />;
  }

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <header className="text-center py-8 bg-gray-800/50 rounded-lg mb-6 space-y-4">
        <h1 className="text-5xl font-amiri-quran text-yellow-400">{surah.name}</h1>
        <p className="text-xl text-gray-300">{surah.englishName}</p>
        <p className="text-gray-400">{surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} - {surah.numberOfAyahs} آيات</p>
      </header>

        <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 mb-6">
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
      
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6 md:p-8 mb-6">
            <p className="font-amiri-quran text-right leading-loose" style={{ fontSize: `${settings.fontSize}px` }}>
                {surah.ayahs.map(ayah => {
                    const arabicNumber = new Intl.NumberFormat('ar-EG').format(ayah.numberInSurah);
                    return (
                        <span
                            key={ayah.number}
                            onClick={() => handleSelectAyah(ayah)}
                            className={`cursor-pointer transition-colors duration-300 rounded px-1 ${selectedAyah?.number === ayah.number ? 'bg-yellow-400/20' : 'hover:bg-slate-700/50'}`}
                        >
                            {ayah.text}
                            <span className="text-yellow-400 text-lg mx-1 font-sans">
                                ﴿{arabicNumber}﴾
                            </span>
                        </span>
                    );
                })}
            </p>
        </div>
        
        {selectedAyah && (
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-700 p-4 sticky bottom-20 z-20 animate-fade-in-up shadow-2xl">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-700">
                     <p className="text-gray-300 font-bold">
                        سورة {surah.name}، الآية {selectedAyah.numberInSurah}
                    </p>
                    <button onClick={() => setSelectedAyah(null)} className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-700">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                    <button onClick={() => handlePlay(selectedAyah)} className="flex items-center gap-2 text-gray-300 hover:text-yellow-400 transition-colors">
                        <PlayIcon className={`w-5 h-5 ${currentlyPlaying?.type === 'ayah' && currentlyPlaying.ayah?.number === selectedAyah.number ? 'text-yellow-400' : ''}`} />
                        <span>استماع</span>
                    </button>
                    <button onClick={() => handleToggleFavorite(selectedAyah)} className="flex items-center gap-2 text-gray-300 hover:text-yellow-400 transition-colors">
                        <StarIcon className={`w-5 h-5 ${isAyahFavorite(selectedAyah) ? 'text-yellow-400' : ''}`} />
                        <span>{isAyahFavorite(selectedAyah) ? 'إزالة' : 'حفظ'}</span>
                    </button>
                    <button onClick={() => handleCopyToClipboard(selectedAyah)} className="flex items-center gap-2 text-gray-300 hover:text-yellow-400 transition-colors">
                        {isCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <ClipboardIcon className="w-5 h-5" />}
                        <span>{isCopied ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                    <button onClick={handleShowTafsir} className="flex items-center gap-2 text-gray-300 hover:text-yellow-400 transition-colors">
                        <span>{showTafsir ? 'إخفاء التفسير' : 'التفسير'}</span>
                    </button>
                </div>
                {showTafsir && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                        {isLoadingTafsir ? <Spinner /> : <p className="text-gray-300 whitespace-pre-wrap text-sm">{tafsir?.text || 'لا يوجد تفسير لهذه الآية.'}</p>}
                    </div>
                )}
            </div>
        )}
    </div>
  );
};

export default SurahDetailPage;

import React, { useState, createContext, useMemo } from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SurahsPage from './pages/SurahsPage';
import SurahDetailPage from './pages/SurahDetailPage';
import SettingsPage from './pages/SettingsPage';
import FavoritesPage from './pages/FavoritesPage';
import RadioPage from './pages/RadioPage';
import AudioPlayer from './components/AudioPlayer';
import useLocalStorage from './hooks/useLocalStorage';
import type { SurahDetail, Ayah, AppSettings, RadioStation } from './types';
import { BookOpenIcon, StarIcon, CogIcon, HomeIcon, RadioIcon } from './components/icons';


export interface CurrentlyPlaying {
    type: 'ayah' | 'radio';
    surah?: SurahDetail;
    ayah?: Ayah;
    station?: RadioStation;
}

interface IAppContext {
    audioSrc: string | null;
    setAudioSrc: React.Dispatch<React.SetStateAction<string | null>>;
    isPlaying: boolean;
    setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
    currentlyPlaying: CurrentlyPlaying | null;
    setCurrentlyPlaying: React.Dispatch<React.SetStateAction<CurrentlyPlaying | null>>;
    settings: AppSettings;
    setSettings: (value: AppSettings) => void;
}

export const AppContext = createContext<IAppContext>({} as IAppContext);

const App: React.FC = () => {
    const [audioSrc, setAudioSrc] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentlyPlaying, setCurrentlyPlaying] = useState<CurrentlyPlaying | null>(null);
    const [settings, setSettings] = useLocalStorage<AppSettings>('settings', { fontSize: 24, defaultReciterIdentifier: 'ar.alafasy' });

    const handlePlayPause = () => {
        if (!audioSrc) return;
        setIsPlaying(!isPlaying);
    };

    const handleAudioEnded = () => {
        if (!currentlyPlaying || currentlyPlaying.type !== 'ayah') return;
        
        const { surah, ayah } = currentlyPlaying;
        if (!surah || !ayah) return;

        const currentAyahIndex = surah.ayahs.findIndex(a => a.number === ayah.number);
        
        if (currentAyahIndex !== -1 && currentAyahIndex < surah.ayahs.length - 1) {
            const nextAyah = surah.ayahs[currentAyahIndex + 1];
            setAudioSrc(nextAyah.audio);
            setCurrentlyPlaying({ type: 'ayah', surah, ayah: nextAyah });
            setIsPlaying(true);
        } else {
            setIsPlaying(false);
            setCurrentlyPlaying(null);
            setAudioSrc(null);
        }
    };

    const appContextValue = useMemo(() => ({
        audioSrc, setAudioSrc,
        isPlaying, setIsPlaying,
        currentlyPlaying, setCurrentlyPlaying,
        settings, setSettings
    }), [audioSrc, isPlaying, currentlyPlaying, settings, setSettings]);

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${
            isActive ? 'text-yellow-400' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
        }`;

    return (
        <AppContext.Provider value={appContextValue}>
            <HashRouter>
                <div className="min-h-screen flex flex-col pb-28">
                    <main className="flex-grow">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/surahs" element={<SurahsPage />} />
                            <Route path="/surah/:number" element={<SurahDetailPage />} />
                            <Route path="/radio" element={<RadioPage />} />
                            <Route path="/favorites" element={<FavoritesPage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                        </Routes>
                    </main>
                    <nav className="fixed bottom-0 right-0 left-0 bg-gray-800/80 backdrop-blur-sm border-t border-gray-700 z-40">
                        <div className="container mx-auto flex justify-around items-center h-16 text-xs">
                             <NavLink to="/" className={navLinkClass}>
                                <HomeIcon className="w-6 h-6" />
                                <span>الرئيسية</span>
                            </NavLink>
                            <NavLink to="/surahs" className={navLinkClass}>
                                <BookOpenIcon className="w-6 h-6" />
                                <span>السور</span>
                            </NavLink>
                             <NavLink to="/radio" className={navLinkClass}>
                                <RadioIcon className="w-6 h-6" />
                                <span>الإذاعة</span>
                            </NavLink>
                            <NavLink to="/favorites" className={navLinkClass}>
                                <StarIcon className="w-6 h-6" />
                                <span>المفضلة</span>
                            </NavLink>
                            <NavLink to="/settings" className={navLinkClass}>
                                <CogIcon className="w-6 h-6" />
                                <span>الإعدادات</span>
                            </NavLink>
                        </div>
                    </nav>
                </div>
                <AudioPlayer 
                    audioSrc={audioSrc}
                    isPlaying={isPlaying}
                    onPlayPause={handlePlayPause}
                    onEnded={handleAudioEnded}
                    currentlyPlaying={currentlyPlaying}
                />
            </HashRouter>
        </AppContext.Provider>
    );
};

export default App;


import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import useLocalStorage from '../hooks/useLocalStorage';
import type { FavoriteAyah, Edition } from '../types';
import { getAudioEditions } from '../services/api';
import Spinner from '../components/Spinner';

const SettingsPage: React.FC = () => {
    const { settings, setSettings } = useContext(AppContext);
    const [favorites, setFavorites] = useLocalStorage<FavoriteAyah[]>('favorites:verses', []);
    const [audioEditions, setAudioEditions] = useState<Edition[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEditions = async () => {
            setLoading(true);
            const editions = await getAudioEditions();
            setAudioEditions(editions);
            setLoading(false);
        };
        fetchEditions();
    }, []);

    const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings({ ...settings, fontSize: Number(e.target.value) });
    };
    
    const handleReciterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSettings({ ...settings, defaultReciterIdentifier: e.target.value });
    };

    const clearFavorites = () => {
        if (window.confirm('هل أنت متأكد من رغبتك في حذف جميع الآيات المفضلة؟')) {
            setFavorites([]);
        }
    };

    return (
        <div className="container mx-auto p-4 animate-fade-in">
            <header className="py-6 text-center">
                <h1 className="text-4xl font-bold font-amiri-quran text-yellow-400">الإعدادات</h1>
            </header>

            <div className="max-w-2xl mx-auto bg-gray-800/50 p-6 rounded-lg border border-gray-700 space-y-8">
                {/* Font Size Setting */}
                <div className="space-y-4">
                    <label htmlFor="fontSize" className="block text-xl text-gray-300">حجم الخط</label>
                    <div className="flex items-center gap-4">
                        <input
                            id="fontSize"
                            type="range"
                            min="16"
                            max="48"
                            step="2"
                            value={settings.fontSize}
                            onChange={handleFontSizeChange}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-yellow-400 font-bold w-12 text-center">{settings.fontSize}px</span>
                    </div>
                    <p className="font-amiri-quran text-center bg-gray-900 p-4 rounded-md" style={{ fontSize: `${settings.fontSize}px` }}>
                        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </p>
                </div>
                
                {/* Reciter Setting */}
                <div className="space-y-4 border-t border-gray-700 pt-6">
                    <label htmlFor="reciter" className="block text-xl text-gray-300">القارئ الافتراضي</label>
                    {loading ? <Spinner /> : (
                         <select
                            id="reciter"
                            value={settings.defaultReciterIdentifier}
                            onChange={handleReciterChange}
                            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5"
                         >
                            {audioEditions.map(edition => (
                                <option key={edition.identifier} value={edition.identifier}>
                                    {edition.name}
                                </option>
                            ))}
                         </select>
                    )}
                </div>

                {/* Data Management */}
                <div className="space-y-4 border-t border-gray-700 pt-6">
                     <h2 className="text-xl text-gray-300">إدارة البيانات</h2>
                     <div className="flex items-center justify-between">
                        <p>مسح المفضلة ({favorites.length} آية)</p>
                        <button 
                            onClick={clearFavorites}
                            disabled={favorites.length === 0}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-900 disabled:cursor-not-allowed transition-colors"
                        >
                            حذف الكل
                        </button>
                     </div>
                </div>

            </div>
        </div>
    );
};

export default SettingsPage;

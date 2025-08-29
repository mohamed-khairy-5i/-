
import React from 'react';
import { NavLink } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';
import type { FavoriteAyah } from '../types';

const FavoritesPage: React.FC = () => {
    const [favorites] = useLocalStorage<FavoriteAyah[]>('favorites:verses', []);

    return (
        <div className="container mx-auto p-4 animate-fade-in">
             <header className="py-6 text-center">
                <h1 className="text-4xl font-bold font-amiri-quran text-yellow-400">المفضلة</h1>
            </header>
            <div className="max-w-4xl mx-auto space-y-4">
                {favorites.length === 0 ? (
                    <p className="text-center text-gray-400 text-lg">لم تقم بإضافة أي آيات للمفضلة بعد.</p>
                ) : (
                    favorites.slice().reverse().map((fav, index) => (
                        <div key={`${fav.surahNumber}-${fav.ayahNumber}-${index}`} className="bg-gray-800/50 p-4 rounded-lg border-r-4 border-yellow-400">
                            <p className="font-amiri-quran text-xl mb-2">{fav.text}</p>
                            <p className="text-sm text-yellow-400">
                                <NavLink to={`/surah/${fav.surahNumber}`} className="hover:underline">
                                    سورة {fav.surahName}، الآية {fav.ayahNumber}
                                </NavLink>
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FavoritesPage;

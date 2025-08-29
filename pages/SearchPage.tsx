import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { searchQuran } from '../services/api';
import type { SearchResult } from '../types';
import Spinner from '../components/Spinner';
import { SearchIcon } from '../components/icons';

const SearchPage: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setSearched(true);
        const searchResults = await searchQuran(query);
        setResults(searchResults);
        setLoading(false);
    };

    const highlightQuery = (text: string, query: string) => {
        if (!query) return text;
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return (
            <>
                {parts.map((part, index) =>
                    part.toLowerCase() === query.toLowerCase() ? (
                        <mark key={index} className="bg-yellow-400 text-gray-900 px-1 rounded">
                            {part}
                        </mark>
                    ) : (
                        part
                    )
                )}
            </>
        );
    };

    return (
        <div className="container mx-auto p-4 animate-fade-in">
            <header className="py-6 text-center">
                <h1 className="text-4xl font-bold font-amiri-quran text-yellow-400">البحث في القرآن الكريم</h1>
            </header>

            <form onSubmit={handleSearch} className="flex gap-2 mb-8 max-w-2xl mx-auto">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="اكتب كلمة أو جزء من آية..."
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                />
                <button
                    type="submit"
                    className="px-6 py-3 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition-colors flex items-center justify-center font-bold"
                    disabled={loading}
                >
                    {loading ? <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div> : <SearchIcon className="w-6 h-6" />}
                </button>
            </form>

            <div className="max-w-4xl mx-auto space-y-4">
                {loading ? (
                    <Spinner />
                ) : searched && (
                    <>
                        {results && results.count > 0 ? (
                            <div>
                                <p className="text-center text-gray-400 mb-4">تم العثور على {results.count} نتيجة للبحث عن "{query}"</p>
                                {results.matches.map(match => (
                                     <div key={match.number} className="bg-gray-800/50 p-4 rounded-lg border-r-4 border-yellow-400">
                                         <p className="font-amiri-quran text-xl mb-2">
                                             {highlightQuery(match.text, query)}
                                         </p>
                                         <p className="text-sm text-yellow-400">
                                             <NavLink to={`/surah/${match.surah.number}`} className="hover:underline">
                                                 سورة {match.surah.name}، الآية {match.numberInSurah}
                                             </NavLink>
                                         </p>
                                     </div>
                                ))}
                            </div>
                        ) : (
                             <p className="text-center text-gray-400 text-lg">لم يتم العثور على نتائج للبحث عن "{query}"</p>
                        )}
                    </>
                )}
                 {!searched && (
                    <p className="text-center text-gray-500 text-lg">أدخل كلمة بحث للبدء.</p>
                )}
            </div>
        </div>
    );
};

export default SearchPage;
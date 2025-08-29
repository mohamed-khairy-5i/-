
import React, { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { getSurahs } from '../services/api';
import type { SurahReference } from '../types';
import Spinner from '../components/Spinner';

const SurahCard: React.FC<{ surah: SurahReference }> = ({ surah }) => (
    <NavLink 
        to={`/surah/${surah.number}`}
        className="block bg-gray-800/50 p-4 rounded-lg border border-gray-700 hover:border-yellow-400 transition-all duration-300 transform hover:shadow-lg hover:-translate-y-1"
    >
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <span className="flex items-center justify-center w-10 h-10 bg-gray-700 text-yellow-400 rounded-md">{surah.number}</span>
                <div>
                    <h3 className="text-xl font-bold font-amiri-quran">{surah.name}</h3>
                    <p className="text-sm text-gray-400">{surah.englishName}</p>
                </div>
            </div>
            <div className="text-left">
                <p className="text-lg text-gray-300">{surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</p>
                <p className="text-sm text-gray-400">{surah.numberOfAyahs} آيات</p>
            </div>
        </div>
    </NavLink>
);

const SurahsPage: React.FC = () => {
  const [surahs, setSurahs] = useState<SurahReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'Meccan' | 'Medinan'>('all');

  useEffect(() => {
    const fetchSurahs = async () => {
      setLoading(true);
      const surahsData = await getSurahs();
      setSurahs(surahsData);
      setLoading(false);
    };
    fetchSurahs();
  }, []);

  const filteredSurahs = useMemo(() => {
    return surahs
      .filter(surah => {
        if (filter === 'all') return true;
        return surah.revelationType === filter;
      })
      .filter(surah => 
        surah.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        surah.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        surah.number.toString().includes(searchTerm)
      );
  }, [surahs, searchTerm, filter]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <header className="py-6 text-center">
        <h1 className="text-4xl font-bold font-amiri-quran text-yellow-400">سور القرآن الكريم</h1>
      </header>

      <div className="sticky top-0 bg-gray-900 py-4 z-10 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="ابحث عن سورة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none"
          />
          <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg p-1">
            <button onClick={() => setFilter('all')} className={`px-4 py-1 rounded-md text-sm w-full ${filter === 'all' ? 'bg-yellow-400 text-gray-900' : 'hover:bg-gray-700'}`}>الكل</button>
            <button onClick={() => setFilter('Meccan')} className={`px-4 py-1 rounded-md text-sm w-full ${filter === 'Meccan' ? 'bg-yellow-400 text-gray-900' : 'hover:bg-gray-700'}`}>مكية</button>
            <button onClick={() => setFilter('Medinan')} className={`px-4 py-1 rounded-md text-sm w-full ${filter === 'Medinan' ? 'bg-yellow-400 text-gray-900' : 'hover:bg-gray-700'}`}>مدنية</button>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredSurahs.map(surah => (
          <SurahCard key={surah.number} surah={surah} />
        ))}
      </div>
    </div>
  );
};

export default SurahsPage;

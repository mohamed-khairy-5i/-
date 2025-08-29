
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
// FIX: Corrected import to use getMergedSurahData, as getSurahDetail is not an exported member of services/api.
import { getStats, getMergedSurahData } from '../services/api';
import type { SurahDetail } from '../types';
import Spinner from '../components/Spinner';
import { BookOpenIcon, StarIcon, CogIcon, RadioIcon } from '../components/icons';

const HomePage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [randomSurah, setRandomSurah] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomePageData = async () => {
      setLoading(true);
      try {
        const statsData = await getStats();
        setStats(statsData);

        const randomSurahNumber = Math.floor(Math.random() * 114) + 1;
        // Fetching with a default reciter for the random ayah audio link, though it's not used here.
        // FIX: Replaced non-existent getSurahDetail with getMergedSurahData and used a valid default audio edition identifier.
        const surahData = await getMergedSurahData(randomSurahNumber, 'ar.alafasy');
        setRandomSurah(surahData);
      } catch (error) {
        console.error("Error fetching home page data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomePageData();
  }, []);

  if (loading) {
    return <Spinner />;
  }
  
  const StatCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
    <div className="bg-gray-800/50 p-6 rounded-lg text-center border border-gray-700">
        <p className="text-xl text-gray-400">{title}</p>
        <p className="text-4xl font-bold text-yellow-400">{value}</p>
    </div>
  );

  return (
    <div className="container mx-auto p-4 space-y-8 animate-fade-in">
      <header className="text-center space-y-2 py-10">
        <h1 className="text-5xl font-bold font-amiri-quran text-yellow-400">مداد الهدى</h1>
        <p className="text-lg text-gray-300">بوابتك لاستكشاف القرآن الكريم</p>
      </header>

      {stats && (
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="عدد السور" value={stats.surahs.count} />
            <StatCard title="عدد الآيات" value={stats.ayahs.count} />
            <StatCard title="عدد الصفحات" value={stats.pages.count} />
            <StatCard title="عدد الأجزاء" value={stats.juzs.count} />
          </div>
        </section>
      )}

      {randomSurah && (
        <section className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">سورة اليوم</h2>
          <div className="space-y-2">
            <h3 className="text-3xl font-amiri-quran">{randomSurah.name}</h3>
            <p className="text-gray-400">{randomSurah.englishName} - {randomSurah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</p>
            <p className="font-amiri-quran text-lg leading-loose">{randomSurah.ayahs[0].text}</p>
            <NavLink to={`/surah/${randomSurah.number}`} className="inline-block mt-4 text-yellow-400 hover:text-yellow-300 transition-colors">
              اقرأ السورة كاملة &rarr;
            </NavLink>
          </div>
        </section>
      )}
      
      <section>
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-300">استكشف</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <NavLink to="/surahs" className="flex flex-col items-center justify-center p-6 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-yellow-400 transition-all transform hover:-translate-y-1">
                  <BookOpenIcon className="w-12 h-12 text-yellow-400 mb-2" />
                  <span className="text-xl font-bold">تصفح السور</span>
              </NavLink>
              <NavLink to="/radio" className="flex flex-col items-center justify-center p-6 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-yellow-400 transition-all transform hover:-translate-y-1">
                  <RadioIcon className="w-12 h-12 text-yellow-400 mb-2" />
                  <span className="text-xl font-bold">الإذاعة</span>
              </NavLink>
              <NavLink to="/favorites" className="flex flex-col items-center justify-center p-6 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-yellow-400 transition-all transform hover:-translate-y-1">
                  <StarIcon className="w-12 h-12 text-yellow-400 mb-2" />
                  <span className="text-xl font-bold">المفضلة</span>
              </NavLink>
              <NavLink to="/settings" className="flex flex-col items-center justify-center p-6 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-yellow-400 transition-all transform hover:-translate-y-1">
                  <CogIcon className="w-12 h-12 text-yellow-400 mb-2" />
                  <span className="text-xl font-bold">الإعدادات</span>
              </NavLink>
          </div>
      </section>

    </div>
  );
};

export default HomePage;

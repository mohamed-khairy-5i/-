import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getStats, getMergedSurahData } from '../services/api';
import type { SurahDetail } from '../types';
import Spinner from '../components/Spinner';
import { BookOpenIcon, StarIcon, RadioIcon, TafsirIcon, SearchIcon, AyahIcon, PageIcon, JuzIcon } from '../components/icons';

const HomePage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [randomSurah, setRandomSurah] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomePageData = async () => {
      setLoading(true);
      try {
        const [statsData, surahData] = await Promise.all([
          getStats(),
          getMergedSurahData(Math.floor(Math.random() * 114) + 1, 'ar.alafasy')
        ]);
        setStats(statsData);
        setRandomSurah(surahData);
      } catch (error) {
        console.error("Error fetching home page data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomePageData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-slate-800/50 p-4 rounded-lg text-center border border-slate-700 flex flex-col items-center justify-center gap-2 transition-transform transform hover:scale-105">
        <div className="text-yellow-400">{icon}</div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-slate-400">{title}</p>
    </div>
  );
  
  const ExploreCard: React.FC<{ to: string; title: string; description: string; icon: React.ReactNode; }> = ({ to, title, description, icon }) => (
      <NavLink to={to} className="group bg-slate-800/50 p-6 rounded-lg border border-slate-700 hover:border-yellow-400 hover:bg-slate-800 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between">
          <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors">{title}</h3>
                <p className="text-slate-400 text-sm">{description}</p>
              </div>
              <div className="text-yellow-400 transition-transform duration-300 group-hover:scale-110">
                {icon}
              </div>
          </div>
      </NavLink>
  );

  return (
    <div className="space-y-16 animate-fade-in">
        {/* Hero Section */}
        <section className="text-center py-16 md:py-24 bg-slate-900 rounded-b-3xl">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">مداد الهدى</h1>
                <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">بوابتك الشاملة لاستكشاف القرآن الكريم: اقرأ، استمع، تدبّر.</p>
                <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ابحث عن كلمة أو جزء من آية..."
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none placeholder-slate-500"
                        aria-label="Search query"
                    />
                    <button
                        type="submit"
                        className="px-5 py-3 bg-yellow-400 text-slate-900 rounded-lg hover:bg-yellow-500 transition-colors flex items-center justify-center font-bold"
                        aria-label="بحث"
                    >
                        <SearchIcon className="w-6 h-6" />
                    </button>
                </form>
            </div>
        </section>

        <div className="container mx-auto px-4 space-y-16">
            {/* Stats Section */}
            {loading ? <Spinner /> : stats && (
                <section>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard title="سورة" value={stats.surahs.count} icon={<BookOpenIcon className="w-8 h-8"/>} />
                    <StatCard title="آية" value={stats.ayahs.count.toLocaleString('ar')} icon={<AyahIcon className="w-8 h-8"/>} />
                    <StatCard title="صفحة" value={stats.pages.count} icon={<PageIcon className="w-8 h-8"/>} />
                    <StatCard title="جزء" value={stats.juzs.count} icon={<JuzIcon className="w-8 h-8"/>} />
                </div>
                </section>
            )}

            {/* Discover Section */}
            <section>
                <h2 className="text-3xl font-bold text-center mb-8 text-white">اكتشف اليوم</h2>
                <div className="grid md:grid-cols-2 gap-6 items-stretch">
                    {randomSurah && (
                        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-bold mb-4 text-yellow-400">آية اليوم</h3>
                                <blockquote className="border-r-4 border-yellow-400 pr-4">
                                  <p className="font-amiri-quran text-2xl leading-relaxed">{randomSurah.ayahs[0].text}</p>
                                </blockquote>
                            </div>
                            <NavLink to={`/surah/${randomSurah.number}`} className="inline-block mt-4 text-yellow-400 hover:text-yellow-300 transition-colors font-bold self-start">
                                من سورة {randomSurah.name} &rarr;
                            </NavLink>
                        </div>
                    )}
                    <ExploreCard 
                        to="/surahs"
                        title="تصفح السور"
                        description="اقرأ واستمع للقرآن الكريم كاملاً، سورة بسورة، مع أشهر القراء."
                        icon={<BookOpenIcon className="w-10 h-10" />}
                    />
                </div>
            </section>
            
            {/* Explore More Section */}
            <section>
                <h2 className="text-3xl font-bold text-center mb-8 text-white">استكشف المزيد</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <ExploreCard 
                        to="/tafsir"
                        title="استكشاف التفسير"
                        description="تعمق في معاني الآيات مع أشهر كتب التفسير المعتمدة."
                        icon={<TafsirIcon className="w-10 h-10" />}
                        />
                    <ExploreCard 
                        to="/radio"
                        title="إذاعات القرآن"
                        description="استمع لبث مباشر لأشهر إذاعات القرآن الكريم حول العالم."
                        icon={<RadioIcon className="w-10 h-10" />}
                        />
                    <ExploreCard 
                        to="/favorites"
                        title="الآيات المفضلة"
                        description="ارجع بسهولة للآيات التي أثرت فيك وحفظتها للمراجعة."
                        icon={<StarIcon className="w-10 h-10" />}
                        />
                </div>
            </section>
        </div>
    </div>
  );
};

export default HomePage;
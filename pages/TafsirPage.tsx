import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { getTafsirs } from '../services/api';
import type { TafsirInfo } from '../types';
import Spinner from '../components/Spinner';

const TafsirPage: React.FC = () => {
  const [tafsirs, setTafsirs] = useState<TafsirInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTafsirs = async () => {
      setLoading(true);
      const tafsirsData = await getTafsirs();
      setTafsirs(tafsirsData);
      setLoading(false);
    };
    fetchTafsirs();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <header className="py-6 text-center">
        <h1 className="text-4xl font-bold font-amiri-quran text-yellow-400">كتب التفسير</h1>
        <p className="text-gray-400 mt-4">اختر أحد التفاسير لاستعراضه</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tafsirs.map(tafsir => (
          <NavLink
            key={tafsir.slug}
            to={`/tafsir/${tafsir.slug}`}
            className="block bg-gray-800/50 p-6 rounded-lg border border-gray-700 hover:border-yellow-400 transition-all duration-300 transform hover:shadow-lg hover:-translate-y-1"
          >
            <h2 className="text-xl font-bold text-white">{tafsir.name}</h2>
            <p className="text-gray-400 mt-2">{tafsir.author}</p>
            <span className="inline-block mt-4 text-sm text-yellow-400 capitalize">
              {tafsir.language}
            </span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default TafsirPage;
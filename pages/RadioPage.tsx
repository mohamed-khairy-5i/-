
import React, { useState, useEffect, useContext } from 'react';
import { getRadios } from '../services/api';
import type { RadioStation } from '../types';
import Spinner from '../components/Spinner';
import { AppContext } from '../App';
import { PlayIcon, PauseIcon } from '../components/icons';

const RadioPage: React.FC = () => {
    const [radios, setRadios] = useState<RadioStation[]>([]);
    const [loading, setLoading] = useState(true);
    const { setAudioSrc, setIsPlaying, setCurrentlyPlaying, currentlyPlaying, isPlaying } = useContext(AppContext);

    useEffect(() => {
        const fetchRadios = async () => {
            setLoading(true);
            const radiosData = await getRadios();
            setRadios(radiosData);
            setLoading(false);
        };
        fetchRadios();
    }, []);
    
    const handlePlayRadio = (station: RadioStation) => {
        // If this station is already playing, pause it
        if(currentlyPlaying?.type === 'radio' && currentlyPlaying.station?.id === station.id && isPlaying) {
            setIsPlaying(false);
        } else { // Otherwise, play the new station
            setAudioSrc(station.url);
            setCurrentlyPlaying({ type: 'radio', station });
            setIsPlaying(true);
        }
    };

    if (loading) {
        return <Spinner />;
    }

    return (
        <div className="container mx-auto p-4 animate-fade-in">
            <header className="py-6 text-center">
                <h1 className="text-4xl font-bold font-amiri-quran text-yellow-400">الإذاعات الإسلامية</h1>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {radios.map(station => {
                    const isCurrentlyPlaying = currentlyPlaying?.type === 'radio' && currentlyPlaying.station?.id === station.id && isPlaying;
                    return (
                        <div key={station.id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex items-center justify-between">
                            <h2 className="text-lg font-bold">{station.name}</h2>
                            <button
                                onClick={() => handlePlayRadio(station)}
                                className="p-2 rounded-full bg-yellow-400 text-gray-900 hover:bg-yellow-500 transition-colors"
                                aria-label={isCurrentlyPlaying ? `إيقاف ${station.name}` : `تشغيل ${station.name}`}
                            >
                                {isCurrentlyPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default RadioPage;

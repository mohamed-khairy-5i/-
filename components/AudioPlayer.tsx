
import React, { useRef, useEffect } from 'react';
import type { CurrentlyPlaying } from '../App';
import { PlayIcon, PauseIcon } from './icons';

interface AudioPlayerProps {
  audioSrc: string | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onEnded: () => void;
  currentlyPlaying: CurrentlyPlaying | null;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioSrc, isPlaying, onPlayPause, onEnded, currentlyPlaying }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audioSrc) {
      if (audio.src !== audioSrc) {
        audio.src = audioSrc;
      }
      
      if (isPlaying) {
        // The play method returns a promise which can be interrupted by a new load request.
        // We catch this specific 'AbortError' to prevent it from cluttering the console.
        audio.play().catch(error => {
          if (error.name !== 'AbortError') {
            console.error("Audio play failed:", error);
          }
        });
      } else {
        audio.pause();
      }
    } else {
        // If there's no src, ensure it's paused and reset.
        audio.pause();
        audio.src = '';
    }
  }, [audioSrc, isPlaying]);
  
  const getDisplayText = () => {
    if (!currentlyPlaying) return <p>مشغل الصوت</p>;
    
    switch (currentlyPlaying.type) {
        case 'ayah':
            return (
                <>
                    <p className="font-bold text-yellow-400">{currentlyPlaying.surah?.name}</p>
                    <p className="text-gray-300">الآية: {currentlyPlaying.ayah?.numberInSurah}</p>
                </>
            );
        case 'radio':
            return (
                 <>
                    <p className="font-bold text-yellow-400">الإذاعة</p>
                    <p className="text-gray-300">{currentlyPlaying.station?.name}</p>
                </>
            );
        default:
            return <p>مشغل الصوت</p>;
    }
  }

  return (
    <div className={`fixed bottom-16 right-0 left-0 bg-gray-800/80 backdrop-blur-sm border-t border-gray-700 z-50 transition-transform duration-300 ${audioSrc ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="text-sm">
          {getDisplayText()}
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={onPlayPause} className="p-2 rounded-full bg-yellow-400 text-gray-900 hover:bg-yellow-500 transition-colors">
            {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
          </button>
        </div>
        
        <audio
          ref={audioRef}
          onEnded={onEnded}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default AudioPlayer;
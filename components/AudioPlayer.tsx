import React, { useRef, useEffect } from 'react';
import type { CurrentlyPlaying } from '../App';
import { PlayIcon, PauseIcon, CloseIcon } from './icons';

interface AudioPlayerProps {
  audioSrc: string | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onEnded: () => void;
  onClose: () => void;
  currentlyPlaying: CurrentlyPlaying | null;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioSrc, isPlaying, onPlayPause, onEnded, onClose, currentlyPlaying }) => {
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
                    <p className="font-bold text-yellow-400 truncate">{currentlyPlaying.surah?.name}</p>
                    <p className="text-gray-300">الآية: {currentlyPlaying.ayah?.numberInSurah}</p>
                </>
            );
        case 'radio':
            return (
                 <>
                    <p className="font-bold text-yellow-400 truncate">الإذاعة</p>
                    <p className="text-gray-300 truncate">{currentlyPlaying.station?.name}</p>
                </>
            );
        default:
            return <p>مشغل الصوت</p>;
    }
  }

  return (
    <div className={`bg-gray-800/80 backdrop-blur-sm border-t border-gray-700 ${audioSrc ? '' : 'hidden'}`}>
      <div className="container mx-auto px-4 py-2 grid grid-cols-3 items-center gap-2">
        <div className="flex justify-start">
            <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" aria-label="إغلاق المشغل">
                <CloseIcon className="w-5 h-5" />
            </button>
        </div>
        
        <div className="text-sm text-center overflow-hidden">
          {getDisplayText()}
        </div>
        
        <div className="flex justify-end">
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
import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Search, Link as LinkIcon, X } from 'lucide-react';

interface Track {
  title: string;
  artist: string;
  albumArt: string;
  duration: string;
  audioSrc?: string;
}

interface MusicPlayerProps {
  tracks: Track[];
}

const MusicPlayer = ({ tracks }: MusicPlayerProps) => {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [customTracks, setCustomTracks] = useState<Track[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const allTracks = [...tracks, ...customTracks];
  const track = allTracks[currentTrack];
  const isYouTube = track.audioSrc && !track.audioSrc.includes('/') && track.audioSrc.length === 11;

  useEffect(() => {
    // Attempt autoplay on first interaction if blocked
    const handleFirstInteraction = () => {
      if (isPlaying) {
        if (isYouTube) {
          sendYoutubeCommand('playVideo');
        } else if (audioRef.current) {
          audioRef.current.play().catch(() => {});
        }
      }
      window.removeEventListener('click', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);
    
    return () => window.removeEventListener('click', handleFirstInteraction);
  }, [isPlaying, isYouTube]);

  useEffect(() => {
    if (isYouTube) {
      sendYoutubeCommand('setVolume', [volume]);
    } else if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      if (isPlaying) {
        audioRef.current.play().catch(err => console.log("Autoplay blocked, waiting for interaction."));
      }
    }
  }, [volume, currentTrack, isYouTube]);

  const sendYoutubeCommand = (func: string, args: any[] = []) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: func,
        args: args
      }), '*');
    }
  };

  const togglePlay = () => {
    if (isYouTube) {
      if (isPlaying) {
        sendYoutubeCommand('pauseVideo');
      } else {
        sendYoutubeCommand('playVideo');
      }
      setIsPlaying(!isPlaying);
    } else if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    if (isYouTube) {
      setDuration(parseDuration(track.duration));
    }
  }, [currentTrack, isYouTube, track.duration]);

  useEffect(() => {
    let interval: number;
    if (isYouTube && isPlaying) {
      interval = window.setInterval(() => {
        setCurrentTime((prev) => {
          const total = parseDuration(track.duration);
          // Only skip if we have a valid duration and have reached it
          if (total > 0 && prev >= total) {
            nextTrack();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isYouTube, isPlaying, track.duration]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    
    if (isYouTube) {
      const durationSeconds = parseDuration(track.duration);
      const newTime = percent * durationSeconds;
      setCurrentTime(newTime);
      sendYoutubeCommand('seekTo', [newTime, true]);
    } else if (audioRef.current && duration) {
      audioRef.current.currentTime = percent * duration;
    }
  };

  const parseDuration = (dur: string) => {
    const parts = dur.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 0;
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newVolume = Math.round(percent * 100);
    setVolume(newVolume);
  };

  const parseYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\/shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    let audioSrc = urlInput;
    let albumArt = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop';
    const ytId = parseYoutubeId(urlInput);
    
    if (ytId) {
      audioSrc = ytId;
      albumArt = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
    }

    const newTrack: Track = {
      title: 'Requested Track',
      artist: 'Search Result',
      albumArt,
      duration: '0:00',
      audioSrc
    };

    const newIndex = tracks.length + customTracks.length;
    setCustomTracks(prev => [...prev, newTrack]);
    setCurrentTime(0);
    setIsPlaying(true);
    
    // Use a small timeout to ensure the state update for customTracks is processed
    // before we move the index to the new track
    setTimeout(() => {
      setCurrentTrack(newIndex);
    }, 10);
    
    setShowUrlInput(false);
    setUrlInput('');
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % allTracks.length);
    setIsPlaying(true);
    setCurrentTime(0);
  };

  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + allTracks.length) % allTracks.length);
    setIsPlaying(true);
    setCurrentTime(0);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="mt-6">
      <p className="text-xs text-muted-foreground mb-1">
        now playing — Aimbot's curated selection
      </p>
      <div className="content-section space-y-2">
        {/* Track info */}
        <div className="flex items-center gap-2">
          <img
            src={track.albumArt}
            alt={track.title}
            className="w-7 h-7 rounded cursor-pointer"
            onClick={togglePlay}
          />
          <div className="flex-1 cursor-pointer group" onClick={togglePlay}>
            <h3 className="text-xs font-medium text-foreground/80 group-hover:text-foreground transition-colors">
              {track.title}
            </h3>
            <p className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
              {track.artist}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={prevTrack}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <SkipBack size={14} />
            </button>
            <button
              onClick={togglePlay}
              className="text-foreground hover:text-foreground/80 transition-colors"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button
              onClick={nextTrack}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <SkipForward size={14} />
            </button>
          </div>

          {/* Volume and Search */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowUrlInput(!showUrlInput)}
              className={`flex items-center gap-1.5 transition-colors ${showUrlInput ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              title="Search by URL"
            >
              <span className="text-[9px] font-bold tracking-tighter opacity-70">SEARCH</span>
              <Search size={16} />
            </button>
            <div className="flex items-center gap-2">
              <Volume2 size={14} className="text-muted-foreground" />
              <div className="progress-track w-12" onClick={handleVolumeChange}>
                <div className="progress-fill" style={{ width: `${volume}%` }} />
              </div>
              <span className="text-xs text-muted-foreground w-6">{volume}%</span>
            </div>
          </div>
        </div>

        {/* URL Input overlay */}
        {showUrlInput && (
          <form onSubmit={handleUrlSubmit} className="relative mt-1">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste YouTube or Audio URL..."
              className="w-full bg-black/40 border border-border/50 rounded-md px-8 py-1.5 text-[10px] focus:outline-none focus:border-foreground/30 transition-all font-mono"
              autoFocus
            />
            <LinkIcon size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <button 
              type="button"
              onClick={() => setShowUrlInput(false)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={10} />
            </button>
          </form>
        )}

        {/* Progress bar */}
        <div className="relative">
          <div className="progress-track" onClick={handleSeek}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between mt-0.5">
            <span className="text-xs text-muted-foreground">{formatTime(currentTime)}</span>
            <span className="text-xs text-muted-foreground">{track.duration}</span>
          </div>
        </div>

        {track.audioSrc && (
          isYouTube ? (
            <iframe
              key={`yt-${track.audioSrc}-${currentTrack}`}
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${track.audioSrc}?enablejsapi=1&autoplay=1&controls=0&modestbranding=1&rel=0`}
              className="hidden"
              allow="autoplay"
            />
          ) : (
            <audio
              key={`audio-${track.audioSrc}-${currentTrack}`}
              ref={audioRef}
              src={track.audioSrc}
              preload="auto"
              autoPlay
              onTimeUpdate={handleTimeUpdate}
              onEnded={nextTrack}
            />
          )
        )}
      </div>
    </div>
  );
};

export default MusicPlayer;

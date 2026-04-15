import { useEffect, useRef } from 'react';

const BackgroundVideo = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.7; // Slightly slower for more "chill" effect
    }
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-black pointer-events-none">
      <iframe
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full w-[177.77777778vh] h-[56.25vw] brightness-[0.7] contrast-[1.15] saturate-[1.1] pointer-events-none"
        src="https://www.youtube.com/embed/EiyAWT1GaD8?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&autohide=1&modestbranding=1&rel=0&playlist=EiyAWT1GaD8&vq=hd1080"
        frameBorder="0"
        allow="autoplay; encrypted-media"
        allowFullScreen
      ></iframe>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
    </div>
  );
};

export default BackgroundVideo;

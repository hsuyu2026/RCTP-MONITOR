import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SettingsState } from '../types';
import { URLS, TRANSLATIONS } from '../constants';

interface DashboardProps {
  settings: SettingsState;
}

const Dashboard: React.FC<DashboardProps> = ({ settings }) => {
  const [expandedVideo, setExpandedVideo] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockOpacity, setClockOpacity] = useState(1);
  const interactionTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const t = TRANSLATIONS[settings.language];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle clock opacity on interaction
  const handleInteraction = () => {
    if (!settings.largeClock) return;
    
    setClockOpacity(0.2);
    
    if (interactionTimerRef.current) {
      clearTimeout(interactionTimerRef.current);
    }
    
    interactionTimerRef.current = setTimeout(() => {
      setClockOpacity(1);
      interactionTimerRef.current = null;
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (interactionTimerRef.current) {
        clearTimeout(interactionTimerRef.current);
      }
    };
  }, []);

  // Map SRC based on mode
  const getMapSrc = () => {
    switch (settings.mapMode) {
      case '2d': return URLS.map2d;
      case 'chart': return URLS.chart;
      default: return URLS.map3d;
    }
  };

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const qParam = !isMobile ? '&vq=hd1080' : '';

  // Video data
  const mainVideos = [
    { title: settings.language === 'zh' ? '北跑道' : t.northRunway, id: URLS.videos.northRunway },
    { title: settings.language === 'zh' ? '南跑道' : t.southRunway, id: URLS.videos.southRunway },
    { title: settings.language === 'zh' ? '北側觀景台' : t.northObs, id: URLS.videos.northObs },
    { title: settings.language === 'zh' ? '南側觀景台' : t.southObs, id: URLS.videos.southObs },
  ];

  const bottomVideoId = settings.showAtc ? URLS.videos.atc : URLS.videos.hyatt;
  const bottomVideoTitle = settings.showAtc ? t.atc : t.hyatt;
  const isAtc = settings.showAtc;

  // Pre-render Hyatt if auto-cycle is ON to avoid loading lag
  const hyattExpanded = settings.autoCycle && expandedVideo === 4;

  // Auto-cycle logic
  useEffect(() => {
    if (!settings.autoCycle) {
      if (expandedVideo !== null) setExpandedVideo(null);
      return;
    }

    // Auto-cycle expands the video
    if (expandedVideo === null) setExpandedVideo(0);

    const interval = settings.cycleInterval * 1000;
    const cycleSequence = settings.showAtc ? [0, 2, 1, 3, 4] : [0, 2, 1, 3]; 

    const timer = setInterval(() => {
      setExpandedVideo((prev) => {
        const currentIdxInSequence = prev === null ? -1 : cycleSequence.indexOf(prev);
        const nextInSequence = (currentIdxInSequence + 1) % cycleSequence.length;
        return cycleSequence[nextInSequence];
      });
    }, interval);

    return () => clearInterval(timer);
  }, [settings.autoCycle, settings.cycleInterval, settings.showAtc]);

  const toggleExpand = (idx: number) => {
    if (expandedVideo === idx) setExpandedVideo(null);
    else setExpandedVideo(idx);
  };

  return (
    <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative p-0 lg:p-2 gap-0 lg:gap-2 bg-brand-black">
      {/* Left Panel: Main Display Area (Map) - 45% width */}
      <AnimatePresence>
        {!settings.bigVideoMode && (
          <motion.div 
            initial={window.innerWidth < 1024 ? { width: '100%', opacity: 1 } : { width: '45%', opacity: 1 }}
            animate={window.innerWidth < 1024 ? { width: '100%', opacity: 1 } : { width: '45%', opacity: 1 }}
            exit={{ width: '0%', opacity: 0 }}
            className="w-full lg:w-[45%] h-[35vh] lg:h-full relative group shrink-0 lg:shrink"
            onPointerDownCapture={handleInteraction}
            onPointerMoveCapture={handleInteraction}
          >
            <div className="w-full h-full bg-brand-black border-0 lg:border border-brand-dark-gray rounded-none lg:rounded shadow-2xl overflow-hidden relative">
              <iframe 
                src={getMapSrc()} 
                className="w-full h-full border-none opacity-80 hover:opacity-100 transition-all duration-700"
                title="Map View"
              />
              
              {/* Digital Clock Overlay - No background, larger, shadows */}
              <AnimatePresence>
                {settings.largeClock && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: clockOpacity, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute bottom-14 left-8 p-0 pointer-events-none flex flex-col items-start"
                  >
                    <div 
                      className="text-[43.2px] lg:text-7xl font-mono text-white leading-none tracking-tighter tabular-nums"
                      style={{ textShadow: '0 4px 12px rgba(0,0,0,0.8), 0 0 20px rgba(255,255,255,0.2)' }}
                    >
                      {currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                    </div>
                    <div 
                      className="text-[15.12px] lg:text-[25.2px] text-[#858585] mt-0 font-bold tracking-[0.3em] uppercase tabular-nums leading-none"
                      style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                    >
                      {(() => {
                        const d = new Date(currentTime.getTime() + (8 * 60 * 60 * 1000) + (currentTime.getTimezoneOffset() * 60000));
                        const y = d.getFullYear();
                        const m = String(d.getMonth() + 1).padStart(2, '0');
                        const day = String(d.getDate()).padStart(2, '0');
                        return `${y}.${m}.${day}`;
                      })()}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Panel: Sidebar Video Grid - 55% width */}
      <div className={`flex-1 min-h-[500px] lg:h-full flex flex-col gap-2 transition-all duration-500 overflow-y-auto lg:overflow-hidden ${settings.bigVideoMode ? 'lg:w-full' : 'lg:w-[55%]'}`}>
        {/* Upper 2x2 Grid - Fixed 16:9 for the container of the 4 grid */}
        <div className="flex-none grid grid-cols-2 grid-rows-2 gap-0 shrink-0 text-nowrap aspect-video bg-brand-black">
          {(() => {
            return mainVideos.map((video, idx) => {
              const isExpanded = expandedVideo === idx;
              
              return (
                <div 
                  key={idx} 
                  className={`relative bg-brand-darkest-gray rounded-sm overflow-hidden border border-brand-dark-gray hover:border-white transition-all duration-500 ${
                    expandedVideo === null 
                      ? 'col-span-1 row-span-1' 
                      : isExpanded 
                        ? 'col-span-2 row-span-2 z-10'
                        : 'hidden'
                  }`}
                >
                  <iframe 
                    src={`https://www.youtube.com/embed/${video.id}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0${qParam}`}
                    className="w-full h-full border-none transition-all duration-500 pointer-events-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                  
                  {/* Controls - Icon only, 60% opacity black bg */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1">
                    {!settings.hideVideoTitle && (
                      <div className="px-2 py-1 bg-black/60 rounded-sm text-[9px] font-bold uppercase tracking-wide text-white border border-white/10 pointer-events-none shadow-sm backdrop-blur-sm">
                        {video.title}
                      </div>
                    )}
                    <button 
                      onClick={() => toggleExpand(idx)}
                      className="p-1.5 bg-black/60 text-white rounded-sm transition-all shadow-xl flex items-center justify-center border border-white/10 backdrop-blur-sm"
                      title={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                    </button>
                  </div>
                </div>
              );
            });
          })()}
          
          {/* Managed expanding of the 6th video (Hyatt) if auto-cycling */}
          {/* Always keeping it in DOM but hidden/visible to avoid lag */}
          <div className={`col-span-2 row-span-2 relative bg-brand-darkest-gray rounded overflow-hidden border border-white transition-all duration-500 z-10 ${hyattExpanded ? 'block' : 'hidden'}`}>
             <iframe 
                src={`https://www.youtube.com/embed/${URLS.videos.hyatt}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0${qParam}`}
                className="w-full h-full border-none pointer-events-none"
                allow="autoplay"
              />
              <div className="absolute bottom-2 left-2 flex items-center gap-1">
                 <div className="px-2 py-1 bg-black/60 rounded-sm text-[9px] font-bold uppercase tracking-wide text-white border border-white/10 pointer-events-none shadow-sm backdrop-blur-sm">
                      {settings.language === 'zh' ? '凱悅酒店' : t.hyatt}
                 </div>
                 <button 
                    onClick={() => setExpandedVideo(null)}
                    className="p-1.5 bg-black/60 text-white rounded-sm transition-all shadow-xl flex items-center justify-center border border-white/10 backdrop-blur-sm"
                  >
                    <Minimize2 size={12} />
                  </button>
              </div>
          </div>
        </div>

        {/* Lower Advanced Info Area (Bottom-Right Large Panel) - Hidden in bigVideoMode */}
        {!settings.bigVideoMode && (
          <div className="flex-grow min-h-[160px] bg-brand-darkest-gray rounded overflow-hidden border border-brand-dark-gray relative group hover:border-brand-gray transition-colors shrink">
            <iframe 
              src={`https://www.youtube.com/embed/${bottomVideoId}?autoplay=${isAtc ? 0 : 1}&mute=${isAtc ? 0 : 1}&controls=1&modestbranding=1${qParam}`}
              className={`w-full h-full border-none opacity-100 transition-all ${!isAtc ? 'pointer-events-none' : ''}`}
              allow="autoplay"
            />
            {!isAtc && !settings.hideVideoTitle && (
              <div className="absolute bottom-2 left-2 flex items-center gap-1 pointer-events-none">
                <div className="px-2 py-1 bg-black/60 rounded-sm text-[9px] font-bold uppercase tracking-wide text-white border border-white/10 shadow-sm backdrop-blur-sm">
                  {bottomVideoTitle}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      
      {/* Background Grid Pattern Deco */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0" style={{ backgroundImage: 'radial-gradient(#FFFFFF 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
    </main>
  );
};

export default Dashboard;

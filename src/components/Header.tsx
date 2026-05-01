import React, { useState, useEffect } from 'react';
import { Settings, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import html2canvas from 'html2canvas';
import { TRANSLATIONS, MARQUEE_TEXTS } from '../constants';
import { SettingsState } from '../types';

interface HeaderProps {
  settings: SettingsState;
  updateSettings: (update: Partial<SettingsState>) => void;
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ settings, updateSettings, onOpenSettings }) => {
  const [time, setTime] = useState(new Date());
  const [marqueeIndex, setMarqueeIndex] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Taipei Time is UTC+8
  const taipeiTime = new Date(time.getTime() + (8 * 60 * 60 * 1000) + (time.getTimezoneOffset() * 60000));
  
  const getSegmentsForCurrentTime = () => {
    const hours = taipeiTime.getHours();
    const minutes = taipeiTime.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    const isZh = settings.language === 'zh';

    if (totalMinutes >= 630 && totalMinutes < 660) { // 10:30 ~ 11:00
      return isZh ? [1] : [2];
    } else if (totalMinutes >= 690 && totalMinutes < 720) { // 11:30 ~ 12:00
      return isZh ? [3] : [4];
    } else if (totalMinutes >= 720 && totalMinutes < 1080) { // 12:00 ~ 18:00
      return isZh ? [5] : [6];
    } else {
      return isZh ? [7] : [8];
    }
  };

  const activeSegments = getSegmentsForCurrentTime();

  useEffect(() => {
    setMarqueeIndex(0);
    if (activeSegments.length <= 1) return;

    const timer = setInterval(() => {
      setMarqueeIndex((prev) => (prev + 1) % activeSegments.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [activeSegments]);

  const toggleLanguage = () => {
    updateSettings({ language: settings.language === 'zh' ? 'en' : 'zh' });
  };

  const takeScreenshot = async () => {
    setIsCapturing(true);
    try {
      const element = document.body;
      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#000000',
        scale: window.devicePixelRatio,
      });
      
      const link = document.createElement('a');
      link.download = `RCTP-MONITOR-Screenshot-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Screenshot failed:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  const renderMarqueeText = (textArray: string[]) => {
    return textArray.map((part, idx) => {
      let color = "text-white";
      let weight = "font-normal";
      
      const isNorth = part.includes("05L/23R") || part.includes("北跑道") || part.includes("North Runway");
      const isSouth = part.includes("05R/23L") || part.includes("南跑道") || part.includes("South Runway");
      const isTime = part.match(/\d{2}:\d{2}/);

      if (isNorth) {
        color = "text-blue-500"; 
        weight = "font-bold";
      } else if (isSouth) {
        color = "text-purple-500"; 
        weight = "font-bold";
      } else if (isTime) {
        color = "text-white";
        weight = "font-bold";
      }

      return (
        <span key={idx} className={`${color} ${weight} mx-0.5 transition-all duration-500`}>
          {part}
        </span>
      );
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const isZh = settings.language === 'zh';

  return (
    <header className="h-14 bg-brand-black flex items-center px-4 shrink-0 z-50">
      <div className="flex items-center gap-2 w-56 shrink-0">
        <button 
          onClick={onOpenSettings}
          className="aspect-square h-10 flex items-center justify-center rounded bg-brand-darkest-gray cursor-pointer hover:bg-brand-dark-gray transition-colors text-white"
        >
          <Settings size={20} />
        </button>
        <button 
          onClick={toggleLanguage}
          className="aspect-square h-10 flex items-center justify-center rounded bg-brand-darkest-gray cursor-pointer hover:bg-brand-dark-gray transition-colors"
        >
          <svg viewBox="0 0 40 40" className="w-8 h-8">
            <line x1="10" y1="30" x2="30" y2="10" stroke="#474747" strokeWidth="1.5" />
            <text x="4" y="18" className={`text-[10px] font-bold fill-current transition-colors ${isZh ? 'text-white' : 'text-[#474747]'}`} style={{ fontFamily: 'ui-sans-serif, system-ui' }}>ZH</text>
            <text x="20" y="34" className={`text-[10px] font-bold fill-current transition-colors ${!isZh ? 'text-white' : 'text-[#474747]'}`} style={{ fontFamily: 'ui-sans-serif, system-ui' }}>EN</text>
          </svg>
        </button>
        <button 
          onClick={takeScreenshot}
          disabled={isCapturing}
          className={`aspect-square h-10 flex items-center justify-center rounded bg-brand-darkest-gray cursor-pointer hover:bg-brand-dark-gray transition-colors text-white ${isCapturing ? 'opacity-50 cursor-wait' : ''}`}
        >
          <Camera size={20} />
        </button>
      </div>

      {!settings.hideTopText && (
        <>
          <div className="flex-grow h-10 flex items-center overflow-hidden px-6 mx-4 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSegments[marqueeIndex]}
                initial={{ opacity: 0, filter: 'blur(4px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(4px)' }}
                transition={{ duration: 1.0 }}
                className="w-full flex items-center justify-center"
              >
                <p className="text-xs lg:text-sm whitespace-nowrap text-brand-gray font-medium tracking-wide">
                  {renderMarqueeText(MARQUEE_TEXTS[activeSegments[marqueeIndex] as keyof typeof MARQUEE_TEXTS])}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-4 w-48 justify-end shrink-0">
            <div className="flex flex-col items-end">
              {!settings.largeClock ? (
                <>
                  <span className="text-[10px] text-brand-gray leading-none uppercase tracking-[0.2em] font-bold">TAIPEI - UTC+8</span>
                  <span className="text-xl font-mono text-white leading-none mt-1 tabular-nums">
                    {formatTime(taipeiTime)}
                  </span>
                </>
              ) : (
                <span className="text-brand-gray font-bold tracking-tight text-xs uppercase">RCTP-MONITOR</span>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;

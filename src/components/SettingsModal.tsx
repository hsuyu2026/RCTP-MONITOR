import React from 'react';
import { X, Map, Video, Layout, Info, Globe, Maximize, Minimize, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TRANSLATIONS } from '../constants';
import { Language, SettingsState } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsState;
  updateSettings: (update: Partial<SettingsState>) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, updateSettings }) => {
  const [activeTab, setActiveTab] = React.useState<'map' | 'live' | 'ui' | 'info'>('map');
  const t = TRANSLATIONS[settings.language];

  if (!isOpen) return null;

  const tabs = [
    { id: 'map', icon: <Map size={18} />, label: t.map },
    { id: 'live', icon: <Video size={18} />, label: t.live },
    { id: 'ui', icon: <Layout size={18} />, label: t.interface },
    { id: 'info', icon: <Info size={18} />, label: t.help },
  ];

  const handleToggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      updateSettings({ fullScreen: true });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        updateSettings({ fullScreen: false });
      }
    }
  };

  const isMobile = window.innerWidth < 1024;

  const Toggle = ({ active, onClick, label, disabled = false }: { active: boolean, onClick: () => void, label: string, disabled?: boolean }) => (
    <div className={`flex items-center justify-between p-3 rounded-lg bg-black/20 ${disabled ? 'opacity-50 grayscale' : ''}`}>
      <span className="text-sm">{label}</span>
      <button 
        onClick={disabled ? undefined : onClick}
        className={`w-12 h-6 rounded-full relative transition-colors duration-400 ${active ? 'bg-white' : 'bg-brand-dark-gray'}`}
      >
        <motion.div 
          initial={false}
          animate={{ x: active ? 26 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 1 }}
          className={`w-5 h-5 rounded-full absolute top-0.5 ${active ? 'bg-brand-black' : 'bg-white'}`}
        />
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
        <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-[600px] max-w-[95vw] bg-brand-black border border-brand-dark-gray rounded-xl shadow-2xl overflow-hidden relative flex flex-col h-[600px] max-h-[90vh]"
      >
        {/* Desktop Sidebar Layout */}
        <div className="flex flex-col lg:flex-row h-full overflow-hidden">
          {/* Tabs - Top horizontal on mobile, Left sidebar on desktop */}
          <div className="flex lg:flex-col overflow-x-auto lg:overflow-y-auto lg:overflow-x-hidden bg-brand-darkest-gray border-b lg:border-b-0 lg:border-r border-brand-dark-gray scrollbar-none shrink-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 lg:px-6 lg:py-4 transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-white text-brand-black font-bold' 
                    : 'text-brand-gray hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span className="text-xs lg:text-sm uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-4 lg:p-6 overflow-y-auto bg-brand-black/40">
            <AnimatePresence mode="wait">
              {activeTab === 'map' && (
                <motion.div 
                  key="map"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4"
                >
                  <h3 className="text-sm font-bold text-white border-b border-brand-dark-gray pb-2 mb-4 uppercase tracking-[0.2em]">{t.map}</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: '3d', label: t.mode3d },
                      { id: '2d', label: t.mode2d },
                      { id: 'chart', label: t.aerodromeChart }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => updateSettings({ mapMode: opt.id as any })}
                        className={`p-4 rounded border-2 text-left transition-all flex justify-between items-center ${
                          settings.mapMode === opt.id 
                            ? 'border-white bg-white/10 text-white font-bold' 
                            : 'border-brand-dark-gray hover:border-brand-gray text-brand-gray'
                        }`}
                      >
                        <span className="text-sm">{opt.label}</span>
                        {settings.mapMode === opt.id && <Check size={18} className="text-white" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'live' && (
                <motion.div key="live" className="space-y-4">
                  <h3 className="text-sm font-bold text-white border-b border-brand-dark-gray pb-2 mb-4 uppercase tracking-[0.2em]">{t.live}</h3>
                  <Toggle 
                    label={t.atc} 
                    active={settings.showAtc} 
                    onClick={() => updateSettings({ showAtc: !settings.showAtc })} 
                  />
                  <Toggle 
                    label={t.largeLiveStream} 
                    active={settings.bigVideoMode} 
                    disabled={isMobile}
                    onClick={() => {
                      if (isMobile) {
                        alert(t.mobileNotice);
                        return;
                      }
                      updateSettings({ bigVideoMode: !settings.bigVideoMode });
                    }} 
                  />
                  <Toggle 
                    label={t.hideVideoTitle} 
                    active={settings.hideVideoTitle} 
                    onClick={() => updateSettings({ hideVideoTitle: !settings.hideVideoTitle })} 
                  />
                  <Toggle 
                    label={t.autoCycle} 
                    active={settings.autoCycle} 
                    onClick={() => updateSettings({ autoCycle: !settings.autoCycle })} 
                  />
                  
                  {settings.autoCycle && (
                    <div className="p-3 rounded bg-brand-darkest-gray space-y-2 border border-brand-dark-gray">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-brand-gray">
                        <span>{t.cycleInterval}</span>
                        <span className="text-white">{settings.cycleInterval} {t.seconds}</span>
                      </div>
                      <input 
                        type="range" min="5" max="60" step="5"
                        value={settings.cycleInterval}
                        onChange={(e) => updateSettings({ cycleInterval: parseInt(e.target.value) })}
                        className="w-full accent-white"
                      />
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'ui' && (
                <motion.div key="ui" className="space-y-4">
                  <h3 className="text-sm font-bold text-white border-b border-brand-dark-gray pb-2 mb-4 uppercase tracking-[0.2em]">{t.interface}</h3>
                  <Toggle 
                    label={t.fullScreen} 
                    active={settings.fullScreen} 
                    onClick={handleToggleFullScreen} 
                  />
                  <Toggle 
                    label={t.largeClock} 
                    active={settings.largeClock} 
                    onClick={() => updateSettings({ largeClock: !settings.largeClock })} 
                  />
                  <Toggle 
                    label={t.hideTopText} 
                    active={settings.hideTopText} 
                    onClick={() => updateSettings({ hideTopText: !settings.hideTopText })} 
                  />
                </motion.div>
              )}

              {activeTab === 'info' && (
                <motion.div key="info" className="space-y-4">
                  <h3 className="text-sm font-bold text-white border-b border-brand-dark-gray pb-2 mb-4 uppercase tracking-[0.2em]">{t.help}</h3>
                  <div className="text-xs text-brand-gray leading-relaxed bg-brand-darkest-gray p-4 rounded border border-brand-dark-gray whitespace-pre-line">
                    {t.instruction}
                  </div>
                  <div className="pt-4 text-center">
                    <p className="text-[10px] text-brand-gray mb-2 uppercase tracking-widest font-bold">
                      Built by <a href="https://www.instagram.com/lucky__turtle/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">旭佑</a>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-brand-darkest-gray border-t border-brand-dark-gray flex justify-end">
          <button 
            onClick={onClose}
            className="bg-white hover:bg-brand-gray text-brand-black font-bold py-2 px-8 rounded shadow-lg transition-all flex items-center gap-2 uppercase text-xs"
          >
            <Check size={14} />
            {t.done}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsModal;

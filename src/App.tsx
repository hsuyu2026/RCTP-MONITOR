import { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import SettingsModal from './components/SettingsModal';
import DisclaimerModal from './components/DisclaimerModal';
import { SettingsState } from './types';
import { INITIAL_SETTINGS } from './constants';

export default function App() {
  const [settings, setSettings] = useState<SettingsState>(() => {
    const saved = localStorage.getItem('rctp_settings');
    if (saved) {
      try {
        return { ...INITIAL_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        return INITIAL_SETTINGS;
      }
    }
    // Auto-detect browser language if no saved settings
    const browserLang = navigator.language.startsWith('zh') ? 'zh' : 'en';
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    return { 
      ...INITIAL_SETTINGS, 
      language: browserLang,
      hideTopText: isMobile ? true : INITIAL_SETTINGS.hideTopText,
      largeClock: isMobile ? false : INITIAL_SETTINGS.largeClock
    };
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(() => {
    const hiddenUntil = localStorage.getItem('rctp_disclaimer_hidden_until');
    if (hiddenUntil) {
      return Date.now() < parseInt(hiddenUntil);
    }
    return true; // true means "need to show", I'll invert it in logic below or change name
  });

  // Re-evaluating logic: showDisclaimer should be true if we SHOULD show it.
  const [needDisclaimer, setNeedDisclaimer] = useState(() => {
    const hiddenUntil = localStorage.getItem('rctp_disclaimer_hidden_until');
    if (hiddenUntil) {
      return Date.now() > parseInt(hiddenUntil);
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem('rctp_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (update: Partial<SettingsState>) => {
    setSettings(prev => ({ ...prev, ...update }));
  };

  const handleConfirmDisclaimer = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      const until = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem('rctp_disclaimer_hidden_until', until.toString());
    }
    setNeedDisclaimer(false);
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden select-none bg-brand-black">
      <Header 
        settings={settings} 
        updateSettings={updateSettings} 
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      
      <Dashboard settings={settings} />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        updateSettings={updateSettings}
      />

      {needDisclaimer && (
        <DisclaimerModal 
          language={settings.language} 
          onConfirm={handleConfirmDisclaimer} 
        />
      )}
    </div>
  );
}

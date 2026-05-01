import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Check } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface DisclaimerModalProps {
  language: Language;
  onConfirm: (dontShowAgain: boolean) => void;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ language, onConfirm }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const t = TRANSLATIONS[language];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-brand-black border border-brand-dark-gray rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="p-6 border-b border-brand-dark-gray flex items-center gap-3 bg-brand-darkest-gray">
          <div className="bg-white/10 p-2 rounded-full">
            <AlertCircle className="text-white" size={24} />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white uppercase italic">
            NOTICE / 免責聲明
          </h2>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar">
          <div className="space-y-6 text-brand-gray text-sm leading-relaxed">
            {t.disclaimer.split('\n\n').map((para: string, idx: number) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        </div>

        <div className="p-6 bg-brand-darkest-gray border-t border-brand-dark-gray flex flex-col gap-4">
          <button 
            onClick={() => setDontShowAgain(!dontShowAgain)}
            className="flex items-center gap-3 group cursor-pointer w-fit"
          >
            <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${dontShowAgain ? 'border-white bg-white' : 'border-brand-gray group-hover:border-white'}`}>
              {dontShowAgain && <Check size={14} className="text-brand-black font-bold" />}
            </div>
            <span className={`text-xs font-bold transition-colors ${dontShowAgain ? 'text-white' : 'text-brand-gray group-hover:text-white'}`}>
              {t.dontShowAgain}
            </span>
          </button>

          <button
            onClick={() => onConfirm(dontShowAgain)}
            className="w-full bg-white text-brand-black font-bold py-3 rounded-lg hover:bg-brand-gray transition-colors uppercase tracking-widest text-sm"
          >
            {t.confirm}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default DisclaimerModal;

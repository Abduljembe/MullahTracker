import React, { useState } from 'react';
import { Download, Smartphone, CheckCircle, Info, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall.ts';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'full' | 'sidebar';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'compact' }) => {
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();
  const [showInstructions, setShowInstructions] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      await promptInstall();
    } else {
      setShowInstructions(true);
    }
  };

  if (variant === 'sidebar') {
    return (
      <>
        <button
          onClick={handleClick}
          className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-semibold transition-all cursor-pointer group"
          title="Install MullahTracker as a standalone app"
        >
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#0df2c9] group-hover:scale-110 transition-transform" />
            <span>Install Web App</span>
          </div>
          <span className="text-[10px] bg-teal-500/20 text-[#0df2c9] px-1.5 py-0.5 rounded font-mono">PWA</span>
        </button>

        {showInstructions && (
          <InstallInstructionsModal onClose={() => setShowInstructions(false)} />
        )}
      </>
    );
  }

  if (variant === 'full') {
    return (
      <>
        <button
          onClick={handleClick}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0df2c9] text-black font-bold text-xs hover:bg-[#0df2c9]/90 transition-all shadow-[0_0_15px_rgba(13,242,201,0.25)] cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>

        {showInstructions && (
          <InstallInstructionsModal onClose={() => setShowInstructions(false)} />
        )}
      </>
    );
  }

  // Compact Header variant
  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0e1726] hover:bg-[#15233c] text-teal-300 border border-teal-500/30 text-xs font-medium transition-colors cursor-pointer"
        title="Install MullahTracker App"
      >
        <Download className="w-3.5 h-3.5 text-[#0df2c9]" />
        <span className="hidden sm:inline">Install</span>
      </button>

      {showInstructions && (
        <InstallInstructionsModal onClose={() => setShowInstructions(false)} />
      )}
    </>
  );
};

const InstallInstructionsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0b121e] border border-[#162540] rounded-2xl max-w-sm w-full p-5 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-[#141f33]">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Smartphone className="w-4 h-4 text-[#0df2c9]" />
            <span>Install MullahTracker App</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-[#070b13] border border-[#15233c]">
            <div className="font-semibold text-white mb-1">On iOS (iPhone / iPad):</div>
            <ol className="list-decimal list-inside space-y-1 text-slate-400">
              <li>Tap the <strong className="text-white">Share</strong> button in Safari (bottom bar)</li>
              <li>Scroll down and tap <strong className="text-white">Add to Home Screen</strong></li>
              <li>Tap <strong className="text-[#0df2c9]">Add</strong> in the top-right corner</li>
            </ol>
          </div>

          <div className="p-3 rounded-xl bg-[#070b13] border border-[#15233c]">
            <div className="font-semibold text-white mb-1">On Android / Chrome:</div>
            <ol className="list-decimal list-inside space-y-1 text-slate-400">
              <li>Tap the three dots <strong className="text-white">(⋮)</strong> in Chrome</li>
              <li>Select <strong className="text-white">Install app</strong> or <strong className="text-white">Add to Home screen</strong></li>
            </ol>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 rounded-xl bg-teal-500/20 text-[#0df2c9] border border-teal-500/30 text-xs font-semibold hover:bg-teal-500/30 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

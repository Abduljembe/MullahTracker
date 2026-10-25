import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Download,
  Smartphone,
  CheckCircle,
  Info,
  X,
  WifiOff,
  Zap,
  ShieldCheck,
  Maximize2,
  Share,
  PlusSquare,
  Sparkles,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall.ts';
import { AppLogoIcon } from '../common/AppLogo.tsx';

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
      const installed = await promptInstall();
      if (!installed) {
        setShowInstructions(true);
      }
    } else {
      setShowInstructions(true);
    }
  };

  return (
    <>
      {variant === 'sidebar' && (
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
      )}

      {variant === 'full' && (
        <button
          onClick={handleClick}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0df2c9] text-black font-bold text-xs hover:bg-[#0df2c9]/90 transition-all shadow-[0_0_15px_rgba(13,242,201,0.25)] cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>
      )}

      {variant === 'compact' && (
        <button
          onClick={handleClick}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0e1726] hover:bg-[#15233c] text-teal-300 border border-teal-500/30 text-xs font-medium transition-colors cursor-pointer"
          title="Install MullahTracker App"
        >
          <Download className="w-3.5 h-3.5 text-[#0df2c9]" />
          <span className="hidden sm:inline">Install</span>
        </button>
      )}

      {showInstructions && (
        <InstallInstructionsModal
          isInstallable={isInstallable}
          onPromptInstall={async () => {
            const success = await promptInstall();
            if (success) setShowInstructions(false);
          }}
          onClose={() => setShowInstructions(false)}
        />
      )}
    </>
  );
};

interface InstallModalProps {
  isInstallable: boolean;
  onPromptInstall: () => Promise<void>;
  onClose: () => void;
}

const InstallInstructionsModal: React.FC<InstallModalProps> = ({
  isInstallable,
  onPromptInstall,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg my-auto rounded-2xl bg-[#0b121e] border border-[#182744] shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header - Always fully visible and anchored */}
        <div className="sticky top-0 z-20 bg-[#0b121e] px-5 py-3.5 border-b border-[#141f33] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <AppLogoIcon sizePx={28} />
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Install MullahTracker</span>
                <span className="text-[10px] bg-teal-500/20 text-[#0df2c9] px-1.5 py-0.2 rounded font-mono">
                  v1.0 PWA
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Install to home screen or desktop for the best experience</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto p-5 space-y-4 flex-1">
          {/* Direct 1-Click Install Button if browser supports it */}
          {isInstallable && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-teal-500/15 to-cyan-500/15 border border-teal-500/40 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0df2c9]" />
                  <span>Ready to install directly</span>
                </div>
                <div className="text-[11px] text-slate-300">Your browser supports instant 1-click installation</div>
              </div>
              <button
                onClick={onPromptInstall}
                className="px-4 py-2 rounded-xl bg-[#0df2c9] text-black font-bold text-xs hover:bg-[#0df2c9]/90 transition-all shadow-[0_0_15px_rgba(13,242,201,0.3)] shrink-0 cursor-pointer"
              >
                Install Now
              </button>
            </div>
          )}

          {/* Features Available Under Installation */}
          <div className="p-4 rounded-xl bg-[#070b13] border border-[#142036] space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#0df2c9]" />
              <span>Features Unlocked Under Installation</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#0c1424] border border-[#172640] flex items-start gap-2">
                <WifiOff className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">100% Offline Capability</div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                    Record expenses, check balances, & calculate yields without data connection.
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0c1424] border border-[#172640] flex items-start gap-2">
                <Maximize2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Full-Screen Standalone</div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                    No browser URL bar or navigation buttons. Runs like a native mobile app.
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0c1424] border border-[#172640] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Secure Encrypted Cache</div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                    Fast encrypted local device storage syncs seamlessly to your cloud vault.
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0c1424] border border-[#172640] flex items-start gap-2">
                <Smartphone className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Instant Home Screen Launch</div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                    Zero reload delay; launches immediately from your phone app drawer or dock.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Manual Installation Guide
            </div>

            {/* iOS Instructions */}
            <div className="p-3.5 rounded-xl bg-[#080d17] border border-[#15233c] space-y-2">
              <div className="font-bold text-white text-xs flex items-center justify-between">
                <span>Apple iOS (iPhone / iPad - Safari)</span>
                <span className="text-[10px] text-teal-400 font-mono">Safari Browser</span>
              </div>
              <ol className="space-y-1.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-500/20 text-[#0df2c9] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Tap the <strong className="text-white">Share</strong> button at the bottom of Safari (
                    <Share className="inline w-3.5 h-3.5 text-cyan-400 mx-0.5" /> square with arrow pointing up).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-500/20 text-[#0df2c9] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Scroll down and tap <strong className="text-white">Add to Home Screen</strong> (
                    <PlusSquare className="inline w-3.5 h-3.5 text-teal-400 mx-0.5" />).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-500/20 text-[#0df2c9] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    Tap <strong className="text-[#0df2c9]">Add</strong> in the top-right corner to complete.
                  </span>
                </li>
              </ol>
            </div>

            {/* Android / Chrome Instructions */}
            <div className="p-3.5 rounded-xl bg-[#080d17] border border-[#15233c] space-y-2">
              <div className="font-bold text-white text-xs flex items-center justify-between">
                <span>Android & Google Chrome</span>
                <span className="text-[10px] text-teal-400 font-mono">Chrome / Edge</span>
              </div>
              <ol className="space-y-1.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-500/20 text-[#0df2c9] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Tap the three dots menu <strong className="text-white">(⋮)</strong> in the top-right corner.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-500/20 text-[#0df2c9] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Select <strong className="text-white">Install app</strong> or <strong className="text-white">Add to Home screen</strong>.
                  </span>
                </li>
              </ol>
            </div>

            {/* Desktop Windows / Mac Instructions */}
            <div className="p-3.5 rounded-xl bg-[#080d17] border border-[#15233c] space-y-1.5">
              <div className="font-bold text-white text-xs flex items-center justify-between">
                <span>Desktop (Mac / Windows / Linux)</span>
                <span className="text-[10px] text-teal-400 font-mono">Chrome / Brave / Edge</span>
              </div>
              <p className="text-xs text-slate-300">
                Look for the <strong className="text-white">Install icon</strong> (
                <Download className="inline w-3 h-3 text-[#0df2c9] mx-0.5" />) on the right side of your address bar and click it.
              </p>
            </div>
          </div>
        </div>

        {/* Footer - Always anchored and visible */}
        <div className="sticky bottom-0 bg-[#0b121e] px-5 py-3 border-t border-[#141f33] flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-400">Works across iOS, Android, and Desktop</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-teal-500/20 text-[#0df2c9] hover:bg-teal-500/30 border border-teal-500/30 text-xs font-bold transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

import React, { useState, useEffect } from 'react';
import { WifiOff, CloudOff, RefreshCw } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-[#0f172a]/95 border border-amber-500/40 text-amber-300 shadow-2xl backdrop-blur-md flex items-center gap-2.5 text-xs font-medium animate-bounce">
      <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
      <span>Working Offline • Entries are saved to local vault and will sync once reconnected</span>
    </div>
  );
};

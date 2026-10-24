import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, Share, PlusSquare, X, CheckCircle2 } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'nav' | 'card' | 'compact';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'nav' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already running in standalone PWA window, do not render any extra status banner
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      {variant === 'card' ? (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight">Install ScholarHub App</div>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Add to your phone or desktop home screen for instant offline access and status notifications.
              </p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 transition-colors shrink-0 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Install Now</span>
          </button>
        </div>
      ) : variant === 'compact' ? (
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
          title="Install ScholarHub on your device"
        >
          <Download className="w-3.5 h-3.5 text-emerald-600" />
          <span>Install App</span>
        </button>
      ) : (
        <button
          onClick={handleInstallClick}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
          title="Install ScholarHub on your device"
        >
          <Download className="w-3.5 h-3.5 text-emerald-600" />
          <span>Install App</span>
        </button>
      )}

      {/* Guide Modal for iOS Safari / Manual Installation */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl border border-slate-200 shadow-2xl p-6 relative">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900">
              {isIOS ? 'Install on iPhone / iPad' : 'Add to Your Device'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Install ScholarHub for full-screen view and quick home-screen access.
            </p>

            {isIOS ? (
              <div className="mt-4 space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 font-bold text-[11px] flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    Tap the <strong className="inline-flex items-center gap-1 font-semibold text-slate-900"><Share className="w-3 h-3 text-blue-600" /> Share</strong> button in Safari's bottom toolbar.
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 font-bold text-[11px] flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    Scroll down and select <strong className="inline-flex items-center gap-1 font-semibold text-slate-900"><PlusSquare className="w-3 h-3 text-slate-700" /> Add to Home Screen</strong>.
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 font-bold text-[11px] flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    Tap <strong className="text-slate-900">Add</strong> in the top right to complete.
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-700">
                <p>
                  To install on your current browser:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-1 text-[11px] text-slate-600">
                  <li><strong>Chrome/Edge (Desktop):</strong> Click the install icon <Download className="w-3 h-3 inline text-emerald-600" /> in the browser address bar.</li>
                  <li><strong>Android:</strong> Tap the browser menu (⋮) and select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                </ul>
              </div>
            )}

            <button
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

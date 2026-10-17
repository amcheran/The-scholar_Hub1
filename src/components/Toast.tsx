import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastMessage } from '../types';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';

interface ToastContextType {
  showToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((title: string, message?: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    const newToast: ToastMessage = { id, title, message, type };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          let icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
          let border = 'border-emerald-200 bg-emerald-50/95 text-emerald-900';

          if (toast.type === 'info') {
            icon = <Info className="w-5 h-5 text-blue-600 shrink-0" />;
            border = 'border-blue-200 bg-blue-50/95 text-blue-900';
          } else if (toast.type === 'warning') {
            icon = <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />;
            border = 'border-amber-200 bg-amber-50/95 text-amber-900';
          } else if (toast.type === 'error') {
            icon = <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />;
            border = 'border-rose-200 bg-rose-50/95 text-rose-900';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-200 animate-in fade-in slide-in-from-top-4 ${border}`}
            >
              {icon}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{toast.title}</div>
                {toast.message && <div className="text-xs opacity-90 mt-0.5 leading-relaxed">{toast.message}</div>}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 p-1 -mr-1 -mt-1 rounded-md transition-colors"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

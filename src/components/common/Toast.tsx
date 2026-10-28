import React from 'react';
import { useCart } from '../../context/CartContext.tsx';
import { CheckCircle2, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { notification, clearNotification } = useCart();

  if (!notification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center justify-between gap-3 border border-slate-800 transition-all">
      <div className="flex items-center gap-2.5">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        <span className="text-sm font-medium">{notification}</span>
      </div>
      <button
        onClick={clearNotification}
        className="text-slate-400 hover:text-white transition-colors p-1"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

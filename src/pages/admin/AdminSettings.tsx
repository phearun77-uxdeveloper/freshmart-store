import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import { StoreSetting } from '../../types/index.ts';
import { Settings, Save, CheckCircle2, AlertCircle } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [settingsMap, setSettingsMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    api.getAdminSettings()
      .then((res) => {
        if (isMounted) {
          const map: Record<string, string> = {};
          (res.settings || []).forEach((s: StoreSetting) => {
            map[s.key] = s.value;
          });
          setSettingsMap(map);
        }
      })
      .catch((err) => {
        console.error('Error fetching settings:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const handleChange = (key: string, val: string) => {
    setSettingsMap((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const payload = Object.entries(settingsMap).map(([key, value]) => ({
        key,
        value,
      }));

      await api.updateAdminSettings(payload);
      setMessage('Store settings updated and applied successfully.');
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to save store settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl">
        <div className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">Store Configuration & Logistics</h1>
        <p className="text-xs text-slate-500 mt-1">
          Adjust delivery fees, free delivery threshold, and supermarket operating hours
        </p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Supermarket Name</label>
          <input
            type="text"
            required
            value={settingsMap.STORE_NAME || 'FreshMart Supermarket'}
            onChange={(e) => handleChange('STORE_NAME', e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Support Contact Email</label>
            <input
              type="email"
              required
              value={settingsMap.STORE_EMAIL || 'support@freshmart.local'}
              onChange={(e) => handleChange('STORE_EMAIL', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Support Phone</label>
            <input
              type="text"
              required
              value={settingsMap.STORE_PHONE || '+1 (800) 555-FRES'}
              onChange={(e) => handleChange('STORE_PHONE', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Standard Delivery Fee ($)</label>
            <input
              type="number"
              step="0.01"
              required
              value={settingsMap.DELIVERY_FEE || '4.99'}
              onChange={(e) => handleChange('DELIVERY_FEE', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg tabular-nums focus:outline-emerald-600"
            />
            <span className="text-[11px] text-slate-400 mt-0.5 block">Applied to orders below the free threshold</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Free Delivery Threshold ($)</label>
            <input
              type="number"
              step="0.01"
              required
              value={settingsMap.FREE_DELIVERY_THRESHOLD || '45.00'}
              onChange={(e) => handleChange('FREE_DELIVERY_THRESHOLD', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg tabular-nums focus:outline-emerald-600"
            />
            <span className="text-[11px] text-slate-400 mt-0.5 block">Orders above this subtotal qualify for free delivery</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Store Operating Hours</label>
          <input
            type="text"
            required
            value={settingsMap.STORE_HOURS || 'Mon - Sun: 7:00 AM - 10:00 PM'}
            onChange={(e) => handleChange('STORE_HOURS', e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

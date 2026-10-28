import React from 'react';
import { ShieldCheck, Truck, Clock, HeartHandshake } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      {/* 4 Trust Markers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-b border-slate-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Same-Day Farm Delivery</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Orders placed before 2 PM arrive same evening in temperature-controlled vans.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">100% Freshness Guarantee</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                If produce isn't completely crisp, we refund or replace it instantly.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Open 7 Days a Week</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Customer support & dispatch from 7:00 AM to 10:00 PM every day.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Cash on Delivery Available</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Inspect your fresh groceries at your doorstep before handing over payment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Links & Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900">FreshMart Supermarket</span>
          <span>·</span>
          <span>Real-Time E-Commerce Engine</span>
          <span>·</span>
          <span>Local SQLite / PostgreSQL Dual-Engine</span>
        </div>

        <div className="flex items-center gap-6">
          <span>COD Supported</span>
          <span>Prisma ORM</span>
          <span>Express REST API</span>
          <span>© 2026 FreshMart Inc.</span>
        </div>
      </div>
    </footer>
  );
};

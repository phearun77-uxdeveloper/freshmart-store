import React from 'react';
import { Leaf, Truck, ShieldCheck, HeartHandshake, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Editorial Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold">
          <Leaf className="w-3.5 h-3.5 text-emerald-600" />
          <span>Our Story & Sourcing Philosophy</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
          Redefining the Online Supermarket Experience
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          FreshMart was founded on a simple truth: groceries shouldn't sit in distribution depots for weeks. We connect regional organic farms directly to neighborhood doorsteps.
        </p>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Leaf className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Direct Farm Partnerships</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            We partner directly with certified organic family farms within a 150-mile radius, ensuring fair producer compensation and minimal transit time.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Truck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Dedicated Cold-Chain Vans</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            From our packing depot to your front porch, leafy greens, wild seafood, and farm dairy stay at steady optimal chilled temperatures.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Doorstep Inspection First</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            With Cash on Delivery, you are always welcome to inspect the freshness of your fruit, vegetables, and milk before making payment.
          </p>
        </div>
      </div>

      {/* Sourcing Standards */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 font-display">Our Quality Standards</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>100% Non-GMO heirloom produce</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Pasture-raised, hormone-free dairy & eggs</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Wild, sustainably certified Pacific fisheries</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Recyclable and compostable packaging</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  LayoutDashboard,
  Package,
  Layers,
  ClipboardList,
  Boxes,
  Users,
  Settings,
  ArrowLeft,
  Shield,
  LogOut,
  Store,
} from 'lucide-react';

interface AdminLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onReturnToStore: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  onReturnToStore,
  children,
}) => {
  const { user, logout } = useAuth();

  const navigationItems = [
    { key: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { key: 'products', label: 'Product Catalog', icon: Package },
    { key: 'categories', label: 'Categories', icon: Layers },
    { key: 'inventory', label: 'Inventory & Audit', icon: Boxes },
    { key: 'orders', label: 'Orders & Fulfillment', icon: ClipboardList },
    { key: 'customers', label: 'Customer Base', icon: Users },
    { key: 'settings', label: 'Store Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        {/* Brand Lockup */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              FM
            </div>
            <div>
              <span className="text-sm font-bold text-white block">FreshMart Admin</span>
              <span className="text-[10px] text-emerald-400 font-medium">Control Console</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1 flex-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelectTab(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            type="button"
            onClick={onReturnToStore}
            className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Store className="w-3.5 h-3.5 text-emerald-400" />
            <span>View Live Storefront</span>
          </button>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-400 px-1">
            <div className="truncate">
              <span className="text-white font-medium block truncate">{user?.name}</span>
              <span className="text-[10px] text-slate-500 uppercase">Super Admin</span>
            </div>
            <button
              type="button"
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-md transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { ShoppingBag, Search, User as UserIcon, Shield, LogOut, ChevronDown, Sparkles, Store, ShoppingCart } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: any) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  searchQuery,
  onSearchChange,
}) => {
  const { user, isAdmin, logout, openAuthModal, quickDemoLogin } = useAuth();
  const { itemCount, openCart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Promotion Bar (Single slim row, <=40px) */}
      <div className="bg-emerald-800 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        <span>Free same-day delivery on all organic farm orders over $45 · Freshness Guaranteed</span>
      </div>

      {/* Main Top Bar Contract: Zone 1 (Wordmark) — Zone 2 (Nav Links) — Zone 3 (Actions) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-slate-900 group focus:outline-hidden"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-xs group-hover:bg-emerald-700 transition-colors">
              FM
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xl font-bold tracking-tight text-slate-900 font-display">
                Fresh<span className="text-emerald-600">Mart</span>
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Single-Line Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => onNavigate('home')}
            className={`transition-colors whitespace-nowrap hover:text-slate-900 ${
              currentView === 'home' ? 'text-emerald-700 font-semibold' : ''
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('catalog')}
            className={`transition-colors whitespace-nowrap hover:text-slate-900 ${
              currentView === 'catalog' ? 'text-emerald-700 font-semibold' : ''
            }`}
          >
            Shop Catalog
          </button>
          <button
            onClick={() => onNavigate('deals')}
            className={`transition-colors whitespace-nowrap hover:text-slate-900 ${
              currentView === 'deals' ? 'text-emerald-700 font-semibold' : ''
            }`}
          >
            Weekly Deals
          </button>
          <button
            onClick={() => onNavigate('about')}
            className={`transition-colors whitespace-nowrap hover:text-slate-900 ${
              currentView === 'about' ? 'text-emerald-700 font-semibold' : ''
            }`}
          >
            Our Guarantee
          </button>
          {isAdmin && (
            <button
              onClick={() => onNavigate('admin-dashboard')}
              className="text-amber-700 font-semibold flex items-center gap-1 hover:text-amber-800 whitespace-nowrap"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Search + Cart + Account Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick Search Input */}
          <div className="relative hidden lg:block w-52 xl:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search groceries..."
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (currentView !== 'catalog') onNavigate('catalog');
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-emerald-600"
            />
          </div>

          {/* Cart Bag Button */}
          <button
            onClick={openCart}
            type="button"
            className="relative p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
            aria-label={`Open shopping cart with ${itemCount} items`}
          >
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center tabular-nums shadow-xs">
                {itemCount}
              </span>
            )}
          </button>

          {/* Account Dropdown */}
          <div className="relative" ref={menuRef}>
            {user ? (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5 text-emerald-700" />
                <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>
            ) : (
              <button
                onClick={openAuthModal}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
              >
                Sign In
              </button>
            )}

            {/* Account Popover Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                {user ? (
                  <>
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {user.role}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onNavigate('orders');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Order History</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onNavigate('admin-dashboard');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-amber-700 font-semibold hover:bg-amber-50 flex items-center gap-2"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Admin Dashboard</span>
                      </button>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Switch Role (Demo)
                    </div>
                    <button
                      onClick={async () => {
                        await quickDemoLogin(user.role === 'ADMIN' ? 'customer' : 'admin');
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-1.5 text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Store className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Switch to {user.role === 'ADMIN' ? 'Demo Customer' : 'Demo Admin'}</span>
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { Navbar } from './components/common/Navbar.tsx';
import { Footer } from './components/common/Footer.tsx';
import { CartDrawer } from './components/common/CartDrawer.tsx';
import { AuthModal } from './components/common/AuthModal.tsx';
import { Toast } from './components/common/Toast.tsx';

// Storefront Pages
import { HomePage } from './pages/HomePage.tsx';
import { CatalogPage } from './pages/CatalogPage.tsx';
import { ProductDetailPage } from './pages/ProductDetailPage.tsx';
import { CheckoutPage } from './pages/CheckoutPage.tsx';
import { OrderHistoryPage } from './pages/OrderHistoryPage.tsx';
import { DealsPage } from './pages/DealsPage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';

// Admin Pages
import { AdminLayout } from './pages/admin/AdminLayout.tsx';
import { AdminDashboard } from './pages/admin/AdminDashboard.tsx';
import { AdminProducts } from './pages/admin/AdminProducts.tsx';
import { AdminCategories } from './pages/admin/AdminCategories.tsx';
import { AdminInventory } from './pages/admin/AdminInventory.tsx';
import { AdminOrders } from './pages/admin/AdminOrders.tsx';
import { AdminCustomers } from './pages/admin/AdminCustomers.tsx';
import { AdminSettings } from './pages/admin/AdminSettings.tsx';

import { Product } from './types/index.ts';
import { ShieldAlert } from 'lucide-react';

function FreshMartApp() {
  const { user, isAdmin, openAuthModal, quickDemoLogin } = useAuth();

  // Navigation State
  const [currentView, setCurrentView] = useState<string>('home');
  const [catalogInitialCategory, setCatalogInitialCategory] = useState<string | undefined>(undefined);
  const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Admin Tab State
  const [adminTab, setAdminTab] = useState<string>('dashboard');

  const handleNavigate = (view: string, param?: any) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (view === 'catalog') {
      if (param?.category) {
        setCatalogInitialCategory(param.category);
      } else {
        setCatalogInitialCategory('ALL');
      }
      setCurrentView('catalog');
    } else if (view === 'product-detail' && typeof param === 'string') {
      setSelectedProductSlug(param);
      setCurrentView('product-detail');
    } else if (view === 'orders') {
      if (typeof param === 'number') {
        setSelectedOrderId(param);
      } else {
        setSelectedOrderId(null);
      }
      setCurrentView('orders');
    } else {
      setCurrentView(view);
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProductSlug(product.slug);
    setCurrentView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render Admin Layout if in admin view
  if (currentView.startsWith('admin')) {
    if (!isAdmin) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-md text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Administrator Access Required</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              You must be logged in as an authorized store administrator to view the management console.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={async () => {
                  await quickDemoLogin('admin');
                }}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                1-Click Sign In as Demo Administrator
              </button>
              <button
                type="button"
                onClick={() => setCurrentView('home')}
                className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Return to Storefront
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <AdminLayout
        currentTab={adminTab}
        onSelectTab={setAdminTab}
        onReturnToStore={() => setCurrentView('home')}
      >
        {adminTab === 'dashboard' && <AdminDashboard onNavigateToTab={setAdminTab} />}
        {adminTab === 'products' && <AdminProducts />}
        {adminTab === 'categories' && <AdminCategories />}
        {adminTab === 'inventory' && <AdminInventory />}
        {adminTab === 'orders' && <AdminOrders />}
        {adminTab === 'customers' && <AdminCustomers />}
        {adminTab === 'settings' && <AdminSettings />}
      </AdminLayout>
    );
  }

  // Customer Storefront Layout
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {currentView === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentView === 'catalog' && (
          <CatalogPage
            initialCategory={catalogInitialCategory}
            initialSearch={searchQuery}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentView === 'product-detail' && selectedProductSlug && (
          <ProductDetailPage
            productSlug={selectedProductSlug}
            onBack={() => setCurrentView('catalog')}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutPage
            onBackToCatalog={() => setCurrentView('catalog')}
            onViewOrder={(orderId) => handleNavigate('orders', orderId)}
          />
        )}

        {currentView === 'orders' && (
          <OrderHistoryPage
            onBackToCatalog={() => setCurrentView('catalog')}
            selectedOrderId={selectedOrderId}
          />
        )}

        {currentView === 'deals' && (
          <DealsPage
            onBackToCatalog={() => setCurrentView('catalog')}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentView === 'about' && <AboutPage />}
      </main>

      <Footer />

      {/* Global Drawers & Modals */}
      <CartDrawer onNavigateToCheckout={() => setCurrentView('checkout')} />
      <AuthModal />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <FreshMartApp />
      </CartProvider>
    </AuthProvider>
  );
}

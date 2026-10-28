import { Router } from 'express';
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/auth.js';
import * as authCtrl from '../controllers/authController.js';
import * as categoryCtrl from '../controllers/categoryController.js';
import * as productCtrl from '../controllers/productController.js';
import * as cartCtrl from '../controllers/cartController.js';
import * as orderCtrl from '../controllers/orderController.js';
import * as adminCtrl from '../controllers/adminController.js';

export const apiRouter = Router();

// ================= AUTHENTICATION =================
apiRouter.post('/auth/register', authCtrl.register);
apiRouter.post('/auth/login', authCtrl.login);
apiRouter.post('/auth/logout', authCtrl.logout);
apiRouter.get('/auth/me', requireAuth, authCtrl.getMe);

// ================= CATEGORIES =================
apiRouter.get('/categories', optionalAuth, categoryCtrl.getCategories);
apiRouter.get('/categories/:id', categoryCtrl.getCategoryById);
apiRouter.post('/categories', requireAdmin, categoryCtrl.createCategory);
apiRouter.patch('/categories/:id', requireAdmin, categoryCtrl.updateCategory);
apiRouter.delete('/categories/:id', requireAdmin, categoryCtrl.deleteCategory);

// ================= PRODUCTS =================
apiRouter.get('/products', optionalAuth, productCtrl.getProducts);
apiRouter.get('/products/slug/:slug', productCtrl.getProductBySlug);
apiRouter.get('/products/:id', productCtrl.getProductById);
apiRouter.post('/products', requireAdmin, productCtrl.createProduct);
apiRouter.patch('/products/:id', requireAdmin, productCtrl.updateProduct);
apiRouter.delete('/products/:id', requireAdmin, productCtrl.deleteProduct);

// ================= CART =================
apiRouter.get('/cart', requireAuth, cartCtrl.getCart);
apiRouter.post('/cart/items', requireAuth, cartCtrl.addItem);
apiRouter.patch('/cart/items/:id', requireAuth, cartCtrl.updateItem);
apiRouter.delete('/cart/items/:id', requireAuth, cartCtrl.removeItem);
apiRouter.delete('/cart', requireAuth, cartCtrl.clearCart);
apiRouter.post('/cart/sync', requireAuth, cartCtrl.syncGuestCart);

// ================= ORDERS =================
apiRouter.post('/orders', requireAuth, orderCtrl.createOrder);
apiRouter.get('/orders/my', requireAuth, orderCtrl.getMyOrders);
apiRouter.get('/orders/:id', requireAuth, orderCtrl.getOrderById);

// ================= ADMIN DASHBOARD & CONTROLS =================
apiRouter.get('/admin/dashboard', requireAdmin, adminCtrl.getDashboardKPIs);
apiRouter.get('/admin/orders', requireAdmin, adminCtrl.getAllOrders);
apiRouter.patch('/admin/orders/:id/status', requireAdmin, adminCtrl.updateOrderStatus);
apiRouter.get('/admin/customers', requireAdmin, adminCtrl.getAllCustomers);
apiRouter.get('/admin/inventory', requireAdmin, adminCtrl.getInventory);
apiRouter.post('/admin/inventory/adjustments', requireAdmin, adminCtrl.createInventoryAdjustment);
apiRouter.get('/admin/settings', requireAdmin, adminCtrl.getSettings);
apiRouter.patch('/admin/settings', requireAdmin, adminCtrl.updateSettings);

// Public settings route (for delivery fee and minimum threshold)
apiRouter.get('/settings/public', async (req, res) => {
  try {
    const { prisma } = await import('../db.js');
    const settings = await prisma.storeSetting.findMany();
    const map: Record<string, string> = {};
    settings.forEach(s => { map[s.key] = s.value; });
    res.json({ settings: map });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve public settings' });
  }
});

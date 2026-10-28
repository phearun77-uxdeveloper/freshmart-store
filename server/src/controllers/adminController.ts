import { Request, Response } from 'express';
import { prisma } from '../db.js';
import { inventoryAdjustmentSchema, updateOrderStatusSchema } from '../validators/schemas.js';

export async function getDashboardKPIs(req: Request, res: Response) {
  try {
    const [
      totalProducts,
      totalCategories,
      totalCustomers,
      totalOrders,
      pendingOrders,
      lowStockProducts,
      recentOrders,
      deliveredOrders,
    ] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.category.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.product.findMany({
        where: {
          isActive: true,
          stockQuantity: { lte: 10 }
        },
        include: { category: true },
        take: 8,
        orderBy: { stockQuantity: 'asc' }
      }),
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          _count: { select: { items: true } }
        }
      }),
      prisma.order.findMany({
        where: {
          status: { in: ['DELIVERED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY'] }
        },
        select: { totalAmount: true }
      }),
    ]);

    const totalSales = deliveredOrders.reduce((acc, curr) => acc + curr.totalAmount, 0);

    // Order status distribution
    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    return res.json({
      kpis: {
        totalProducts,
        totalCategories,
        totalCustomers,
        totalOrders,
        pendingOrders,
        lowStockCount: lowStockProducts.length,
        totalSales: parseFloat(totalSales.toFixed(2)),
      },
      lowStockAlerts: lowStockProducts,
      recentOrders,
      statusDistribution: statusCounts.map(sc => ({
        status: sc.status,
        count: sc._count.id
      }))
    });
  } catch (err) {
    console.error('Error fetching dashboard KPIs:', err);
    return res.status(500).json({ error: 'Failed to retrieve dashboard metrics' });
  }
}

export async function getAllOrders(req: Request, res: Response) {
  try {
    const { status, q, page = '1', limit = '15' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const take = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 15));
    const skip = (pageNum - 1) * take;

    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status as string;
    }

    if (q) {
      const searchStr = (q as string).trim();
      where.OR = [
        { orderNumber: { contains: searchStr } },
        { deliveryName: { contains: searchStr } },
        { deliveryPhone: { contains: searchStr } },
        { user: { name: { contains: searchStr } } },
        { user: { email: { contains: searchStr } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.order.count({ where }),
    ]);

    return res.json({
      orders,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take),
      }
    });
  } catch (err) {
    console.error('Error fetching admin orders:', err);
    return res.status(500).json({ error: 'Failed to retrieve orders' });
  }
}

export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    const parsed = updateOrderStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid order status' });
    }

    const { status: targetStatus } = parsed.data;

    const currentOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!currentOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (currentOrder.status === targetStatus) {
      return res.json({ order: currentOrder });
    }

    // Check valid transitions
    if (currentOrder.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Cannot alter status of a cancelled order.' });
    }

    if (currentOrder.status === 'DELIVERED' && targetStatus !== 'CANCELLED') {
      return res.status(400).json({ error: 'Delivered orders cannot be moved back to prior fulfillment steps.' });
    }

    // Handle cancellation and stock restoration
    if (targetStatus === 'CANCELLED') {
      const updatedOrder = await prisma.$transaction(async (tx) => {
        // Check if stock has already been restored for this order
        const existingRestoration = await tx.inventoryMovement.findFirst({
          where: { reason: { contains: `ORDER_CANCELLATION #${currentOrder.orderNumber}` } }
        });

        if (!existingRestoration) {
          for (const item of currentOrder.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stockQuantity: { increment: item.quantity }
              }
            });

            await tx.inventoryMovement.create({
              data: {
                productId: item.productId,
                changeQuantity: item.quantity,
                reason: `ORDER_CANCELLATION #${currentOrder.orderNumber}`,
                adminUserId: req.user?.id,
              }
            });
          }
        }

        return tx.order.update({
          where: { id },
          data: {
            status: 'CANCELLED',
            paymentStatus: currentOrder.paymentStatus === 'COMPLETED' ? 'PENDING' : 'FAILED',
          },
          include: { items: true, user: true }
        });
      });

      return res.json({ order: updatedOrder, message: 'Order cancelled and stock restored safely.' });
    }

    // Regular status transition
    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: targetStatus,
        paymentStatus: targetStatus === 'DELIVERED' ? 'COMPLETED' : currentOrder.paymentStatus,
      },
      include: { items: true, user: true }
    });

    return res.json({ order: updated });
  } catch (err) {
    console.error('Error updating order status:', err);
    return res.status(500).json({ error: 'Failed to update order status' });
  }
}

export async function getAllCustomers(req: Request, res: Response) {
  try {
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const customerSummary = customers.map(c => {
      const totalSpent = c.orders
        .filter(o => o.status !== 'CANCELLED')
        .reduce((sum, o) => sum + o.totalAmount, 0);

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        address: c.address,
        createdAt: c.createdAt,
        orderCount: c.orders.length,
        totalSpent: parseFloat(totalSpent.toFixed(2)),
        lastOrderDate: c.orders[0]?.createdAt || null,
      };
    });

    return res.json({ customers: customerSummary });
  } catch (err) {
    console.error('Error fetching customers:', err);
    return res.status(500).json({ error: 'Failed to retrieve customers' });
  }
}

export async function getInventory(req: Request, res: Response) {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: { select: { id: true, name: true } },
        inventoryMovements: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { stockQuantity: 'asc' }
    });

    return res.json({ products });
  } catch (err) {
    console.error('Error fetching inventory:', err);
    return res.status(500).json({ error: 'Failed to retrieve inventory' });
  }
}

export async function createInventoryAdjustment(req: Request, res: Response) {
  try {
    const parsed = inventoryAdjustmentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid adjustment data' });
    }

    const { productId, changeQuantity, reason } = parsed.data;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const resultingStock = product.stockQuantity + changeQuantity;
    if (resultingStock < 0) {
      return res.status(400).json({
        error: `Adjustment would cause negative inventory. Current stock is ${product.stockQuantity}, attempted change is ${changeQuantity}.`
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.update({
        where: { id: productId },
        data: { stockQuantity: resultingStock }
      });

      const movement = await tx.inventoryMovement.create({
        data: {
          productId,
          changeQuantity,
          reason,
          adminUserId: req.user?.id,
        }
      });

      return { product: prod, movement };
    });

    return res.status(201).json({
      message: 'Inventory adjusted successfully.',
      ...updated
    });
  } catch (err) {
    console.error('Error adjusting inventory:', err);
    return res.status(500).json({ error: 'Failed to adjust inventory' });
  }
}

export async function getSettings(req: Request, res: Response) {
  try {
    const settings = await prisma.storeSetting.findMany({
      orderBy: { key: 'asc' }
    });
    return res.json({ settings });
  } catch (err) {
    console.error('Error fetching store settings:', err);
    return res.status(500).json({ error: 'Failed to retrieve settings' });
  }
}

export async function updateSettings(req: Request, res: Response) {
  try {
    const { settings } = req.body;
    if (!Array.isArray(settings)) {
      return res.status(400).json({ error: 'Expected an array of { key, value } objects.' });
    }

    for (const item of settings) {
      if (item.key && typeof item.value === 'string') {
        await prisma.storeSetting.upsert({
          where: { key: item.key },
          update: { value: item.value },
          create: { key: item.key, value: item.value }
        });
      }
    }

    const updated = await prisma.storeSetting.findMany({ orderBy: { key: 'asc' } });
    return res.json({ settings: updated, message: 'Store settings updated successfully.' });
  } catch (err) {
    console.error('Error updating store settings:', err);
    return res.status(500).json({ error: 'Failed to update settings' });
  }
}

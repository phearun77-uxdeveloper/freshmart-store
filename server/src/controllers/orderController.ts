import { Request, Response } from 'express';
import { prisma } from '../db.js';
import { checkoutSchema } from '../validators/schemas.js';

export async function createOrder(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'You must be signed in to complete checkout.' });
    }

    const parsed = checkoutSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid delivery details' });
    }

    const { deliveryName, deliveryPhone, deliveryAddress, deliveryNotes, paymentMethod } = parsed.data;

    // 1. Fetch user's cart with items
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Your shopping cart is empty. Add items before checking out.' });
    }

    // 2. Load authoritative store settings for delivery fee
    const settings = await prisma.storeSetting.findMany({
      where: {
        key: { in: ['DELIVERY_FEE', 'FREE_DELIVERY_THRESHOLD'] }
      }
    });

    let standardDeliveryFee = 4.99;
    let freeDeliveryThreshold = 45.00;

    for (const s of settings) {
      if (s.key === 'DELIVERY_FEE') standardDeliveryFee = parseFloat(s.value) || 4.99;
      if (s.key === 'FREE_DELIVERY_THRESHOLD') freeDeliveryThreshold = parseFloat(s.value) || 45.00;
    }

    // 3. Verify stock and calculate authoritative prices
    let subtotal = 0;
    const orderItemsToCreate: Array<{
      productId: number;
      productName: string;
      unitPrice: number;
      quantity: number;
      subtotal: number;
    }> = [];

    // Check each product fresh from database
    for (const item of cart.items) {
      const freshProduct = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!freshProduct || !freshProduct.isActive) {
        return res.status(400).json({
          error: `Product '${item.product.name}' is no longer available. Please update your cart.`
        });
      }

      if (freshProduct.stockQuantity < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for '${freshProduct.name}'. Requested ${item.quantity}, but only ${freshProduct.stockQuantity} remain in stock.`
        });
      }

      const effectivePrice = freshProduct.promotionalPrice ?? freshProduct.price;
      const itemSubtotal = parseFloat((effectivePrice * item.quantity).toFixed(2));
      subtotal += itemSubtotal;

      orderItemsToCreate.push({
        productId: freshProduct.id,
        productName: freshProduct.name,
        unitPrice: effectivePrice,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });
    }

    subtotal = parseFloat(subtotal.toFixed(2));
    const deliveryFee = subtotal >= freeDeliveryThreshold ? 0 : standardDeliveryFee;
    const totalAmount = parseFloat((subtotal + deliveryFee).toFixed(2));

    // 4. Generate unique order number (e.g. FM-20261028-A4F2)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString();
    const orderNumber = `FM-${dateStr}-${randomHex}`;

    // 5. Execute atomic database transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      // Step A: Atomically decrement stock and log movement
      for (const it of orderItemsToCreate) {
        await tx.product.update({
          where: { id: it.productId },
          data: {
            stockQuantity: {
              decrement: it.quantity,
            }
          }
        });

        await tx.inventoryMovement.create({
          data: {
            productId: it.productId,
            changeQuantity: -it.quantity,
            reason: `ORDER_FULFILLMENT #${orderNumber}`,
          }
        });
      }

      // Step B: Create Order and OrderItems snapshot
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: req.user!.id,
          status: 'PENDING',
          paymentMethod,
          paymentStatus: paymentMethod === 'MOCK_PAYMENT' ? 'COMPLETED' : 'PENDING',
          subtotal,
          deliveryFee,
          totalAmount,
          deliveryName,
          deliveryPhone,
          deliveryAddress,
          deliveryNotes: deliveryNotes || null,
          items: {
            create: orderItemsToCreate.map((it) => ({
              productId: it.productId,
              productNameSnapshot: it.productName,
              unitPriceSnapshot: it.unitPrice,
              quantity: it.quantity,
              subtotal: it.subtotal,
            }))
          }
        },
        include: {
          items: true
        }
      });

      // Step C: Clear the user's cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      });

      return createdOrder;
    });

    return res.status(201).json({
      message: 'Order placed successfully.',
      order: newOrder
    });
  } catch (err) {
    console.error('Checkout error:', err);
    return res.status(500).json({ error: 'Failed to process checkout. Please try again.' });
  }
}

export async function getMyOrders(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ orders });
  } catch (err) {
    console.error('Error fetching customer orders:', err);
    return res.status(500).json({ error: 'Failed to retrieve order history' });
  }
}

export async function getOrderById(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: { imageUrl: true, slug: true, unit: true }
            }
          }
        },
        user: {
          select: { name: true, email: true }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Authorization check: Only order owner or admin can view
    if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'You are not authorized to view this order.' });
    }

    return res.json({ order });
  } catch (err) {
    console.error('Error fetching order details:', err);
    return res.status(500).json({ error: 'Failed to retrieve order details' });
  }
}

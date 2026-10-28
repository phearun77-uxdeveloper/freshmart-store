import { Request, Response } from 'express';
import { prisma } from '../db.js';
import { cartItemSchema, updateCartItemSchema, guestCartSyncSchema } from '../validators/schemas.js';

// Helper to ensure a user cart exists
async function getOrCreateCart(userId: number) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: { category: true }
          }
        }
      }
    }
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { category: true }
            }
          }
        }
      }
    });
  }

  return cart;
}

export async function getCart(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const cart = await getOrCreateCart(req.user.id);

    // Calculate subtotal using trusted current database prices
    let subtotal = 0;
    const validItems = cart.items.map((item) => {
      const activePrice = item.product.promotionalPrice ?? item.product.price;
      const itemTotal = activePrice * item.quantity;
      subtotal += itemTotal;

      return {
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          sku: item.product.sku,
          price: item.product.price,
          promotionalPrice: item.product.promotionalPrice,
          unit: item.product.unit,
          stockQuantity: item.product.stockQuantity,
          imageUrl: item.product.imageUrl,
          isActive: item.product.isActive,
          categoryName: item.product.category.name,
        },
        itemTotal: parseFloat(itemTotal.toFixed(2)),
      };
    });

    return res.json({
      cartId: cart.id,
      items: validItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
      itemCount: validItems.reduce((acc, it) => acc + it.quantity, 0),
    });
  } catch (err) {
    console.error('Error fetching cart:', err);
    return res.status(500).json({ error: 'Failed to retrieve shopping cart' });
  }
}

export async function addItem(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const parsed = cartItemSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid item data' });
    }

    const { productId, quantity } = parsed.data;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) {
      return res.status(404).json({ error: 'Product is unavailable or does not exist.' });
    }

    if (product.stockQuantity <= 0) {
      return res.status(400).json({ error: `Sorry, ${product.name} is currently out of stock.` });
    }

    const cart = await getOrCreateCart(req.user.id);

    // Check if item is already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        }
      }
    });

    const newQuantity = (existingItem?.quantity || 0) + quantity;
    if (newQuantity > product.stockQuantity) {
      return res.status(400).json({
        error: `Cannot add ${quantity} more. Only ${product.stockQuantity} available in stock (you have ${existingItem?.quantity || 0} in cart).`
      });
    }

    await prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        }
      },
      update: { quantity: newQuantity },
      create: {
        cartId: cart.id,
        productId,
        quantity,
      }
    });

    return getCart(req, res);
  } catch (err) {
    console.error('Error adding cart item:', err);
    return res.status(500).json({ error: 'Failed to add item to cart' });
  }
}

export async function updateItem(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const itemId = parseInt(req.params.id, 10);
    if (isNaN(itemId)) {
      return res.status(400).json({ error: 'Invalid cart item ID' });
    }

    const parsed = updateCartItemSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid quantity' });
    }

    const { quantity } = parsed.data;
    const cart = await getOrCreateCart(req.user.id);

    const existingItem = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { product: true }
    });

    if (!existingItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
      return getCart(req, res);
    }

    if (quantity > existingItem.product.stockQuantity) {
      return res.status(400).json({
        error: `Only ${existingItem.product.stockQuantity} items available in stock.`
      });
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity }
    });

    return getCart(req, res);
  } catch (err) {
    console.error('Error updating cart item:', err);
    return res.status(500).json({ error: 'Failed to update item quantity' });
  }
}

export async function removeItem(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const itemId = parseInt(req.params.id, 10);
    if (isNaN(itemId)) {
      return res.status(400).json({ error: 'Invalid cart item ID' });
    }

    const cart = await getOrCreateCart(req.user.id);

    await prisma.cartItem.deleteMany({
      where: { id: itemId, cartId: cart.id }
    });

    return getCart(req, res);
  } catch (err) {
    console.error('Error removing cart item:', err);
    return res.status(500).json({ error: 'Failed to remove item from cart' });
  }
}

export async function clearCart(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const cart = await getOrCreateCart(req.user.id);

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    return res.json({ message: 'Shopping cart cleared successfully.', items: [], subtotal: 0, itemCount: 0 });
  } catch (err) {
    console.error('Error clearing cart:', err);
    return res.status(500).json({ error: 'Failed to clear cart' });
  }
}

export async function syncGuestCart(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const parsed = guestCartSyncSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid guest cart items' });
    }

    const cart = await getOrCreateCart(req.user.id);

    for (const item of parsed.data.items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product || !product.isActive || product.stockQuantity <= 0) continue;

      const existing = await prisma.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: item.productId,
          }
        }
      });

      const combinedQuantity = (existing?.quantity || 0) + item.quantity;
      const finalQuantity = Math.min(combinedQuantity, product.stockQuantity);

      if (finalQuantity > 0) {
        await prisma.cartItem.upsert({
          where: {
            cartId_productId: {
              cartId: cart.id,
              productId: item.productId,
            }
          },
          update: { quantity: finalQuantity },
          create: {
            cartId: cart.id,
            productId: item.productId,
            quantity: finalQuantity,
          }
        });
      }
    }

    return getCart(req, res);
  } catch (err) {
    console.error('Error syncing guest cart:', err);
    return res.status(500).json({ error: 'Failed to sync guest cart' });
  }
}

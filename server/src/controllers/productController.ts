import { Request, Response } from 'express';
import { prisma } from '../db.js';
import { productSchema } from '../validators/schemas.js';

export async function getProducts(req: Request, res: Response) {
  try {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      inStock,
      isFeatured,
      sort = 'newest',
      page = '1',
      limit = '12',
      includeInactive,
    } = req.query;

    const isAdmin = req.user?.role === 'ADMIN';
    const showInactive = includeInactive === 'true' && isAdmin;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const take = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 12));
    const skip = (pageNum - 1) * take;

    const where: any = {};

    if (!showInactive) {
      where.isActive = true;
    }

    if (q) {
      const searchStr = (q as string).trim();
      where.OR = [
        { name: { contains: searchStr } },
        { description: { contains: searchStr } },
        { sku: { contains: searchStr } },
      ];
    }

    if (category) {
      const catVal = category as string;
      if (!isNaN(parseInt(catVal, 10))) {
        where.categoryId = parseInt(catVal, 10);
      } else {
        where.category = { slug: catVal };
      }
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice && !isNaN(parseFloat(minPrice as string))) {
        where.price.gte = parseFloat(minPrice as string);
      }
      if (maxPrice && !isNaN(parseFloat(maxPrice as string))) {
        where.price.lte = parseFloat(maxPrice as string);
      }
    }

    if (inStock === 'true') {
      where.stockQuantity = { gt: 0 };
    }

    if (isFeatured === 'true') {
      where.isFeatured = true;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'name_asc') {
      orderBy = { name: 'asc' };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true }
          }
        },
        orderBy,
        skip,
        take,
      }),
      prisma.product.count({ where }),
    ]);

    return res.json({
      products,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take),
      }
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    return res.status(500).json({ error: 'Failed to retrieve products' });
  }
}

export async function getProductBySlug(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Fetch up to 4 related products from the same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true,
      },
      take: 4,
    });

    return res.json({ product, relatedProducts });
  } catch (err) {
    console.error('Error fetching product by slug:', err);
    return res.status(500).json({ error: 'Failed to retrieve product details' });
  }
}

export async function getProductById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json({ product });
  } catch (err) {
    console.error('Error fetching product by id:', err);
    return res.status(500).json({ error: 'Failed to retrieve product' });
  }
}

export async function createProduct(req: Request, res: Response) {
  try {
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid product data' });
    }

    const { sku, slug, ...data } = parsed.data;

    // Check SKU uniqueness
    const existingSku = await prisma.product.findUnique({ where: { sku } });
    if (existingSku) {
      return res.status(409).json({ error: `SKU '${sku}' is already assigned to another product.` });
    }

    // Check Slug uniqueness
    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      return res.status(409).json({ error: `Product slug '${slug}' is already taken.` });
    }

    const product = await prisma.product.create({
      data: {
        ...data,
        sku,
        slug,
      },
      include: { category: true }
    });

    // Record initial inventory movement
    if (product.stockQuantity > 0) {
      await prisma.inventoryMovement.create({
        data: {
          productId: product.id,
          changeQuantity: product.stockQuantity,
          reason: 'INITIAL_PRODUCT_CREATION',
          adminUserId: req.user?.id,
        }
      });
    }

    return res.status(201).json({ product });
  } catch (err) {
    console.error('Error creating product:', err);
    return res.status(500).json({ error: 'Failed to create product' });
  }
}

export async function updateProduct(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const parsed = productSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid product data' });
    }

    const current = await prisma.product.findUnique({ where: { id } });
    if (!current) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (parsed.data.sku && parsed.data.sku !== current.sku) {
      const conflict = await prisma.product.findUnique({ where: { sku: parsed.data.sku } });
      if (conflict) {
        return res.status(409).json({ error: `SKU '${parsed.data.sku}' already belongs to another product.` });
      }
    }

    if (parsed.data.slug && parsed.data.slug !== current.slug) {
      const conflict = await prisma.product.findUnique({ where: { slug: parsed.data.slug } });
      if (conflict) {
        return res.status(409).json({ error: `Slug '${parsed.data.slug}' is already taken.` });
      }
    }

    // If stock quantity changed directly, log an inventory movement
    const stockChanged = parsed.data.stockQuantity !== undefined && parsed.data.stockQuantity !== current.stockQuantity;

    const updated = await prisma.product.update({
      where: { id },
      data: parsed.data,
      include: { category: true }
    });

    if (stockChanged && parsed.data.stockQuantity !== undefined) {
      const diff = parsed.data.stockQuantity - current.stockQuantity;
      await prisma.inventoryMovement.create({
        data: {
          productId: id,
          changeQuantity: diff,
          reason: 'ADMIN_DIRECT_STOCK_UPDATE',
          adminUserId: req.user?.id,
        }
      });
    }

    return res.json({ product: updated });
  } catch (err) {
    console.error('Error updating product:', err);
    return res.status(500).json({ error: 'Failed to update product' });
  }
}

export async function deleteProduct(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    // Check if product is referenced in historical orders
    const orderItemCount = await prisma.orderItem.count({
      where: { productId: id }
    });

    if (orderItemCount > 0) {
      // Historical order preservation rule: deactivate instead of deleting
      await prisma.product.update({
        where: { id },
        data: { isActive: false }
      });
      return res.json({
        message: 'Product is referenced by past orders and has been deactivated instead of permanently deleted to preserve audit integrity.',
        deactivated: true
      });
    }

    // Also remove from cart items if any
    await prisma.cartItem.deleteMany({ where: { productId: id } });
    await prisma.inventoryMovement.deleteMany({ where: { productId: id } });

    await prisma.product.delete({
      where: { id }
    });

    return res.json({ message: 'Product deleted permanently.' });
  } catch (err) {
    console.error('Error deleting product:', err);
    return res.status(500).json({ error: 'Failed to delete product' });
  }
}

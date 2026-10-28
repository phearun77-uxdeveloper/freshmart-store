import { Request, Response } from 'express';
import { prisma } from '../db.js';
import { categorySchema } from '../validators/schemas.js';

export async function getCategories(req: Request, res: Response) {
  try {
    const includeInactive = req.query.includeInactive === 'true' && req.user?.role === 'ADMIN';

    const categories = await prisma.category.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return res.json({ categories });
  } catch (err) {
    console.error('Error fetching categories:', err);
    return res.status(500).json({ error: 'Failed to retrieve categories' });
  }
}

export async function getCategoryById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          where: { isActive: true },
          take: 8,
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    return res.json({ category });
  } catch (err) {
    console.error('Error fetching category:', err);
    return res.status(500).json({ error: 'Failed to retrieve category' });
  }
}

export async function createCategory(req: Request, res: Response) {
  try {
    const parsed = categorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid category data' });
    }

    const existingSlug = await prisma.category.findUnique({
      where: { slug: parsed.data.slug }
    });

    if (existingSlug) {
      return res.status(409).json({ error: 'A category with this URL slug already exists.' });
    }

    const category = await prisma.category.create({
      data: parsed.data
    });

    return res.status(201).json({ category });
  } catch (err) {
    console.error('Error creating category:', err);
    return res.status(500).json({ error: 'Failed to create category' });
  }
}

export async function updateCategory(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    const parsed = categorySchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid category data' });
    }

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Category not found' });
    }

    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const conflict = await prisma.category.findUnique({
        where: { slug: parsed.data.slug }
      });
      if (conflict) {
        return res.status(409).json({ error: 'A category with this URL slug already exists.' });
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: parsed.data
    });

    return res.json({ category: updated });
  } catch (err) {
    console.error('Error updating category:', err);
    return res.status(500).json({ error: 'Failed to update category' });
  }
}

export async function deleteCategory(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    // Check for linked products
    const productCount = await prisma.product.count({
      where: { categoryId: id }
    });

    if (productCount > 0) {
      return res.status(400).json({
        error: `Cannot delete category because ${productCount} product(s) are assigned to it. Please reassign or deactivate those products first.`
      });
    }

    await prisma.category.delete({
      where: { id }
    });

    return res.json({ message: 'Category deleted successfully.' });
  } catch (err) {
    console.error('Error deleting category:', err);
    return res.status(500).json({ error: 'Failed to delete category' });
  }
}

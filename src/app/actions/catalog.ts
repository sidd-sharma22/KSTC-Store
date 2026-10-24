"use server";

import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

export interface CatalogFilterParams {
  categorySlug?: string;
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  searchQuery?: string;
  sortBy?: "popularity" | "price-asc" | "price-desc" | "newest";
  limit?: number;
  offset?: number;
}

export interface SerializedProduct {
  id: string;
  sku: string;
  title: string;
  slug: string;
  brand: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  description: string | null;
  basePrice: number;
  dealerPrice: number | null;
  contractorPrice: number | null;
  stockCount: number;
  datasheetUrl: string | null;
  isActive: boolean;
  hsnCode: string | null;
  gstRate: number;
  unit: string;
  specifications: { name: string; value: string }[];
  images: { url: string; isPrimary: boolean }[];
  bulkPricing: { minQuantity: number; pricePerUnit: number }[];
}

/**
 * Fetch all categories with product count
 */
export async function getCategoriesAction() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    });
    return { success: true, categories };
  } catch (error: unknown) {
    console.error("getCategoriesAction error:", error);
    return { success: false, categories: [], error: "Failed to load categories." };
  }
}

/**
 * Fetch dynamic products with filters, search, and sorting
 */
export async function getProductsAction(params: CatalogFilterParams) {
  try {
    const { categorySlug, brand, minPrice, maxPrice, searchQuery, sortBy = "popularity", limit = 24, offset = 0 } = params;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    // Filter by Category
    if (categorySlug && categorySlug !== "all-products") {
      where.category = {
        slug: categorySlug,
      };
    }

    // Filter by Brand(s)
    if (brand && brand.length > 0) {
      where.brand = {
        in: brand,
      };
    }

    // Filter by Price range (basePrice)
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {};
      if (minPrice !== undefined) where.basePrice.gte = minPrice;
      if (maxPrice !== undefined) where.basePrice.lte = maxPrice;
    }

    // Search query across title, description, brand, SKU
    if (searchQuery?.trim()) {
      const q = searchQuery.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { brand: { contains: q, mode: "insensitive" } },
        { sku: { contains: q, mode: "insensitive" } },
      ];
    }

    // Sorting
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
    if (sortBy === "price-asc") {
      orderBy = { basePrice: "asc" };
    } else if (sortBy === "price-desc") {
      orderBy = { basePrice: "desc" };
    } else if (sortBy === "newest") {
      orderBy = { createdAt: "desc" };
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          specifications: {
            select: { name: true, value: true },
          },
          images: {
            select: { url: true, isPrimary: true },
          },
          bulkPricing: {
            select: { minQuantity: true, pricePerUnit: true },
            orderBy: { minQuantity: "asc" },
          },
        },
        orderBy,
        take: limit,
        skip: offset,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      success: true,
      products: products as SerializedProduct[],
      totalCount,
    };
  } catch (error: unknown) {
    console.error("getProductsAction error:", error);
    return { success: false, products: [], totalCount: 0, error: "Failed to load products." };
  }
}

/**
 * Fetch a single product by ID or Slug with all relations
 */
export async function getProductByIdAction(idOrSlug: string) {
  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }, { sku: idOrSlug }],
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        specifications: {
          select: { name: true, value: true },
        },
        images: {
          select: { url: true, isPrimary: true },
        },
        bulkPricing: {
          select: { minQuantity: true, pricePerUnit: true },
          orderBy: { minQuantity: "asc" },
        },
      },
    });

    if (!product) {
      return { success: false, product: null, error: "Product not found." };
    }

    return { success: true, product: product as SerializedProduct };
  } catch (error: unknown) {
    console.error("getProductByIdAction error:", error);
    return { success: false, product: null, error: "Failed to load product details." };
  }
}

/**
 * Instant autocomplete search for the Header search bar
 */
export async function searchAutocompleteAction(query: string) {
  try {
    if (!query || query.trim().length < 2) {
      return { success: true, results: [] };
    }

    const q = query.trim();
    const results = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { brand: { contains: q, mode: "insensitive" } },
          { sku: { contains: q, mode: "insensitive" } },
          { category: { name: { contains: q, mode: "insensitive" } } },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        brand: true,
        basePrice: true,
        dealerPrice: true,
        contractorPrice: true,
        category: {
          select: { name: true, slug: true },
        },
        images: {
          where: { isPrimary: true },
          select: { url: true },
          take: 1,
        },
      },
      take: 6,
    });

    return { success: true, results };
  } catch (error: unknown) {
    console.error("searchAutocompleteAction error:", error);
    return { success: true, results: [] };
  }
}

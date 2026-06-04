import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://mealicious.store'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    '', 'shop', 'about', 'contact', 'faq', 'blog', 'track-order',
    'privacy', 'terms', 'shipping-policy', 'refund-policy',
  ].map((path) => ({
    url: `${BASE}${path ? `/#${path}` : ''}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.7,
  }))

  let productRoutes: MetadataRoute.Sitemap = []
  let blogRoutes: MetadataRoute.Sitemap = []
  try {
    const products = await db.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } })
    productRoutes = products.map((p) => ({
      url: `${BASE}/#product?slug=${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
    const posts = await db.blogPost.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } })
    blogRoutes = posts.map((p) => ({
      url: `${BASE}/#blog-post?slug=${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  } catch {}

  return [...staticRoutes, ...productRoutes, ...blogRoutes]
}

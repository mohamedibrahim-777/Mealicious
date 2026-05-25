import { PrismaClient } from '@prisma/client'
import { products, categories, blogPosts } from '../src/lib/data'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding categories…')
  const slugToId = new Map<string, string>()
  for (const c of categories) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        image: c.image,
        icon: c.icon,
      },
      create: {
        name: c.name,
        slug: c.slug,
        image: c.image,
        icon: c.icon,
        featured: true,
      },
    })
    slugToId.set(c.slug, row.id)
  }
  console.log(`  ${slugToId.size} categories`)

  console.log('Seeding products…')
  let pcount = 0
  for (const p of products) {
    const categoryId = slugToId.get(p.categorySlug)
    if (!categoryId) {
      console.warn(`  skip ${p.slug}: category ${p.categorySlug} not found`)
      continue
    }
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        shortDesc: p.shortDesc,
        price: p.price,
        salePrice: p.salePrice,
        images: JSON.stringify(p.images),
        categoryId,
        variants: JSON.stringify(p.variants ?? []),
        tags: JSON.stringify(p.tags ?? []),
        nutrition: JSON.stringify(p.nutrition ?? {}),
        stock: p.stock,
        sku: p.sku,
        featured: p.featured,
        bestSeller: p.bestSeller,
        isNew: p.isNew,
        rating: p.rating,
        reviewCount: p.reviewCount,
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        shortDesc: p.shortDesc,
        price: p.price,
        salePrice: p.salePrice,
        images: JSON.stringify(p.images),
        categoryId,
        variants: JSON.stringify(p.variants ?? []),
        tags: JSON.stringify(p.tags ?? []),
        nutrition: JSON.stringify(p.nutrition ?? {}),
        stock: p.stock,
        sku: p.sku,
        featured: p.featured,
        bestSeller: p.bestSeller,
        isNew: p.isNew,
        rating: p.rating,
        reviewCount: p.reviewCount,
      },
    })
    pcount++
  }
  console.log(`  ${pcount} products`)

  console.log('Seeding blog posts…')
  let bcount = 0
  for (const b of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: b.slug },
      update: {
        title: b.title,
        excerpt: b.excerpt,
        content: b.content,
        image: b.image,
        author: b.author,
        category: b.category,
        published: true,
      },
      create: {
        title: b.title,
        slug: b.slug,
        excerpt: b.excerpt,
        content: b.content,
        image: b.image,
        author: b.author,
        category: b.category,
        published: true,
      },
    })
    bcount++
  }
  console.log(`  ${bcount} blog posts`)

  // Ensure admin user exists for FK on demo orders
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mealicious.com' },
    update: { role: 'admin' },
    create: { email: 'admin@mealicious.com', name: 'Admin', role: 'admin' },
  })
  console.log(`Admin user id=${admin.id}`)

  console.log('Seed complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

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

  console.log('Seeding product reviews and updating rating counts...')
  const reviewerNames = [
    'Aarav Sharma', 'Priya Patel', 'Amit Khan', 'Anjali Mehta', 'Rajesh Verma',
    'Siddharth Rao', 'Neha Gupta', 'Vikram Singh', 'Deepa Nair', 'Suresh Iyer'
  ]

  const reviewComments = [
    { rating: 5, title: 'Superb Quality', comment: 'Absolutely premium quality. The freshness is unmatched. Will buy again!' },
    { rating: 5, title: 'Highly Recommended', comment: 'Extremely fresh and delicious. Very clean packaging. Highly recommend!' },
    { rating: 5, title: 'Amazing Taste', comment: 'The flavor is incredible. Best dry fruits I have ordered online.' },
    { rating: 4, title: 'Very Good Product', comment: 'Great taste and texture. Delivery was slightly delayed, but product is excellent.' },
    { rating: 4, title: 'Satisfied', comment: 'Good quality and value for money. Healthy snacking option.' },
    { rating: 5, title: 'Perfect Pack', comment: 'Crispy, crunchy, and tastes natural. 10/10.' }
  ]

  // Clear existing reviews first
  await prisma.review.deleteMany()

  const dbProducts = await prisma.product.findMany()
  for (const p of dbProducts) {
    const reviewQty = 2 + (p.name.length % 3)
    const reviewsToInsert = []

    for (let i = 0; i < reviewQty; i++) {
      const nameIdx = (p.name.charCodeAt(0) + i * 7) % reviewerNames.length
      const commentIdx = (p.name.charCodeAt(p.name.length - 1) + i * 13) % reviewComments.length

      const reviewer = reviewerNames[nameIdx]
      const reviewDetail = reviewComments[commentIdx]

      const date = new Date()
      date.setDate(date.getDate() - (i * 10 + 2))

      reviewsToInsert.push({
        productId: p.id,
        guestName: reviewer,
        guestEmail: `${reviewer.toLowerCase().replace(/ /g, '.')}@example.com`,
        rating: reviewDetail.rating,
        title: reviewDetail.title,
        comment: reviewDetail.comment,
        approved: true,
        createdAt: date,
      })
    }

    await prisma.review.createMany({
      data: reviewsToInsert
    })

    // Update product rating and reviewCount aggregates
    const aggregate = await prisma.review.aggregate({
      where: { productId: p.id, approved: true },
      _avg: { rating: true },
      _count: { id: true }
    })

    const avgRating = aggregate._avg.rating ? parseFloat(aggregate._avg.rating.toFixed(1)) : 0
    const count = aggregate._count.id ?? 0

    await prisma.product.update({
      where: { id: p.id },
      data: {
        rating: avgRating,
        reviewCount: count
      }
    })
  }

  console.log('Seed complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())


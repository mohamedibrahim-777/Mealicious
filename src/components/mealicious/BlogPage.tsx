'use client'

import { useRef, useState, useMemo } from 'react'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import {
  Search,
  Clock,
  User,
  Calendar,
  ArrowRight,
  Tag,
  Send,
  BookOpen,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/lib/store'
import { blogPosts } from '@/lib/data'

/* ─────────────────────── animation helpers ─────────────────────── */

function FadeInWhenVisible({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function StaggerContainer({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.1 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const staggerChild = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

/* ─────────────────────── blog categories ─────────────────────── */

const allCategories = Array.from(new Set(blogPosts.map((p) => p.category)))

/* ═══════════════════════ BLOG PAGE ═══════════════════════ */

export default function BlogPage() {
  const navigate = useAppStore((s) => s.navigate)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesSearch =
        !searchQuery ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.category.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = !selectedCategory || post.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  const featuredPost = blogPosts[0]
  const recentPosts = blogPosts.slice(0, 3)

  return (
    <div className="flex flex-col">
      {/* ──────── 1. Hero Section ──────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
              The Mealicious Blog
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-emerald-100 max-w-2xl mx-auto">
              Health tips, recipes, and guides to help you make the most of your snacking experience.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ──────── 2. Blog Content ──────── */}
      <section className="py-14 sm:py-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <FadeInWhenVisible>
            <div className="max-w-xl mx-auto mb-10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>
          </FadeInWhenVisible>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Featured Post */}
              {!searchQuery && !selectedCategory && featuredPost && (
                <FadeInWhenVisible>
                  <Card
                    className="overflow-hidden cursor-pointer group hover:shadow-lg transition-all py-0 gap-0"
                    onClick={() => navigate('blog-post', { id: featuredPost.id })}
                  >
                    <div className="grid md:grid-cols-2">
                      <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[280px] overflow-hidden bg-muted">
                        <Image
                          src={featuredPost.image}
                          alt={featuredPost.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <Badge className="absolute top-3 left-3 bg-emerald-600 text-white">
                          Featured
                        </Badge>
                      </div>
                      <div className="p-6 sm:p-8 flex flex-col justify-center">
                        <Badge variant="outline" className="w-fit text-emerald-600 border-emerald-200 mb-3">
                          {featuredPost.category}
                        </Badge>
                        <h2 className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-emerald-600 transition-colors leading-tight">
                          {featuredPost.title}
                        </h2>
                        <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                          {featuredPost.excerpt}
                        </p>
                        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {featuredPost.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(featuredPost.date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {featuredPost.readTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </FadeInWhenVisible>
              )}

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={!selectedCategory ? 'default' : 'outline'}
                  className={`cursor-pointer transition-colors ${
                    !selectedCategory
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'
                  }`}
                  onClick={() => setSelectedCategory(null)}
                >
                  All
                </Badge>
                {allCategories.map((cat) => (
                  <Badge
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    className={`cursor-pointer transition-colors ${
                      selectedCategory === cat
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'
                    }`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>

              {/* Blog Grid */}
              {filteredPosts.length > 0 ? (
                <StaggerContainer className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                  {filteredPosts.map((post) => (
                    <motion.div key={post.id} variants={staggerChild}>
                      <Card
                        className="overflow-hidden cursor-pointer group hover:shadow-md transition-all py-0 gap-0 h-full"
                        onClick={() => navigate('blog-post', { id: post.id })}
                      >
                        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, 50vw"
                          />
                          <Badge className="absolute top-3 left-3 bg-emerald-600/90 text-white text-xs">
                            {post.category}
                          </Badge>
                        </div>
                        <CardContent className="p-4 sm:p-5 space-y-3">
                          <h3 className="font-bold text-sm sm:text-base group-hover:text-emerald-600 transition-colors leading-tight line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {post.author}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(post.date).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {post.readTime}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </StaggerContainer>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">No articles found</h3>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search or category filter.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        setSearchQuery('')
                        setSelectedCategory(null)
                      }}
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Categories */}
              <Card>
                <CardContent className="p-5 space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Tag className="h-4 w-4 text-emerald-600" />
                    Categories
                  </h3>
                  <div className="space-y-1.5">
                    <button
                      className={`flex items-center justify-between w-full text-sm py-1.5 px-2 rounded-md transition-colors ${
                        !selectedCategory
                          ? 'bg-emerald-50 text-emerald-700 font-medium'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                      onClick={() => setSelectedCategory(null)}
                    >
                      <span>All Categories</span>
                      <Badge variant="secondary" className="text-xs">{blogPosts.length}</Badge>
                    </button>
                    {allCategories.map((cat) => {
                      const count = blogPosts.filter((p) => p.category === cat).length
                      return (
                        <button
                          key={cat}
                          className={`flex items-center justify-between w-full text-sm py-1.5 px-2 rounded-md transition-colors ${
                            selectedCategory === cat
                              ? 'bg-emerald-50 text-emerald-700 font-medium'
                              : 'text-muted-foreground hover:bg-muted'
                          }`}
                          onClick={() => setSelectedCategory(cat)}
                        >
                          <span>{cat}</span>
                          <Badge variant="secondary" className="text-xs">{count}</Badge>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Posts */}
              <Card>
                <CardContent className="p-5 space-y-4">
                  <h3 className="font-semibold text-foreground">Recent Posts</h3>
                  <div className="space-y-3">
                    {recentPosts.map((post) => (
                      <button
                        key={post.id}
                        className="flex items-start gap-3 text-left w-full group"
                        onClick={() => navigate('blog-post', { id: post.id })}
                      >
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-muted">
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-medium group-hover:text-emerald-600 transition-colors line-clamp-2 leading-tight">
                            {post.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(post.date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Newsletter Signup */}
              <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
                <CardContent className="p-5 space-y-4">
                  <div className="rounded-full bg-emerald-100 p-2.5 w-fit">
                    <Send className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-foreground">Newsletter</h3>
                  <p className="text-sm text-muted-foreground">
                    Get the latest articles, recipes, and exclusive offers delivered to your inbox.
                  </p>
                  <div className="space-y-2">
                    <Input placeholder="Enter your email" className="h-9" />
                    <Button
                      size="sm"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Subscribe
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    No spam. Unsubscribe anytime.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

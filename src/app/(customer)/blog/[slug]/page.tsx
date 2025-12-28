import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getPublicBlogBySlug } from '@/services/serverBlog';

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getPublicBlogBySlug(slug);
  if (!blog) return { title: 'Blog' };

  const title = blog.seo?.metaTitle?.trim() || blog.title;
  const description = blog.seo?.metaDescription?.trim() || blog.excerpt || 'Blog post';
  const canonical = blog.seo?.canonicalUrl?.trim();
  const ogImage = blog.seo?.ogImage?.url || blog.featuredImage?.url;

  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    robots: {
      index: blog.seo?.robotsIndex ?? true,
      follow: blog.seo?.robotsFollow ?? true,
    },
    openGraph: {
      type: 'article',
      title: blog.seo?.ogTitle || title,
      description: blog.seo?.ogDescription || description,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const blog = await getPublicBlogBySlug(slug);
  if (!blog) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    datePublished: blog.publishedAt,
    dateModified: blog.updatedAt,
    description: blog.excerpt,
    image: blog.featuredImage?.url ? [blog.featuredImage.url] : undefined,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': blog.seo?.canonicalUrl || `/blog/${blog.slug}`,
    },
  };

  return (
    <div className="container py-10">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="mx-auto max-w-3xl">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted/80">Blog</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-semibold text-foreground leading-tight">
            {blog.title}
          </h1>
          {blog.excerpt ? <p className="mt-3 text-sm text-muted">{blog.excerpt}</p> : null}
          {blog.publishedAt ? (
            <p className="mt-4 text-xs text-muted">
              Published {new Date(blog.publishedAt).toLocaleDateString()}
            </p>
          ) : null}
        </header>

        {blog.featuredImage?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={blog.featuredImage.url}
            alt={blog.featuredImage.alt ?? blog.title}
            className="mb-8 w-full rounded-2xl border border-border object-cover"
          />
        ) : null}

        <div
          className="blog-prose"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: blog.contentHtml || '' }}
        />
      </article>
    </div>
  );
}



import Link from 'next/link';

import { getPublicBlogs } from '@/services/serverBlog';

export const metadata = {
  title: 'Blog',
  description: 'Insights, guides, and updates.',
};

export const dynamic = 'force-dynamic';

export default async function BlogListingPage() {
  let blogs: any[] = [];
  try {
    const data = await getPublicBlogs({ page: 1, limit: 12 });
    blogs = data.items ?? [];
  } catch (error) {
    console.error('Failed to fetch blogs:', error);
    // Continue with empty array if fetch fails during build
  }

  return (
    <div className="container py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground">Blog</h1>
        <p className="mt-2 text-sm text-muted">Insights, guides, and updates from our team.</p>
      </header>

      {blogs.length === 0 ? (
        <div className="card p-6">
          <p className="text-sm text-muted">No posts yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((b) => (
            <article key={b._id} className="card overflow-hidden">
              {b.featuredImage?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={b.featuredImage.url}
                  alt={b.featuredImage.alt ?? b.title}
                  className="h-44 w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="h-44 w-full bg-gradient-to-br from-primary/10 to-secondary/10" />
              )}

              <div className="p-5 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge">{b.status}</span>
                  {b.publishedAt ? (
                    <span className="text-xs text-muted">
                      {new Date(b.publishedAt).toLocaleDateString()}
                    </span>
                  ) : null}
                </div>

                <h2 className="text-lg font-semibold text-foreground leading-snug">
                  <Link href={`/blog/${b.slug}`} className="hover:underline">
                    {b.title}
                  </Link>
                </h2>

                {b.excerpt ? <p className="text-sm text-muted line-clamp-3">{b.excerpt}</p> : null}

                <div className="pt-2">
                  <Link
                    href={`/blog/${b.slug}`}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Read more
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}



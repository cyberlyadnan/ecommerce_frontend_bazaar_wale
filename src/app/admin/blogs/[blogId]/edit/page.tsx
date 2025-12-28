'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import BlogEditor from '@/components/admin/blogs/BlogEditor';
import { ApiClientError } from '@/lib/apiClient';
import { useAppSelector } from '@/store/redux/store';
import { BlogDto, adminFetchBlogById } from '@/services/blogApi';

export default function AdminEditBlogPage() {
  const params = useParams<{ blogId: string }>();
  const blogId = params.blogId;
  const router = useRouter();
  const accessToken = useAppSelector((s) => s.auth.accessToken);

  const [blog, setBlog] = useState<BlogDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!accessToken) return;
      setLoading(true);
      setError(null);
      try {
        const res = await adminFetchBlogById(blogId, accessToken);
        setBlog(res.blog);
      } catch (e) {
        setError(e instanceof ApiClientError ? e.message : 'Failed to load blog.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [accessToken, blogId]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">Edit blog</h1>
        <p className="text-sm text-muted">Update content, SEO, and publishing settings.</p>
      </header>

      {error && <div className="alert error">{error}</div>}
      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : !blog ? (
        <p className="text-sm text-muted">Blog not found.</p>
      ) : (
        <BlogEditor
          mode="edit"
          accessToken={accessToken}
          blog={blog}
          onSaved={(b) => setBlog(b)}
          onDeleted={() => router.replace('/admin/blogs')}
        />
      )}
    </div>
  );
}



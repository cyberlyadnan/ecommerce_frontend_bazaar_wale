'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Loader2, Save, Trash2, UploadCloud } from 'lucide-react';

import { ApiClientError } from '@/lib/apiClient';
import { useAppSelector } from '@/store/redux/store';
import { uploadMedia } from '@/services/catalogApi';
import {
  BlogDto,
  BlogStatus,
  CreateBlogPayload,
  UpdateBlogPayload,
  adminCreateBlog,
  adminDeleteBlog,
  adminUpdateBlog,
} from '@/services/blogApi';
import RichTextEditor from './RichTextEditor';

interface BlogEditorProps {
  mode: 'create' | 'edit';
  accessToken: string | null;
  blog?: BlogDto;
  onSaved?: (blog: BlogDto) => void;
  onDeleted?: () => void;
}

interface BlogFormState {
  title: string;
  slug: string;
  excerpt: string;
  tags: string;
  status: BlogStatus;
  publishedAt: string;
  featuredImageUrl: string;
  featuredImageAlt: string;
  contentHtml: string;
  seoMetaTitle: string;
  seoMetaDescription: string;
  seoKeywords: string;
  seoCanonicalUrl: string;
  seoOgTitle: string;
  seoOgDescription: string;
  seoOgImageUrl: string;
  seoOgImageAlt: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
}

const initialForm = (blog?: BlogDto): BlogFormState => ({
  title: blog?.title ?? '',
  slug: blog?.slug ?? '',
  excerpt: blog?.excerpt ?? '',
  tags: blog?.tags?.join(', ') ?? '',
  status: blog?.status ?? 'draft',
  publishedAt: blog?.publishedAt ? new Date(blog.publishedAt).toISOString().slice(0, 16) : '',
  featuredImageUrl: blog?.featuredImage?.url ?? '',
  featuredImageAlt: blog?.featuredImage?.alt ?? '',
  contentHtml: blog?.contentHtml ?? '',
  seoMetaTitle: blog?.seo?.metaTitle ?? '',
  seoMetaDescription: blog?.seo?.metaDescription ?? '',
  seoKeywords: blog?.seo?.keywords?.join(', ') ?? '',
  seoCanonicalUrl: blog?.seo?.canonicalUrl ?? '',
  seoOgTitle: blog?.seo?.ogTitle ?? '',
  seoOgDescription: blog?.seo?.ogDescription ?? '',
  seoOgImageUrl: blog?.seo?.ogImage?.url ?? '',
  seoOgImageAlt: blog?.seo?.ogImage?.alt ?? '',
  robotsIndex: blog?.seo?.robotsIndex ?? true,
  robotsFollow: blog?.seo?.robotsFollow ?? true,
});

export function BlogEditor({ mode, accessToken, blog, onSaved, onDeleted }: BlogEditorProps) {
  const [form, setForm] = useState<BlogFormState>(() => initialForm(blog));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const currentUser = useAppSelector((s) => s.auth.user);

  useEffect(() => setForm(initialForm(blog)), [blog]);

  const tagsList = useMemo(
    () =>
      form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    [form.tags],
  );

  const buildPayload = (): CreateBlogPayload | UpdateBlogPayload => {
    if (!form.title.trim()) throw new Error('Title is required.');
    if (!form.contentHtml || form.contentHtml.trim().length < 10) {
      throw new Error('Content is required.');
    }

    const featuredImage =
      form.featuredImageUrl.trim().length > 0
        ? { url: form.featuredImageUrl.trim(), alt: form.featuredImageAlt.trim() || undefined }
        : null;

    const seoKeywords = form.seoKeywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    return {
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      excerpt: form.excerpt.trim() || undefined,
      contentHtml: form.contentHtml,
      featuredImage,
      tags: tagsList.length ? tagsList : undefined,
      status: form.status,
      publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
      seo: {
        metaTitle: form.seoMetaTitle.trim() || undefined,
        metaDescription: form.seoMetaDescription.trim() || undefined,
        keywords: seoKeywords.length ? seoKeywords : undefined,
        canonicalUrl: form.seoCanonicalUrl.trim() || undefined,
        ogTitle: form.seoOgTitle.trim() || undefined,
        ogDescription: form.seoOgDescription.trim() || undefined,
        ogImage:
          form.seoOgImageUrl.trim().length > 0
            ? { url: form.seoOgImageUrl.trim(), alt: form.seoOgImageAlt.trim() || undefined }
            : undefined,
        robotsIndex: form.robotsIndex,
        robotsFollow: form.robotsFollow,
      },
      meta: {
        editor: 'tiptap',
        updatedBy: currentUser?.id,
      },
    };
  };

  const uploadFeaturedImage = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Only image files are supported.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be smaller than 5MB.' });
      return;
    }
    if (!accessToken) {
      setMessage({ type: 'error', text: 'Admin session expired. Please sign in again.' });
      return;
    }
    try {
      setUploadingHero(true);
      const res = await uploadMedia(file, accessToken, { folder: 'blogs' });
      setForm((p) => ({ ...p, featuredImageUrl: res.file.url }));
      setMessage({ type: 'success', text: 'Featured image uploaded.' });
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : 'Upload failed.';
      setMessage({ type: 'error', text: msg });
    } finally {
      setUploadingHero(false);
    }
  };

  const uploadEditorImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are supported.');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image must be smaller than 5MB.');
    }
    if (!accessToken) {
      throw new Error('Admin session expired. Please sign in again.');
    }
    const res = await uploadMedia(file, accessToken, { folder: 'blogs' });
    return { url: res.file.url };
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!accessToken) {
      setMessage({ type: 'error', text: 'Admin session expired. Please sign in again.' });
      return;
    }
    let payload: CreateBlogPayload | UpdateBlogPayload;
    try {
      payload = buildPayload();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Invalid form.' });
      return;
    }
    try {
      setSaving(true);
      const res =
        mode === 'create'
          ? await adminCreateBlog(payload as CreateBlogPayload, accessToken)
          : await adminUpdateBlog(blog!._id, payload as UpdateBlogPayload, accessToken);
      setMessage({ type: 'success', text: mode === 'create' ? 'Blog created.' : 'Blog updated.' });
      onSaved?.(res.blog);
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : 'Failed to save blog.';
      setMessage({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!blog || !accessToken) return;
    const ok = window.confirm('Delete this blog permanently?');
    if (!ok) return;
    try {
      setDeleting(true);
      await adminDeleteBlog(blog._id, accessToken);
      onDeleted?.();
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : 'Failed to delete blog.';
      setMessage({ type: 'error', text: msg });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {mode === 'create' ? 'Create blog post' : 'Edit blog post'}
            </h2>
            <p className="text-sm text-muted">Write, optimize for SEO, then publish.</p>
          </div>
          {mode === 'edit' && blog && (
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/blog/${blog.slug}`}
                target="_blank"
                className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-muted hover:text-foreground hover:border-foreground/40 transition"
              >
                Preview
              </Link>
              <button
                type="button"
                onClick={onDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-danger hover:bg-danger hover:text-danger-foreground hover:border-danger transition disabled:opacity-60"
              >
                <Trash2 size={16} />
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          )}
        </header>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted/80">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
              placeholder="Eg. How to reduce procurement costs in 2026"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted/80">Slug (optional)</label>
            <input
              value={form.slug}
              onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
              placeholder="reduce-procurement-costs-2026"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-muted/80">Excerpt</label>
          <textarea
            rows={3}
            value={form.excerpt}
            onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
            placeholder="A short summary shown on listing pages and used in SEO when needed."
          />
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-semibold uppercase text-muted/80">Tags (comma separated)</label>
            <input
              value={form.tags}
              onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
              placeholder="procurement, b2b, supply chain"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted/80">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as BlogStatus }))}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted/80">Published at</label>
            <input
              type="datetime-local"
              value={form.publishedAt}
              onChange={(e) => setForm((p) => ({ ...p, publishedAt: e.target.value }))}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
              disabled={form.status !== 'published'}
            />
            <p className="text-xs text-muted">When publishing, empty means “now”.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted/80">Featured image</label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                value={form.featuredImageUrl}
                onChange={(e) => setForm((p) => ({ ...p, featuredImageUrl: e.target.value }))}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                placeholder="https://cdn.example.com/blog/hero.jpg"
              />
              <input
                id="blog-featured-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  uploadFeaturedImage(e.target.files);
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                onClick={() => document.getElementById('blog-featured-upload')?.click()}
                disabled={uploadingHero}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-muted hover:text-foreground hover:border-foreground/40 transition disabled:opacity-60"
              >
                {uploadingHero ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud size={16} />}
                Upload
              </button>
            </div>
            <input
              value={form.featuredImageAlt}
              onChange={(e) => setForm((p) => ({ ...p, featuredImageAlt: e.target.value }))}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
              placeholder="Alt text (recommended)"
            />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Content</h2>
            <p className="text-sm text-muted">Rich text editor outputs clean HTML.</p>
          </div>
        </div>
        <RichTextEditor
          value={form.contentHtml}
          onChange={(html) => setForm((p) => ({ ...p, contentHtml: html }))}
          onUploadImage={uploadEditorImage}
        />
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-5">
        <header>
          <h2 className="text-lg font-semibold text-foreground">SEO</h2>
          <p className="text-sm text-muted">Control titles, descriptions, canonical, and robots.</p>
        </header>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted/80">Meta title</label>
            <input
              value={form.seoMetaTitle}
              onChange={(e) => setForm((p) => ({ ...p, seoMetaTitle: e.target.value }))}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
              placeholder="If empty, we use the blog title."
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted/80">Canonical URL</label>
            <input
              value={form.seoCanonicalUrl}
              onChange={(e) => setForm((p) => ({ ...p, seoCanonicalUrl: e.target.value }))}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
              placeholder="https://yourdomain.com/blog/your-slug"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-muted/80">Meta description</label>
          <textarea
            rows={3}
            value={form.seoMetaDescription}
            onChange={(e) => setForm((p) => ({ ...p, seoMetaDescription: e.target.value }))}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
            placeholder="If empty, we use the excerpt."
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted/80">Keywords (comma separated)</label>
            <input
              value={form.seoKeywords}
              onChange={(e) => setForm((p) => ({ ...p, seoKeywords: e.target.value }))}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
              placeholder="b2b procurement, supplier onboarding, ..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3 items-end">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={form.robotsIndex}
                onChange={(e) => setForm((p) => ({ ...p, robotsIndex: e.target.checked }))}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              Index
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={form.robotsFollow}
                onChange={(e) => setForm((p) => ({ ...p, robotsFollow: e.target.checked }))}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              Follow
            </label>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted/80">OpenGraph title</label>
            <input
              value={form.seoOgTitle}
              onChange={(e) => setForm((p) => ({ ...p, seoOgTitle: e.target.value }))}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted/80">OpenGraph description</label>
            <input
              value={form.seoOgDescription}
              onChange={(e) => setForm((p) => ({ ...p, seoOgDescription: e.target.value }))}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted/80">OG image URL</label>
            <input
              value={form.seoOgImageUrl}
              onChange={(e) => setForm((p) => ({ ...p, seoOgImageUrl: e.target.value }))}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted/80">OG image alt</label>
            <input
              value={form.seoOgImageAlt}
              onChange={(e) => setForm((p) => ({ ...p, seoOgImageAlt: e.target.value }))}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </section>

      {message && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            message.type === 'error'
              ? 'border-destructive/40 bg-destructive/10 text-destructive'
              : 'border-emerald-400/40 bg-emerald-400/10 text-emerald-600'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={saving || !accessToken}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving…' : mode === 'create' ? 'Create blog' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}

export default BlogEditor;



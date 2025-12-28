'use client';

import { useRouter } from 'next/navigation';

import BlogEditor from '@/components/admin/blogs/BlogEditor';
import { useAppSelector } from '@/store/redux/store';

export default function AdminNewBlogPage() {
  const router = useRouter();
  const accessToken = useAppSelector((s) => s.auth.accessToken);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">New blog</h1>
        <p className="text-sm text-muted">Write a new post and publish when ready.</p>
      </header>

      <BlogEditor
        mode="create"
        accessToken={accessToken}
        onSaved={(blog) => router.replace(`/admin/blogs/${blog._id}/edit`)}
      />
    </div>
  );
}



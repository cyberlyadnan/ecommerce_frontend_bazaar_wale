'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, RefreshCcw, ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

import {
  CategoryDto,
  CategoryTreeNode,
  createCategoryApi,
  fetchCategories,
  uploadMedia,
} from '@/services/catalogApi';
import { ApiClientError } from '@/lib/apiClient';
import { useAppSelector } from '@/store/redux/store';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';

interface CategoryFormState {
  name: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
}

interface SubcategoryFormState extends CategoryFormState {
  parent: string;
}

const initialCategoryForm: CategoryFormState = {
  name: '',
  slug: '',
  description: '',
  image: '',
  isActive: true,
};

const initialSubcategoryForm: SubcategoryFormState = {
  ...initialCategoryForm,
  parent: '',
};

export default function VendorCategoriesPage() {
  const router = useRouter();
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [tree, setTree] = useState<CategoryTreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categoryForm, setCategoryForm] = useState(initialCategoryForm);
  const [subcategoryForm, setSubcategoryForm] = useState(initialSubcategoryForm);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [uploadingImage, setUploadingImage] = useState<'category' | 'subcategory' | null>(null);
  const isAuthenticated = Boolean(accessToken);

  const topLevelCategories = useMemo(
    () => categories.filter((category) => !category.parent),
    [categories],
  );

  const loadCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetchCategories();
      setCategories(response.categories);
      setTree(response.tree);
    } catch (err) {
      console.error('Failed to fetch categories', err);
      const message =
        err instanceof ApiClientError ? err.message : 'Unable to load categories right now.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleImageUpload = async (file: File, formType: 'category' | 'subcategory') => {
    if (!file.type.startsWith('image/')) {
      setError('Only image files are supported.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB.');
      return;
    }

    if (!accessToken) {
      setError('Session expired. Please sign in again.');
      return;
    }

    try {
      setUploadingImage(formType);
      setError('');
      const response = await uploadMedia(file, accessToken, { folder: 'categories' });
      const imageUrl = response.file.url;

      if (formType === 'category') {
        setCategoryForm((prev) => ({ ...prev, image: imageUrl }));
      } else {
        setSubcategoryForm((prev) => ({ ...prev, image: imageUrl }));
      }
      setSuccess('Image uploaded successfully.');
    } catch (err) {
      console.error('Image upload failed', err);
      const errorMessage =
        err instanceof ApiClientError ? err.message : 'Unable to upload image right now.';
      setError(errorMessage);
    } finally {
      setUploadingImage(null);
    }
  };

  const handleCreateCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken) {
      setError('Session expired. Please sign in again.');
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await createCategoryApi(
        {
          name: categoryForm.name.trim(),
          slug: categoryForm.slug.trim() || undefined,
          description: categoryForm.description.trim() || undefined,
          image: categoryForm.image || undefined,
          isActive: categoryForm.isActive,
        },
        accessToken,
      );
      setSuccess('Category created successfully.');
      setCategoryForm(initialCategoryForm);
      await loadCategories();
    } catch (err) {
      console.error('Failed to create category', err);
      const message = err instanceof ApiClientError ? err.message : 'Failed to create category.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSubcategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!subcategoryForm.parent) {
      setError('Please choose a parent category for the subcategory.');
      return;
    }
    if (!accessToken) {
      setError('Session expired. Please sign in again.');
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await createCategoryApi(
        {
          name: subcategoryForm.name.trim(),
          slug: subcategoryForm.slug.trim() || undefined,
          description: subcategoryForm.description.trim() || undefined,
          image: subcategoryForm.image || undefined,
          parent: subcategoryForm.parent,
          isActive: subcategoryForm.isActive,
        },
        accessToken,
      );
      setSuccess('Subcategory created successfully.');
      setSubcategoryForm(initialSubcategoryForm);
      await loadCategories();
    } catch (err) {
      console.error('Failed to create subcategory', err);
      const message =
        err instanceof ApiClientError ? err.message : 'Failed to create subcategory.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    const collectIds = (nodes: CategoryTreeNode[]) => {
      nodes.forEach((node) => {
        allIds.add(node._id);
        if (node.children.length > 0) {
          collectIds(node.children);
        }
      });
    };
    collectIds(tree);
    setExpandedCategories(allIds);
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  const renderTree = (nodes: CategoryTreeNode[], level: number = 0) => (
    <div className="space-y-1">
      {nodes.map((node) => {
        const hasChildren = node.children.length > 0;
        const isExpanded = expandedCategories.has(node._id);
        const isParent = level === 0;

        return (
          <div key={node._id} className="select-none">
            <div
              className={`
                group relative flex items-center gap-3 rounded-lg border border-border/60 bg-surface/50 p-3 sm:p-4
                transition-all duration-200 hover:border-border hover:bg-surface hover:shadow-sm
                ${isParent ? 'font-semibold' : ''}
                ${level > 0 ? 'ml-4 sm:ml-6' : ''}
              `}
            >
              {/* Expand/Collapse Button */}
              {hasChildren ? (
                <button
                  onClick={() => toggleCategory(node._id)}
                  className="flex-shrink-0 rounded-md p-1 hover:bg-muted/50 transition-colors"
                  aria-label={isExpanded ? 'Collapse' : 'Expand'}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-muted group-hover:text-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted group-hover:text-foreground" />
                  )}
                </button>
              ) : (
                <div className="w-6 flex-shrink-0" />
              )}

              {/* Category Icon/Image */}
              <div className="flex-shrink-0">
                {node.image ? (
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-border/50">
                    <Image
                      src={node.image}
                      alt={node.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : hasChildren ? (
                  isExpanded ? (
                    <FolderOpen className="w-5 h-5 text-primary" />
                  ) : (
                    <Folder className="w-5 h-5 text-muted" />
                  )
                ) : (
                  <div className="w-5 h-5 rounded-full bg-muted/30 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-muted" />
                  </div>
                )}
              </div>

              {/* Category Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm truncate ${
                        isParent ? 'font-semibold text-foreground' : 'font-medium text-foreground'
                      }`}
                    >
                      {node.name}
                    </p>
                    <p className="text-xs text-muted truncate">/{node.slug}</p>
                    {node.description && (
                      <p className="text-xs text-muted mt-1 line-clamp-1">{node.description}</p>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
                      node.isActive
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-muted/20 text-muted'
                    }`}
                  >
                    {node.isActive ? 'Active' : 'Archived'}
                  </span>
                </div>
              </div>
            </div>

            {/* Children */}
            {hasChildren && isExpanded && (
              <div className="mt-1 ml-4 sm:ml-6 border-l-2 border-border/30 pl-3 sm:pl-4">
                {renderTree(node.children, level + 1)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Category management</h1>
          <p className="text-sm text-muted">
            Define top-level categories and nested subcategories to organise the product catalogue.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.refresh()}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-muted hover:text-foreground hover:border-foreground/40 transition"
        >
          <RefreshCcw size={16} />
          Refresh page
        </button>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={handleCreateCategory}
          className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Plus size={18} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Create category</h2>
              <p className="text-xs text-muted">Top-level taxonomy for primary navigation.</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold uppercase text-muted/80">Name</label>
              <input
                type="text"
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                placeholder="Eg. Industrial Equipment"
                value={categoryForm.name}
                onChange={(event) =>
                  setCategoryForm((prev) => ({ ...prev, name: event.target.value }))
                }
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-muted/80">Slug (optional)</label>
              <input
                type="text"
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                placeholder="industrial-equipment"
                value={categoryForm.slug}
                onChange={(event) =>
                  setCategoryForm((prev) => ({ ...prev, slug: event.target.value }))
                }
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-muted/80">
                Description (optional)
              </label>
              <textarea
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                rows={3}
                value={categoryForm.description}
                onChange={(event) =>
                  setCategoryForm((prev) => ({ ...prev, description: event.target.value }))
                }
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-muted/80">
                Category Image (optional)
              </label>
              {categoryForm.image ? (
                <div className="mt-2 relative group">
                  <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-border bg-muted/10">
                    <img
                      src={categoryForm.image}
                      alt="Category preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Image load error:', e);
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setCategoryForm((prev) => ({ ...prev, image: '' }))}
                    className="absolute top-2 right-2 p-1.5 bg-danger/90 hover:bg-danger text-white rounded-lg transition-colors"
                    aria-label="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="mt-2 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary transition-colors group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploadingImage === 'category' ? (
                      <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                    ) : (
                      <Upload className="w-8 h-8 text-muted group-hover:text-primary mb-2" />
                    )}
                    <p className="mb-2 text-sm text-muted group-hover:text-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted">PNG, JPG, GIF up to 5MB</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(file, 'category');
                      }
                    }}
                    disabled={uploadingImage === 'category'}
                  />
                </label>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                checked={categoryForm.isActive}
                onChange={(event) =>
                  setCategoryForm((prev) => ({ ...prev, isActive: event.target.checked }))
                }
              />
              Visible to buyers
            </label>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting || !isAuthenticated}
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </span>
            ) : (
              'Create category'
            )}
          </button>
        </form>

        <form
          onSubmit={handleCreateSubcategory}
          className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Plus size={18} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Create subcategory</h2>
              <p className="text-xs text-muted">Attach to a parent category for deeper navigation.</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold uppercase text-muted/80">Parent category</label>
              <select
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                value={subcategoryForm.parent}
                onChange={(event) =>
                  setSubcategoryForm((prev) => ({ ...prev, parent: event.target.value }))
                }
                required
              >
                <option value="">Select parent category</option>
                {topLevelCategories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-muted/80">Name</label>
              <input
                type="text"
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                placeholder="Eg. Hydraulic Components"
                value={subcategoryForm.name}
                onChange={(event) =>
                  setSubcategoryForm((prev) => ({ ...prev, name: event.target.value }))
                }
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-muted/80">Slug (optional)</label>
              <input
                type="text"
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                placeholder="hydraulic-components"
                value={subcategoryForm.slug}
                onChange={(event) =>
                  setSubcategoryForm((prev) => ({ ...prev, slug: event.target.value }))
                }
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-muted/80">
                Description (optional)
              </label>
              <textarea
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                rows={3}
                value={subcategoryForm.description}
                onChange={(event) =>
                  setSubcategoryForm((prev) => ({ ...prev, description: event.target.value }))
                }
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-muted/80">
                Subcategory Image (optional)
              </label>
              {subcategoryForm.image ? (
                <div className="mt-2 relative group">
                  <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-border bg-muted/10">
                    <img
                      src={subcategoryForm.image}
                      alt="Subcategory preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Image load error:', e);
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubcategoryForm((prev) => ({ ...prev, image: '' }))}
                    className="absolute top-2 right-2 p-1.5 bg-danger/90 hover:bg-danger text-white rounded-lg transition-colors"
                    aria-label="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="mt-2 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary transition-colors group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploadingImage === 'subcategory' ? (
                      <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                    ) : (
                      <Upload className="w-8 h-8 text-muted group-hover:text-primary mb-2" />
                    )}
                    <p className="mb-2 text-sm text-muted group-hover:text-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted">PNG, JPG, GIF up to 5MB</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(file, 'subcategory');
                      }
                    }}
                    disabled={uploadingImage === 'subcategory'}
                  />
                </label>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                checked={subcategoryForm.isActive}
                onChange={(event) =>
                  setSubcategoryForm((prev) => ({ ...prev, isActive: event.target.checked }))
                }
              />
              Visible to buyers
            </label>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting || !isAuthenticated}
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </span>
            ) : (
              'Create subcategory'
            )}
          </button>
        </form>
      </section>

      {(error || success) && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            error
              ? 'border-destructive/40 bg-destructive/10 text-destructive'
              : 'border-emerald-400/40 bg-emerald-400/10 text-emerald-600'
          }`}
        >
          {error || success}
        </div>
      )}

      <section className="rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-sm">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Category structure</h2>
            <p className="text-sm text-muted">
              {loading ? 'Loading categories…' : 'Review hierarchy and confirm visibility.'}
            </p>
          </div>
          {!loading && tree.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={expandAll}
                className="px-3 py-1.5 text-xs font-semibold text-muted hover:text-foreground border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-3 py-1.5 text-xs font-semibold text-muted hover:text-foreground border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                Collapse All
              </button>
            </div>
          )}
        </header>

        <div className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-12 text-sm text-muted">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Fetching categories…</span>
            </div>
          ) : tree.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
                <Folder className="w-8 h-8 text-muted" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">No categories yet</p>
              <p className="text-xs text-muted">Create a category to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">{renderTree(tree)}</div>
          )}
        </div>
      </section>
    </div>
  );
}


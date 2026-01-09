'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, Sparkles, Trash2, UploadCloud } from 'lucide-react';

import {
  CategoryDto,
  CreateProductPayload,
  ProductDto,
  updateProductApi,
  createProductApi,
  uploadMedia,
} from '@/services/catalogApi';
import { ApiClientError } from '@/lib/apiClient';
import { useAppSelector } from '@/store/redux/store';

interface ProductEditorProps {
  mode: 'create' | 'edit';
  categories: CategoryDto[];
  accessToken: string | null;
  product?: ProductDto;
  onSuccess?: (product: ProductDto) => void;
  isVendor?: boolean; // If true, hide admin-only fields
}

interface AttributeRow {
  key: string;
  value: string;
}

interface ImageRow {
  url: string;
  alt: string;
  order: string;
}

interface PricingTierRow {
  minQty: string;
  pricePerUnit: string;
}

interface ProductFormState {
  title: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription: string;
  category: string;
  subcategory: string;
  price: string;
  stock: string;
  minOrderQty: string;
  weightKg: string;
  tags: string;
  taxCode: string;
  taxPercentage: string;
  isActive: boolean;
  approvedByAdmin: boolean;
  featured: boolean;
  attributes: AttributeRow[];
  images: ImageRow[];
  pricingTiers: PricingTierRow[];
  meta: string;
}

const createInitialFormState = (product?: ProductDto): ProductFormState => ({
  title: product?.title ?? '',
  slug: product?.slug ?? '',
  sku: product?.sku ?? '',
  description: product?.description ?? '',
  shortDescription: product?.shortDescription ?? '',
  category: product?.category?._id ?? '',
  subcategory: product?.subcategory?._id ?? '',
  price: product ? String(product.price) : '',
  stock: product ? String(product.stock ?? '') : '',
  minOrderQty: product ? String(product.minOrderQty ?? '') : '',
  weightKg: product && typeof product.weightKg === 'number' ? String(product.weightKg) : '',
  tags: product?.tags?.join(', ') ?? '',
  taxCode: product?.taxCode ?? 'GST',
  taxPercentage: product?.taxPercentage ? String(product.taxPercentage) : '18',
  isActive: product?.isActive ?? true,
  approvedByAdmin: product?.approvedByAdmin ?? false,
  featured: product?.featured ?? false,
  attributes:
    product?.attributes
      ? Object.entries(product.attributes).map(([key, value]) => ({
          key,
          value,
        }))
      : [{ key: '', value: '' }],
  images:
    product?.images && product.images.length > 0
      ? product.images.map((image) => ({
          url: image.url ?? '',
          alt: image.alt ?? '',
          order: typeof image.order === 'number' ? String(image.order) : '',
        }))
      : [{ url: '', alt: '', order: '' }],
  pricingTiers:
    product?.pricingTiers && product.pricingTiers.length > 0
      ? product.pricingTiers.map((tier) => ({
          minQty: String(tier.minQty),
          pricePerUnit: String(tier.pricePerUnit),
        }))
      : [{ minQty: '', pricePerUnit: '' }],
  meta: product?.meta ? JSON.stringify(product.meta, null, 2) : '',
});

const emptyAttributeRow: AttributeRow = { key: '', value: '' };
const emptyImageRow: ImageRow = { url: '', alt: '', order: '' };
const emptyTierRow: PricingTierRow = { minQty: '', pricePerUnit: '' };

export function ProductEditor({ mode, categories, accessToken, product, onSuccess, isVendor = false }: ProductEditorProps) {
  const currentUser = useAppSelector((state) => state.auth.user);
  const [form, setForm] = useState<ProductFormState>(() => createInitialFormState(product));
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [uploadingImageIndex, setUploadingImageIndex] = useState<number | null>(null);

  useEffect(() => {
    setForm(createInitialFormState(product));
  }, [product]);

  const topLevelCategories = useMemo(
    () => categories.filter((category) => !category.parent),
    [categories],
  );

  const childCategories = useMemo(
    () => categories.filter((category) => category.parent === form.category),
    [categories, form.category],
  );

  const handleFieldChange = <T extends keyof ProductFormState>(field: T, value: ProductFormState[T]) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAttributeChange = (index: number, key: keyof AttributeRow, value: string) => {
    setForm((prev) => {
      const next = [...prev.attributes];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, attributes: next };
    });
  };

  const handleImageChange = (index: number, key: keyof ImageRow, value: string) => {
    setForm((prev) => {
      const next = [...prev.images];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, images: next };
    });
  };

  const handleTierChange = (index: number, key: keyof PricingTierRow, value: string) => {
    setForm((prev) => {
      const next = [...prev.pricingTiers];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, pricingTiers: next };
    });
  };

  const resetMessage = () => setMessage(null);

  const handleImageUpload = async (index: number, fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setMessage({
        type: 'error',
        text: 'Only image files are supported for product media.',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: 'error',
        text: 'Image must be smaller than 5MB.',
      });
      return;
    }

    if (!accessToken) {
      setMessage({
        type: 'error',
        text: 'Admin session expired. Please sign in again before uploading.',
      });
      return;
    }

    try {
      setUploadingImageIndex(index);
      const response = await uploadMedia(file, accessToken, { folder: 'products' });
      const imageUrl = response.file.url;
      console.log('imageUrl', imageUrl);
      setForm((prev) => {
        const next = [...prev.images];
        next[index] = { ...next[index], url: imageUrl, order: next[index].order || String(index) };
        return { ...prev, images: next };
      });
      setMessage({
        type: 'success',
        text: 'Image uploaded successfully. You can update alt text and order below.',
      });
    } catch (err) {
      console.error('Image upload failed', err);
      const errorMessage =
        err instanceof ApiClientError ? err.message : 'Unable to upload image right now.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setUploadingImageIndex(null);
    }
  };

  const handlePopulateSampleData = () => {
    resetMessage();
    setForm((prev) => ({
      ...prev,
      title: 'Men’s Slim Fit Stretchable Denim Jeans',
      slug: 'mens-slim-fit-stretchable-denim-jeans',
      sku: 'SKU-DENIM-001',
      shortDescription: 'Durable indigo denim engineered for daily wear with stretch comfort.',
      description:
        'These slim fit jeans blend premium cotton with stretch fibres for all-day comfort. Reinforced seams and enzyme wash deliver a lived-in feel straight out of the box. Ideal for everyday retail and uniform programmes.',
      price: '1299',
      stock: '120',
      minOrderQty: '12',
      weightKg: '1.2',
      tags: 'denim, jeans, apparel, slim fit',
      attributes: [
        { key: 'Fabric composition', value: '98% cotton / 2% elastane' },
        { key: 'Wash', value: 'Enzyme stone wash' },
        { key: 'Fit', value: 'Slim taper' },
        { key: 'Sizes', value: '28-38 (even sizes)' },
      ],
      images: [
        {
          url: 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/463907/item/goods_62_463907_3x4.jpg?width=494',
          alt: 'Front view of slim fit stretch denim jeans',
          order: '0',
        },
        {
          url: 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/463907/item/goods_69_463907_3x4.jpg?width=494',
          alt: 'Back view highlighting pockets and stitching',
          order: '1',
        },
      ],
      pricingTiers: [
        { minQty: '24', pricePerUnit: '1249' },
        { minQty: '60', pricePerUnit: '1189' },
      ],
      meta: JSON.stringify(
        {
          hsn: '620342',
          care: ['Machine wash cold', 'Do not bleach', 'Tumble dry low'],
          packaging: 'Individually polybagged with size stickers',
        },
        null,
        2,
      ),
    }));
    setMessage({
      type: 'success',
      text: 'Sample product data loaded. Adjust values to match your catalogue.',
    });
  };

  const buildPayload = (vendorId: string): CreateProductPayload => {
    const attributes = form.attributes.reduce<Record<string, string>>((acc, row) => {
      if (row.key.trim() && row.value.trim()) {
        acc[row.key.trim()] = row.value.trim();
      }
      return acc;
    }, {});

    const images = form.images
      .filter((image) => image.url.trim())
      .map((image, index) => ({
        url: image.url.trim(),
        alt: image.alt.trim() || undefined,
        order: image.order ? Number(image.order) : index,
      }));

    const pricingTiers = form.pricingTiers
      .filter((tier) => tier.minQty && tier.pricePerUnit)
      .map((tier) => ({
        minQty: Number(tier.minQty),
        pricePerUnit: Number(tier.pricePerUnit),
      }));

    let meta: Record<string, unknown> | undefined;
    if (form.meta.trim()) {
      try {
        meta = JSON.parse(form.meta.trim());
      } catch (error) {
        throw new Error('Meta field must be valid JSON.');
      }
    }

    return {
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      sku: form.sku.trim() || undefined,
      description: form.description.trim() || undefined,
      shortDescription: form.shortDescription.trim() || undefined,
      category: form.category || undefined,
      subcategory: form.subcategory || undefined,
      vendorId,
      price: Number(form.price),
      stock: form.stock ? Number(form.stock) : undefined,
      minOrderQty: form.minOrderQty ? Number(form.minOrderQty) : undefined,
      weightKg: form.weightKg ? Number(form.weightKg) : undefined,
      taxCode: form.taxCode || 'GST',
      taxPercentage: form.taxPercentage ? Number(form.taxPercentage) : 18,
      tags: form.tags
        ? form.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : undefined,
      isActive: form.isActive,
      // Vendors cannot set approvedByAdmin or featured - only admins can
      ...(isVendor ? {} : { 
        approvedByAdmin: form.approvedByAdmin,
        featured: form.featured,
      }),
      attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
      images,
      pricingTiers,
      meta,
    };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessage();

    if (!form.title.trim()) {
      setMessage({ type: 'error', text: 'Product title is required.' });
      return;
    }
    if (!form.price) {
      setMessage({ type: 'error', text: 'Product price is required.' });
      return;
    }
    if (!accessToken) {
      setMessage({ type: 'error', text: 'Admin session expired. Please sign in again.' });
      return;
    }

    const vendorId = product?.vendor?._id ?? currentUser?.id;
    if (!vendorId) {
      setMessage({
        type: 'error',
        text: 'Unable to determine the product owner. Please re-authenticate.',
      });
      return;
    }

    let payload: CreateProductPayload;
    try {
      payload = buildPayload(vendorId);
    } catch (error) {
      if (error instanceof Error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'error', text: 'Unable to prepare payload.' });
      }
      return;
    }

    setSubmitting(true);
    try {
      const response =
        mode === 'create'
          ? await createProductApi(payload, accessToken)
          : await updateProductApi(product!._id, payload, accessToken);
      setMessage({
        type: 'success',
        text: mode === 'create' ? 'Product created successfully.' : 'Product updated successfully.',
      });
      if (mode === 'create') {
        setForm(createInitialFormState());
      }
      onSuccess?.(response.product);
    } catch (error) {
      console.error('Failed to save product', error);
      const message =
        error instanceof ApiClientError ? error.message : 'Failed to save product. Please retry.';
      setMessage({ type: 'error', text: message });
    } finally {
      setSubmitting(false);
    }
  };

  const addAttributeRow = () =>
    setForm((prev) => ({ ...prev, attributes: [...prev.attributes, { ...emptyAttributeRow }] }));
  const removeAttributeRow = (index: number) =>
    setForm((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, rowIndex) => rowIndex !== index),
    }));

  const addImageRow = () =>
    setForm((prev) => ({ ...prev, images: [...prev.images, { ...emptyImageRow }] }));
  const removeImageRow = (index: number) =>
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, rowIndex) => rowIndex !== index),
    }));

  const addTierRow = () =>
    setForm((prev) => ({ ...prev, pricingTiers: [...prev.pricingTiers, { ...emptyTierRow }] }));
  const removeTierRow = (index: number) =>
    setForm((prev) => ({
      ...prev,
      pricingTiers: prev.pricingTiers.filter((_, rowIndex) => rowIndex !== index),
    }));

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {product?.vendor && (
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Vendor information</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase text-muted/80">Vendor name</p>
              <p className="mt-1 text-sm font-medium text-foreground">{product.vendor.name}</p>
            </div>
            {product.vendor.businessName && (
              <div>
                <p className="text-xs font-semibold uppercase text-muted/80">Business name</p>
                <p className="mt-1 text-sm text-foreground">{product.vendor.businessName}</p>
              </div>
            )}
            {product.vendor.gstNumber && (
              <div>
                <p className="text-xs font-semibold uppercase text-muted/80">GST number</p>
                <p className="mt-1 text-sm text-foreground">{product.vendor.gstNumber}</p>
              </div>
            )}
            {product.vendor.email && (
              <div>
                <p className="text-xs font-semibold uppercase text-muted/80">Email</p>
                <p className="mt-1 text-sm text-foreground">{product.vendor.email}</p>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-5">
        <header>
          <h2 className="text-lg font-semibold text-foreground">
            {mode === 'create' ? 'Create product' : 'Edit product'}
          </h2>
          <p className="text-sm text-muted">
            Capture core information buyers need to evaluate inventory.
          </p>
          {mode === 'create' && (
            <button
              type="button"
              onClick={handlePopulateSampleData}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold text-muted hover:text-foreground hover:border-foreground/40 transition"
            >
              <Sparkles size={14} />
              Fill with sample data
            </button>
          )}
        </header>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase text-muted/80">Title</label>
            <input
              required
              value={form.title}
              onChange={(event) => handleFieldChange('title', event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
              placeholder="Eg. Heavy-duty hydraulic press"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase text-muted/80">Slug (optional)</label>
            <input
              value={form.slug}
              onChange={(event) => handleFieldChange('slug', event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
              placeholder="hydraulic-press-100t"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase text-muted/80">SKU (optional)</label>
          <input
            value={form.sku}
            onChange={(event) => handleFieldChange('sku', event.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
            placeholder="SKU-12345"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase text-muted/80">Category</label>
            <select
              value={form.category}
              onChange={(event) => handleFieldChange('category', event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
            >
              <option value="">Select category</option>
              {topLevelCategories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase text-muted/80">Subcategory</label>
            <select
              value={form.subcategory}
              onChange={(event) => handleFieldChange('subcategory', event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
              disabled={childCategories.length === 0}
            >
              <option value="">
                {childCategories.length > 0 ? 'Select subcategory' : 'No subcategories'}
              </option>
              {childCategories.map((subcategory) => (
                <option key={subcategory._id} value={subcategory._id}>
                  {subcategory.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase text-muted/80">Price</label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) => handleFieldChange('price', event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
              placeholder="Eg. 125000"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase text-muted/80">Stock (units)</label>
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={(event) => handleFieldChange('stock', event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
              placeholder="Eg. 120"
            />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase text-muted/80">
              Minimum order quantity
            </label>
            <input
              type="number"
              min="1"
              value={form.minOrderQty}
              onChange={(event) => handleFieldChange('minOrderQty', event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
              placeholder="Eg. 10"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase text-muted/80">Weight (kg)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.weightKg}
              onChange={(event) => handleFieldChange('weightKg', event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
              placeholder="Eg. 18.5"
            />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase text-muted/80">
              Tax Code <span className="text-danger">*</span>
            </label>
            <select
              value={form.taxCode}
              onChange={(event) => handleFieldChange('taxCode', event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
              required
            >
              <option value="GST">GST</option>
              <option value="IGST">IGST</option>
              <option value="CGST+SGST">CGST+SGST</option>
              <option value="Exempt">Exempt</option>
            </select>
            <p className="text-xs text-muted">
              Select the applicable tax code for this product
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase text-muted/80">
              Tax Percentage (%) <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={form.taxPercentage}
              onChange={(event) => handleFieldChange('taxPercentage', event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
              placeholder="Eg. 18"
              required
            />
            <p className="text-xs text-muted">
              Tax percentage (0-100). Default: 18% for GST
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase text-muted/80">Short description</label>
          <textarea
            rows={3}
            value={form.shortDescription}
            onChange={(event) => handleFieldChange('shortDescription', event.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
            placeholder="Concise summary surfaced across listings."
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase text-muted/80">Full description</label>
          <textarea
            rows={5}
            value={form.description}
            onChange={(event) => handleFieldChange('description', event.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
            placeholder="Detailed specification, compliance notes, and technical details."
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase text-muted/80">Tags (comma separated)</label>
          <input
            value={form.tags}
            onChange={(event) => handleFieldChange('tags', event.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
            placeholder="Eg. industrial, hydraulic, press"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              checked={form.isActive}
              onChange={(event) => handleFieldChange('isActive', event.target.checked)}
            />
            {isVendor ? 'Public (Live)' : 'Active listing'}
          </label>
          {isVendor && (
            <div className="text-xs text-muted">
              {form.isActive
                ? 'Product is live and visible to customers'
                : 'Product is saved as draft and not visible to customers'}
            </div>
          )}

          {!isVendor && (
            <>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  checked={form.approvedByAdmin}
                  onChange={(event) => handleFieldChange('approvedByAdmin', event.target.checked)}
                />
                Approved by admin
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  checked={form.featured}
                  onChange={(event) => handleFieldChange('featured', event.target.checked)}
                />
                <span className="flex items-center gap-1">
                  <Sparkles size={14} className="text-primary" />
                  Featured product
                </span>
              </label>
            </>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-5">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Images</h2>
            <p className="text-sm text-muted">Specify hosted URLs, alt text, and sort order.</p>
          </div>
          <button
            type="button"
            onClick={addImageRow}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted hover:text-foreground hover:border-foreground/40 transition"
          >
            <Plus size={14} />
            Add image
          </button>
        </header>

        <div className="space-y-4">
          {form.images.map((image, index) => (
            <div
              key={`image-${index}`}
              className="grid gap-3 rounded-xl border border-border/80 bg-background/40 p-4 md:grid-cols-3"
            >
              <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-muted/80">Image URL</label>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      value={image.url}
                      onChange={(event) => handleImageChange(index, 'url', event.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      placeholder="https://cdn.example.com/product.jpg"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        id={`image-upload-${index}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          handleImageUpload(index, event.target.files);
                          event.target.value = '';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById(`image-upload-${index}`)?.click()}
                        className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted hover:text-foreground hover:border-foreground/40 transition disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={uploadingImageIndex === index}
                      >
                        {uploadingImageIndex === index ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Uploading…
                          </>
                        ) : (
                          <>
                            <UploadCloud size={14} />
                            Upload
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-muted">Supports JPG, PNG, WebP up to 5MB.</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted/80">Alt text</label>
                <input
                  value={image.alt}
                  onChange={(event) => handleImageChange(index, 'alt', event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  placeholder="Front view of hydraulic press"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted/80">Order</label>
                <div className="flex items-center gap-2">
                  <input
                    value={image.order}
                    onChange={(event) => handleImageChange(index, 'order', event.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    placeholder="0"
                  />
                  {form.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageRow(index)}
                      className="rounded-lg border border-border bg-surface p-2 text-muted hover:text-destructive hover:border-destructive/60 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-5">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Attributes</h2>
            <p className="text-sm text-muted">Key/value specifications exposed to buyers.</p>
          </div>
          <button
            type="button"
            onClick={addAttributeRow}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted hover:text-foreground hover:border-foreground/40 transition"
          >
            <Plus size={14} />
            Add attribute
          </button>
        </header>

        <div className="space-y-4">
          {form.attributes.map((attribute, index) => (
            <div
              key={`attribute-${index}`}
              className="grid gap-3 rounded-xl border border-border/80 bg-background/40 p-4 md:grid-cols-[1fr_1fr_auto]"
            >
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted/80">Label</label>
                <input
                  value={attribute.key}
                  onChange={(event) => handleAttributeChange(index, 'key', event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  placeholder="Eg. Operating Voltage"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted/80">Value</label>
                <input
                  value={attribute.value}
                  onChange={(event) => handleAttributeChange(index, 'value', event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  placeholder="Eg. 415V"
                />
              </div>
              <div className="flex items-end justify-end">
                {form.attributes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAttributeRow(index)}
                    className="rounded-lg border border-border bg-surface p-2 text-muted hover:text-destructive hover:border-destructive/60 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-5">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Pricing tiers (optional)</h2>
            <p className="text-sm text-muted">Offer bulk pricing for higher order quantities.</p>
          </div>
          <button
            type="button"
            onClick={addTierRow}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted hover:text-foreground hover:border-foreground/40 transition"
          >
            <Plus size={14} />
            Add tier
          </button>
        </header>

        <div className="space-y-4">
          {form.pricingTiers.map((tier, index) => (
            <div
              key={`tier-${index}`}
              className="grid gap-3 rounded-xl border border-border/80 bg-background/40 p-4 md:grid-cols-[1fr_1fr_auto]"
            >
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted/80">Minimum quantity</label>
                <input
                  value={tier.minQty}
                  onChange={(event) => handleTierChange(index, 'minQty', event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  placeholder="Eg. 50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted/80">Unit price</label>
                <input
                  value={tier.pricePerUnit}
                  onChange={(event) => handleTierChange(index, 'pricePerUnit', event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  placeholder="Eg. 115000"
                />
              </div>
              <div className="flex items-end justify-end">
                {form.pricingTiers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTierRow(index)}
                    className="rounded-lg border border-border bg-surface p-2 text-muted hover:text-destructive hover:border-destructive/60 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-3">
        <label className="text-xs font-semibold uppercase text-muted/80">
          Meta data (JSON optional)
        </label>
        <textarea
          rows={5}
          value={form.meta}
          onChange={(event) => handleFieldChange('meta', event.target.value)}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none font-mono"
          placeholder='{"hsn": "8462", "compliance": ["ISO 9001"]}'
        />
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

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting || !accessToken}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : mode === 'create' ? (
            'Create product'
          ) : (
            'Save changes'
          )}
        </button>
      </div>
    </form>
  );
}

export default ProductEditor;



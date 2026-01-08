'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Plus, Edit2, Trash2, Check, Loader2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAppSelector } from '@/store/redux/store';
import {
  Address,
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '@/services/addressApi';
import { ApiClientError } from '@/lib/apiClient';

interface AddressFormData {
  label: string;
  name: string;
  phone: string;
  email: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const router = useRouter();
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddressFormData>({
    defaultValues: {
      country: 'India',
      isDefault: false,
    },
  });

  const loadAddresses = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      const response = await getUserAddresses(accessToken);
      setAddresses(response.addresses);
    } catch (error) {
      console.error('Failed to load addresses:', error);
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : 'Failed to load addresses',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [accessToken]);

  const handleEdit = (index: number) => {
    const address = addresses[index];
    reset({
      label: address.label || '',
      name: address.name,
      phone: address.phone,
      email: address.email || '',
      line1: address.line1,
      line2: address.line2 || '',
      city: address.city,
      state: address.state,
      country: address.country || 'India',
      postalCode: address.postalCode,
      isDefault: address.isDefault || false,
    });
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDelete = async (index: number) => {
    if (!accessToken) return;

    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      setDeletingIndex(index);
      const response = await deleteAddress(index, accessToken);
      setAddresses(response.addresses);
      toast.success('Address deleted successfully');
    } catch (error) {
      console.error('Failed to delete address:', error);
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : 'Failed to delete address',
      );
    } finally {
      setDeletingIndex(null);
    }
  };

  const handleSetDefault = async (index: number) => {
    if (!accessToken) return;

    try {
      const response = await setDefaultAddress(index, accessToken);
      setAddresses(response.addresses);
      toast.success('Default address updated');
    } catch (error) {
      console.error('Failed to set default address:', error);
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : 'Failed to update default address',
      );
    }
  };

  const onSubmit = async (data: AddressFormData) => {
    if (!accessToken) return;

    try {
      setSubmitting(true);

      const addressData: Omit<Address, 'isDefault'> & { isDefault?: boolean } = {
        label: data.label || undefined,
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        line1: data.line1,
        line2: data.line2 || undefined,
        city: data.city,
        state: data.state,
        country: data.country || 'India',
        postalCode: data.postalCode,
        isDefault: data.isDefault,
      };

      if (editingIndex !== null) {
        const response = await updateAddress(editingIndex, addressData, accessToken);
        setAddresses(response.addresses);
        toast.success('Address updated successfully');
      } else {
        const response = await addAddress(addressData, accessToken);
        setAddresses(response.addresses);
        toast.success('Address added successfully');
      }

      setShowForm(false);
      setEditingIndex(null);
      reset();
    } catch (error) {
      console.error('Failed to save address:', error);
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : 'Failed to save address',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingIndex(null);
    reset();
  };

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Profile</span>
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Saved Addresses</h1>
              <p className="text-muted mt-2">Manage your delivery addresses</p>
            </div>
            {!showForm && (
              <button
                onClick={() => {
                  reset();
                  setEditingIndex(null);
                  setShowForm(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add New Address
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Address Form */}
        {showForm && !loading && (
          <div className="mb-6 sm:mb-8 bg-surface rounded-xl border-2 border-primary/20 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                {editingIndex !== null ? 'Edit Address' : 'Add New Address'}
              </h2>
              <button
                onClick={handleCancel}
                className="p-1.5 text-muted hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSubmit(onSubmit)(e);
              }}
              className="space-y-4 sm:space-y-5"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Label (e.g., Home, Office)
                  </label>
                  <input
                    type="text"
                    {...register('label')}
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                    placeholder="Home, Office, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    {...register('name', {
                      required: 'Name is required',
                      minLength: { value: 2, message: 'Name must be at least 2 characters' },
                    })}
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-danger">{errors.name.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    {...register('phone', {
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: 'Invalid phone number (must be 10 digits starting with 6-9)',
                      },
                    })}
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-danger">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    {...register('email', {
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-danger">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  {...register('line1', {
                    required: 'Address line 1 is required',
                  })}
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                />
                {errors.line1 && (
                  <p className="mt-1 text-sm text-danger">{errors.line1.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  {...register('line2')}
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    {...register('city', {
                      required: 'City is required',
                    })}
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-danger">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    {...register('state', {
                      required: 'State is required',
                    })}
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  />
                  {errors.state && (
                    <p className="mt-1 text-sm text-danger">{errors.state.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    {...register('postalCode', {
                      required: 'Postal code is required',
                      pattern: {
                        value: /^\d{6}$/,
                        message: 'Invalid postal code (must be 6 digits)',
                      },
                    })}
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  />
                  {errors.postalCode && (
                    <p className="mt-1 text-sm text-danger">{errors.postalCode.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    {...register('country', {
                      required: 'Country is required',
                    })}
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  />
                  {errors.country && (
                    <p className="mt-1 text-sm text-danger">{errors.country.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  {...register('isDefault')}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="isDefault" className="text-sm font-medium text-foreground">
                  Set as default address
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary text-primary-foreground py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Address'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2.5 sm:py-3 border border-border rounded-lg font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Addresses List */}
        {!loading && !showForm && (
          <div className="space-y-4">
            {addresses.length === 0 ? (
              <div className="bg-surface rounded-xl border border-border p-8 sm:p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No addresses saved</h3>
                <p className="text-sm text-muted mb-6">
                  Add your first address to get started with faster checkout
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Address
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    Your Addresses ({addresses.length})
                  </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {addresses.map((address, index) => (
                    <div
                      key={index}
                      className={`relative bg-surface rounded-xl border-2 p-4 sm:p-5 shadow-sm transition-all ${
                        address.isDefault
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="font-semibold text-foreground truncate">
                              {address.label || 'Address'}
                            </span>
                            {address.isDefault && (
                              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full whitespace-nowrap">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted space-y-1">
                            <p className="font-medium text-foreground">{address.name}</p>
                            <p className="line-clamp-2">{address.line1}</p>
                            {address.line2 && <p className="line-clamp-1">{address.line2}</p>}
                            <p>
                              {address.city}, {address.state} {address.postalCode}
                            </p>
                            <p>{address.country || 'India'}</p>
                            <p className="pt-1">Phone: {address.phone}</p>
                            {address.email && <p>Email: {address.email}</p>}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border">
                        {!address.isDefault && (
                          <button
                            onClick={() => handleSetDefault(index)}
                            className="flex-1 sm:flex-none text-xs px-3 py-1.5 text-primary hover:bg-primary/10 rounded-lg font-medium transition-colors"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(index)}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-muted hover:text-primary hover:bg-primary/10 rounded-lg font-medium transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          disabled={deletingIndex === index}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-muted hover:text-destructive hover:bg-destructive/10 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                          {deletingIndex === index ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

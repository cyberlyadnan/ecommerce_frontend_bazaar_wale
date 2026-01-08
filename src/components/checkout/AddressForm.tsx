'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

import { Address, addAddress, updateAddress } from '@/services/addressApi';
import { ApiClientError } from '@/lib/apiClient';

interface AddressFormProps {
  initialAddress?: Address;
  onSave: (savedAddress?: Address) => void;
  onCancel: () => void;
  accessToken: string;
  addressIndex?: number | null;
}

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

export function AddressForm({
  initialAddress,
  onSave,
  onCancel,
  accessToken,
  addressIndex,
}: AddressFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormData>({
    defaultValues: {
      label: initialAddress?.label || '',
      name: initialAddress?.name || '',
      phone: initialAddress?.phone || '',
      email: initialAddress?.email || '',
      line1: initialAddress?.line1 || '',
      line2: initialAddress?.line2 || '',
      city: initialAddress?.city || '',
      state: initialAddress?.state || '',
      country: initialAddress?.country || 'India',
      postalCode: initialAddress?.postalCode || '',
      isDefault: initialAddress?.isDefault || false,
    },
  });

  const onSubmit = async (data: AddressFormData) => {
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

      let savedAddress: Address | null = null;

      if (addressIndex !== null && addressIndex !== undefined) {
        // Update existing address
        const response = await updateAddress(addressIndex, addressData, accessToken);
        toast.success('Address updated successfully');
        savedAddress = response.addresses[addressIndex];
      } else {
        // Add new address
        const response = await addAddress(addressData, accessToken);
        toast.success('Address added successfully');
        // Get the newly added address (last one in the array)
        savedAddress = response.addresses[response.addresses.length - 1];
      }

      // Pass the saved address to the callback
      onSave(savedAddress);
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

  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent bubbling to parent form
        handleSubmit(onSubmit)(e);
      }} 
      className="space-y-4"
      onClick={(e) => e.stopPropagation()} // Prevent any clicks from bubbling
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          {addressIndex !== null && addressIndex !== undefined ? 'Edit Address' : 'Add New Address'}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 text-muted hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Label (e.g., Home, Office)
          </label>
          <input
            type="text"
            {...register('label')}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
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
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-danger">{errors.name.message}</p>
          )}
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
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
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
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
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
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
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
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
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
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
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
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
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
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
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
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
            />
            {errors.country && (
              <p className="mt-1 text-sm text-danger">{errors.country.message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
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
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSubmit(onSubmit)(e);
          }}
          disabled={submitting}
          className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          onClick={onCancel}
          className="px-6 py-2.5 border border-border rounded-lg font-semibold text-foreground hover:bg-muted transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

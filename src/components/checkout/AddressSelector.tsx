'use client';

import { useEffect, useState } from 'react';
import { MapPin, Plus, Edit2, Trash2, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { Address, getUserAddresses, deleteAddress, setDefaultAddress } from '@/services/addressApi';
import { ApiClientError } from '@/lib/apiClient';
import { AddressForm } from './AddressForm';

interface AddressSelectorProps {
  selectedAddress: Address | null;
  onSelectAddress: (address: Address) => void;
  accessToken: string;
}

export function AddressSelector({ selectedAddress, onSelectAddress, accessToken }: AddressSelectorProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const response = await getUserAddresses(accessToken);
      setAddresses(response.addresses);
      
      // Auto-select default address if available and none selected
      // Only auto-select if we're not in the middle of saving an address
      if (!selectedAddress && response.addresses.length > 0 && !showAddForm && editingIndex === null) {
        const defaultAddr = response.addresses.find((addr) => addr.isDefault) || response.addresses[0];
        onSelectAddress(defaultAddr);
      }
      
      return response.addresses;
    } catch (error) {
      console.error('Failed to load addresses:', error);
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : 'Failed to load saved addresses',
      );
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [accessToken]);

  const handleDelete = async (index: number) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      setDeletingIndex(index);
      const response = await deleteAddress(index, accessToken);
      setAddresses(response.addresses);
      
      // If deleted address was selected, select default or first
      if (selectedAddress && addresses[index] === selectedAddress) {
        const newDefault = response.addresses.find((addr) => addr.isDefault) || response.addresses[0];
        if (newDefault) {
          onSelectAddress(newDefault);
        }
      }
      
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

  const handleAddressSaved = async (savedAddress?: Address) => {
    setShowAddForm(false);
    setEditingIndex(null);
    
    // Reload addresses to get the latest list
    const updatedAddresses = await loadAddresses();
    
    // If a saved address was provided, select it automatically
    if (savedAddress && updatedAddresses.length > 0) {
      // Find the address in the updated list by matching properties
      const foundAddress = updatedAddresses.find(
        (addr) =>
          addr.name === savedAddress.name &&
          addr.phone === savedAddress.phone &&
          addr.line1 === savedAddress.line1 &&
          addr.postalCode === savedAddress.postalCode
      );
      
      if (foundAddress) {
        // Small delay to ensure state is updated
        setTimeout(() => {
          onSelectAddress(foundAddress);
        }, 100);
      } else if (updatedAddresses.length > 0) {
        // If we can't find the exact match, select the last one (newly added)
        setTimeout(() => {
          onSelectAddress(updatedAddresses[updatedAddresses.length - 1]);
        }, 100);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Saved Addresses */}
      {addresses.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground uppercase">Saved Addresses</h3>
          <div className="space-y-2">
            {addresses.map((address, index) => {
              // Compare addresses by their properties since they're new objects after reload
              const isSelected = selectedAddress 
                ? selectedAddress.name === address.name &&
                  selectedAddress.phone === address.phone &&
                  selectedAddress.line1 === address.line1 &&
                  selectedAddress.postalCode === address.postalCode
                : false;
              return (
                <div
                  key={index}
                  className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/50 bg-surface'
                  }`}
                  onClick={() => onSelectAddress(address)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-foreground">
                          {address.label || 'Address'}
                        </span>
                        {address.isDefault && (
                          <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                            Default
                          </span>
                        )}
                        {isSelected && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div className="text-sm text-muted space-y-1">
                        <p className="font-medium text-foreground">{address.name}</p>
                        <p>{address.line1}</p>
                        {address.line2 && <p>{address.line2}</p>}
                        <p>
                          {address.city}, {address.state} {address.postalCode}
                        </p>
                        <p>{address.country || 'India'}</p>
                        <p className="mt-2">Phone: {address.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!address.isDefault && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetDefault(index);
                          }}
                          className="p-1.5 text-xs text-muted hover:text-primary transition-colors"
                          title="Set as default"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingIndex(index);
                        }}
                        className="p-1.5 text-muted hover:text-primary transition-colors"
                        title="Edit address"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(index);
                        }}
                        disabled={deletingIndex === index}
                        className="p-1.5 text-muted hover:text-destructive transition-colors disabled:opacity-50"
                        title="Delete address"
                      >
                        {deletingIndex === index ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add New Address Button */}
      {!showAddForm && editingIndex === null && (
        <button
          type="button"
          onClick={() => {
            setShowAddForm(true);
            setSelectedAddress(null);
          }}
          className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-lg text-muted hover:border-primary hover:text-primary transition-colors bg-surface/50 hover:bg-surface"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add New Address</span>
        </button>
      )}

      {/* Add/Edit Address Form */}
      {(showAddForm || editingIndex !== null) && (
        <div className="border-2 border-primary/20 rounded-lg p-5 bg-surface shadow-sm">
          <AddressForm
            initialAddress={editingIndex !== null ? addresses[editingIndex] : undefined}
            onSave={handleAddressSaved}
            onCancel={() => {
              setShowAddForm(false);
              setEditingIndex(null);
            }}
            accessToken={accessToken}
            addressIndex={editingIndex}
          />
        </div>
      )}
    </div>
  );
}

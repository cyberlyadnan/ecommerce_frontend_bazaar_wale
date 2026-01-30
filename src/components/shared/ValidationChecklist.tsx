'use client';

import { Check, X } from 'lucide-react';

export interface ChecklistItem {
  label: string;
  met: boolean;
}

interface ValidationChecklistProps {
  items: ChecklistItem[];
  className?: string;
}

export function ValidationChecklist({ items, className = '' }: ValidationChecklistProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item) => (
        <div
          key={item.label}
          className={`flex items-center gap-2 text-sm ${
            item.met ? 'text-success' : 'text-muted'
          }`}
        >
          {item.met ? (
            <Check className="w-4 h-4 flex-shrink-0" />
          ) : (
            <X className="w-4 h-4 flex-shrink-0 opacity-50" />
          )}
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { isValidPhone } from '@/utils/validation';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface FieldErrors {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
}

export function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (message) setMessage(null);
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const errors: FieldErrors = {};
    if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    if (formData.phone.trim() && !isValidPhone(formData.phone)) {
      errors.phone = 'Enter a valid 10-digit Indian number (e.g. 98765 43210) or international format';
    }
    if (formData.subject.trim().length < 3) {
      errors.subject = 'Subject must be at least 3 characters';
    }
    if (formData.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) {
      setMessage({
        type: 'error',
        text: 'Please correct the errors below and try again.',
      });
      return;
    }
    setFieldErrors({});
    setMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit contact form');
      }

      setMessage({
        type: 'success',
        text: data.message || 'Thank you! Your message has been sent successfully.',
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      console.error('Failed to submit contact form:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to send message. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div
          className={`flex items-center gap-3 rounded-xl p-4 border backdrop-blur-sm ${
            message.type === 'success'
              ? 'bg-success/10 border-success/20 text-success'
              : 'bg-destructive/10 border-destructive/20 text-destructive'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
            Full Name <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            minLength={2}
            maxLength={100}
            value={formData.name}
            onChange={handleChange}
            className={`w-full rounded-xl border bg-background/50 backdrop-blur-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
              fieldErrors.name ? 'border-destructive' : 'border-border focus:border-primary'
            }`}
            placeholder="John Doe"
          />
          {fieldErrors.name && (
            <p className="mt-1.5 text-sm text-destructive">{fieldErrors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
            Email Address <span className="text-destructive">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className={`w-full rounded-xl border bg-background/50 backdrop-blur-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
              fieldErrors.email ? 'border-destructive' : 'border-border focus:border-primary'
            }`}
            placeholder="john@example.com"
          />
          {fieldErrors.email && (
            <p className="mt-1.5 text-sm text-destructive">{fieldErrors.email}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-semibold text-foreground mb-2">
          Phone Number <span className="text-muted text-xs font-normal">(Optional)</span>
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          maxLength={20}
          value={formData.phone}
          onChange={handleChange}
          className={`w-full rounded-xl border bg-background/50 backdrop-blur-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
            fieldErrors.phone ? 'border-destructive' : 'border-border focus:border-primary'
          }`}
          placeholder="+91 98765 43210"
        />
        {fieldErrors.phone && (
          <p className="mt-1.5 text-sm text-destructive">{fieldErrors.phone}</p>
        )}
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-semibold text-foreground mb-2">
          Subject <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          required
          minLength={3}
          maxLength={200}
          value={formData.subject}
          onChange={handleChange}
          className={`w-full rounded-xl border bg-background/50 backdrop-blur-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
            fieldErrors.subject ? 'border-destructive' : 'border-border focus:border-primary'
          }`}
          placeholder="What is your inquiry about?"
        />
        {fieldErrors.subject && (
          <p className="mt-1.5 text-sm text-destructive">{fieldErrors.subject}</p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-foreground mb-2">
          Message <span className="text-destructive">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          value={formData.message}
          onChange={handleChange}
          className={`w-full rounded-xl border bg-background/50 backdrop-blur-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all ${
            fieldErrors.message ? 'border-destructive' : 'border-border focus:border-primary'
          }`}
          placeholder="Please provide details about your inquiry..."
        />
        {fieldErrors.message && (
          <p className="mt-1.5 text-sm text-destructive">{fieldErrors.message}</p>
        )}
        <p className="text-xs text-muted mt-2">
          {formData.message.length}/5000 characters
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:from-primary/90 hover:to-secondary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Send Message
          </>
        )}
      </button>
    </form>
  );
}


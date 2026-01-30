/**
 * Phone validation - supports Indian (+91) and international formats
 */
export function isValidPhone(value: string): boolean {
  if (!value || !value.trim()) return true; // optional field
  const digits = value.replace(/\D/g, '');
  if (digits.length === 10 && /^[6-9]/.test(digits)) return true; // Indian 10-digit
  if (digits.length === 12 && digits.startsWith('91') && /^91[6-9]/.test(digits)) return true; // +91
  if (digits.length >= 10 && digits.length <= 15 && !digits.startsWith('0')) return true; // International
  return false;
}

export function getPhoneError(value: string): string | null {
  if (!value || !value.trim()) return null;
  if (!isValidPhone(value)) {
    return 'Enter a valid 10-digit Indian number (e.g. 98765 43210) or international format (+1 234 567 8900)';
  }
  return null;
}

/**
 * Password strength validation
 */
export interface PasswordChecks {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export function getPasswordChecks(password: string): PasswordChecks {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  };
}

export function isPasswordStrong(password: string): boolean {
  const checks = getPasswordChecks(password);
  return (
    checks.minLength &&
    checks.hasUppercase &&
    checks.hasLowercase &&
    checks.hasNumber &&
    checks.hasSpecial
  );
}

export function isPasswordAcceptable(password: string): boolean {
  const checks = getPasswordChecks(password);
  return checks.minLength && (checks.hasNumber || checks.hasSpecial);
}

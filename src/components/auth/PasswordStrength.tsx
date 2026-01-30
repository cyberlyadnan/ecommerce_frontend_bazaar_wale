'use client';

import { getPasswordChecks, type PasswordChecks } from '@/utils/validation';
import { ValidationChecklist } from '@/components/shared/ValidationChecklist';

interface PasswordStrengthProps {
  password: string;
  confirmPassword?: string;
  showConfirm?: boolean;
  className?: string;
}

const PASSWORD_LABELS: Record<keyof PasswordChecks, string> = {
  minLength: 'At least 8 characters',
  hasUppercase: 'One uppercase letter',
  hasLowercase: 'One lowercase letter',
  hasNumber: 'One number',
  hasSpecial: 'One special character (!@#$%^&*)',
};

export function PasswordStrength({
  password,
  confirmPassword = '',
  showConfirm = false,
  className = '',
}: PasswordStrengthProps) {
  const checks = getPasswordChecks(password);
  const checklist: { label: string; met: boolean }[] = Object.entries(checks).map(
    ([key, met]) => ({ label: PASSWORD_LABELS[key as keyof PasswordChecks], met }),
  );
  if (showConfirm) {
    checklist.push({
      label: 'Passwords match',
      met: !!password && password === confirmPassword,
    });
  }
  return <ValidationChecklist items={checklist} className={className} />;
}

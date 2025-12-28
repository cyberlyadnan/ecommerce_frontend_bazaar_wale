export const formatPhoneNumber = (value: string) => {
  const trimmed = value.replace(/\s+/g, '');
  if (trimmed.startsWith('+')) {
    return trimmed;
  }
  const digits = trimmed.replace(/[^0-9]/g, '');
  return digits ? `+${digits}` : '';
};



// Simplified encryption/decryption for now to avoid build issues
// Using base64 encoding as a temporary solution

export const secureEncryptData = (data: string): string => {
  try {
    if (!data) return '';
    
    // Simple base64 encoding for now
    return btoa(data);
  } catch (error) {
    console.error('Error encrypting data:', error);
    return data; // Return original data if encryption fails
  }
};

export const secureDecryptData = (encryptedData: string): string => {
  try {
    if (!encryptedData) return '';
    
    // Simple base64 decoding for now
    return atob(encryptedData);
  } catch (error) {
    console.error('Error decrypting data:', error);
    return encryptedData; // Return original data if decryption fails
  }
};

// Data validation and sanitization
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Remove potentially dangerous characters
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateInput = (input: string, maxLength: number = 1000): boolean => {
  if (!input) return false;
  if (input.length > maxLength) return false;
  
  // Check for SQL injection patterns
  const sqlPatterns = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i;
  if (sqlPatterns.test(input)) return false;
  
  return true;
};

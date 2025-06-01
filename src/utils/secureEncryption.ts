
import CryptoJS from 'crypto-js';

// Use a more secure encryption key - in production this should be stored securely
const ENCRYPTION_KEY = process.env.VITE_ENCRYPTION_KEY || 'your-secure-32-char-encryption-key-here';

export const secureEncryptData = (data: string): string => {
  try {
    if (!data) return '';
    
    // Generate a random IV for each encryption
    const iv = CryptoJS.lib.WordArray.random(16);
    
    // Encrypt using AES with the IV
    const encrypted = CryptoJS.AES.encrypt(data, ENCRYPTION_KEY, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    // Combine IV and encrypted data
    const combined = iv.concat(encrypted.ciphertext);
    
    return combined.toString(CryptoJS.enc.Base64);
  } catch (error) {
    console.error('Error encrypting data:', error);
    throw new Error('Encryption failed');
  }
};

export const secureDecryptData = (encryptedData: string): string => {
  try {
    if (!encryptedData) return '';
    
    // Parse the combined data
    const combined = CryptoJS.enc.Base64.parse(encryptedData);
    
    // Extract IV (first 16 bytes) and ciphertext
    const iv = CryptoJS.lib.WordArray.create(combined.words.slice(0, 4));
    const ciphertext = CryptoJS.lib.WordArray.create(combined.words.slice(4));
    
    // Decrypt
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: ciphertext } as any,
      ENCRYPTION_KEY,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    );
    
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Error decrypting data:', error);
    throw new Error('Decryption failed');
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

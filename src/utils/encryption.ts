
// Simple encryption utility for demo purposes
// In production, use proper encryption libraries and server-side encryption

export const encryptData = (data: string): string => {
  // Using Base64 encoding for demo - replace with proper encryption in production
  return btoa(unescape(encodeURIComponent(data)));
};

export const decryptData = (encryptedData: string): string => {
  try {
    return decodeURIComponent(escape(atob(encryptedData)));
  } catch (error) {
    console.error('Error decrypting data:', error);
    return '[Datos encriptados]';
  }
};

// Generate a simple hash for additional security
export const generateHash = (data: string): string => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
};

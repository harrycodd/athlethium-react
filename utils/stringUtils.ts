// Common string utility functions

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const generateRandomPassword = (length = 16): string => {
  const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const symbolChars = '!@#$%^&*()_+-=';
  const allChars = upperChars + lowerChars + numberChars + symbolChars;
  
  if (length < 4) {
    throw new Error('Password length must be at least 4 to include all required character types');
  }
  
  // Add one character from each required set
  let password = '';
  password += upperChars[Math.floor(Math.random() * upperChars.length)];
  password += lowerChars[Math.floor(Math.random() * lowerChars.length)];
  password += numberChars[Math.floor(Math.random() * numberChars.length)];
  password += symbolChars[Math.floor(Math.random() * symbolChars.length)];
  
  // Fill the rest with random characters
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Fisher-Yates shuffle to randomize character positions
  const passwordArray = password.split('');
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }
  
  return passwordArray.join('');
};

export const getErrorMessage = (err: any): string => {
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object' && 'message' in err) return err.message;
  return JSON.stringify(err);
};

export const validateParams = (params: Record<string, any>, requiredFields: string[]): { valid: boolean; errorMessage?: string } => {
  const missingFields = requiredFields.filter(field => {
    return params[field] === undefined || params[field] === null || params[field] === '';
  });

  if (missingFields.length > 0) {
    return {
      valid: false,
      errorMessage: `Missing required parameters: ${missingFields.join(', ')}`
    };
  }

  return { valid: true };
};

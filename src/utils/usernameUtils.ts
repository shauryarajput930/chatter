/**
 * Utility functions for username operations
 */

export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
export const MIN_USERNAME_LENGTH = 3;
export const MAX_USERNAME_LENGTH = 20;

/**
 * Validates a username according to the following rules:
 * - Must be 3-20 characters long
 * - Can only contain letters, numbers, and underscores
 * - Cannot start or end with underscore
 * - Cannot contain multiple consecutive underscores
 */
export function validateUsername(username: string): {
  isValid: boolean;
  error?: string;
} {
  if (!username) {
    return { isValid: false, error: "Username is required" };
  }

  if (username.length < MIN_USERNAME_LENGTH) {
    return {
      isValid: false,
      error: `Username must be at least ${MIN_USERNAME_LENGTH} characters long`,
    };
  }

  if (username.length > MAX_USERNAME_LENGTH) {
    return {
      isValid: false,
      error: `Username must be no more than ${MAX_USERNAME_LENGTH} characters long`,
    };
  }

  if (!USERNAME_REGEX.test(username)) {
    return {
      isValid: false,
      error: "Username can only contain letters, numbers, and underscores",
    };
  }

  if (username.startsWith('_') || username.endsWith('_')) {
    return {
      isValid: false,
      error: "Username cannot start or end with an underscore",
    };
  }

  if (username.includes('__')) {
    return {
      isValid: false,
      error: "Username cannot contain consecutive underscores",
    };
  }

  return { isValid: true };
}

/**
 * Generates a username suggestion based on a name
 */
export function generateUsernameFromName(name: string): string {
  if (!name) return "";

  // Remove special characters and convert to lowercase
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim();

  // Split into words and take first two
  const words = cleanName.split(/\s+/).filter(word => word.length > 0);
  
  if (words.length === 0) return "";
  
  let username = words[0];
  
  if (words.length > 1) {
    username += words[1];
  }
  
  // Ensure it's within length limits
  if (username.length > MAX_USERNAME_LENGTH - 3) {
    username = username.substring(0, MAX_USERNAME_LENGTH - 3);
  }
  
  // Add random numbers to make it unique
  const randomSuffix = Math.floor(Math.random() * 999);
  username += randomSuffix.toString();
  
  return username;
}

/**
 * Formats a username for display (adds @ prefix)
 */
export function formatUsername(username?: string): string {
  if (!username) return "";
  return `@${username}`;
}

/**
 * Checks if a username is available (placeholder for API call)
 */
export async function checkUsernameAvailability(username: string): Promise<boolean> {
  // This would typically make an API call to check availability
  // For now, return true as a placeholder
  return true;
}

// src/utils/friendlyError.ts

/**
 * Normalizes technical system errors into friendly, plain-English messages
 * suitable for sales representatives and operational staff.
 * Logs raw errors server-side / to console for debugging.
 */
export function getFriendlyErrorMessage(error: any, fallbackMessage?: string): string {
  if (!error) {
    return fallbackMessage || 'An unexpected issue occurred. Please refresh and try again.';
  }

  // Always log detailed technical info to console for developer tracing
  console.error('[LeadOS System Error Log]:', error);

  const raw = typeof error === 'string' ? error : error?.message || error?.error_description || '';
  const lower = raw.toLowerCase();

  if (lower.includes('network') || lower.includes('failed to fetch') || lower.includes('connection') || lower.includes('offline')) {
    return "Couldn't connect. Please check your internet connection and try again.";
  }
  if (lower.includes('jwt') || lower.includes('token') || lower.includes('expired') || lower.includes('session')) {
    return 'Your session has expired. Please sign in again to continue.';
  }
  if (lower.includes('unauthorized') || lower.includes('forbidden') || lower.includes('row-level security') || lower.includes('policy')) {
    return "You don't have permission to modify this record. Please contact your sales manager.";
  }
  if (lower.includes('duplicate') || lower.includes('unique') || lower.includes('already exists')) {
    return 'This lead or record is already registered in the system.';
  }
  if (lower.includes('timeout') || lower.includes('504') || lower.includes('gateway')) {
    return 'The server took a little too long to respond. Please try your action once more.';
  }
  if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
    return 'Incorrect email or password. Please verify your details or use Google Sign-In.';
  }

  return fallbackMessage || "Couldn't save changes. Please check your connection and try again.";
}

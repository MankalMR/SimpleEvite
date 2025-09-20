/**
 * Utility functions for clipboard operations
 */

/**
 * Copy invite link to clipboard
 */
export function copyInviteLink(shareToken: string): void {
  const url = `${window.location.origin}/invite/${shareToken}`;
  navigator.clipboard.writeText(url);
  alert('Invite link copied to clipboard!');
}

/**
 * Copy text to clipboard with optional success message
 */
export async function copyToClipboard(text: string, successMessage?: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    if (successMessage) {
      alert(successMessage);
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    alert('Failed to copy to clipboard');
  }
}

/**
 * Copy invitation URL to clipboard
 */
export function copyInvitationUrl(shareToken: string, customMessage?: string): void {
  const url = `${window.location.origin}/invite/${shareToken}`;
  copyToClipboard(url, customMessage || 'Invitation link copied to clipboard!');
}

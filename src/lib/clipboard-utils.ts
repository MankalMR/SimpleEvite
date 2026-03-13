/**
 * Utility functions for clipboard operations
 */

/**
 * Copy invite link to clipboard
 */
export async function copyInviteLink(shareToken: string): Promise<void> {
  const url = `${window.location.origin}/invite/${shareToken}`;
  try {
    await navigator.clipboard.writeText(url);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    throw new Error('Failed to copy to clipboard');
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    throw new Error('Failed to copy to clipboard');
  }
}

/**
 * Copy invitation URL to clipboard
 */
export async function copyInvitationUrl(shareToken: string): Promise<void> {
  const url = `${window.location.origin}/invite/${shareToken}`;
  await copyToClipboard(url);
}

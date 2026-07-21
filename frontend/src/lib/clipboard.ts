/**
 * Clipboard helpers.
 *
 * The async Clipboard API only exists in a secure context (HTTPS or
 * localhost). Opening the dev server through a LAN IP is plain HTTP, so it is
 * unavailable there. The legacy `document.execCommand('copy')` fallback is
 * unreliable on mobile — it frequently reports success while writing nothing —
 * so we never rely on it to claim success. Instead, callers fall back to
 * selecting the text and letting the user copy natively.
 */

/** Whether programmatic copying can actually be trusted in this context. */
export function canCopyProgrammatically(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.isSecureContext &&
    typeof navigator !== 'undefined' &&
    !!navigator.clipboard?.writeText
  );
}

/**
 * Attempt a programmatic copy.
 *
 * @returns true only when the write is genuinely confirmed.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!canCopyProgrammatically()) return false;

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Select an element's text so the platform's native "Copy" affordance
 * (iOS selection bubble / desktop context menu) becomes available.
 */
export function selectElementContents(element: HTMLElement): void {
  const range = document.createRange();
  range.selectNodeContents(element);

  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

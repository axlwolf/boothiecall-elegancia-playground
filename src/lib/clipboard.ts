/* Cross-platform clipboard helper with iOS fallbacks */

export type CopyResult = { ok: true } | { ok: false; error?: unknown; strategy: 'clipboard' | 'execCommand' | 'prompt' | 'share' };

function isGesture(): boolean {
  // Best-effort: this function is invoked inside a click/tap handler synchronously
  // We cannot truly detect gesture reliably; assume true when called properly.
  return true;
}

export async function copyText(text: string): Promise<CopyResult> {
  // Strategy 1: Async Clipboard API
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function' && isGesture()) {
      await navigator.clipboard.writeText(text);
      return { ok: true };
    }
  } catch (err) {
    // continue to fallback
    return { ok: false, error: err, strategy: 'clipboard' };
  }

  // Strategy 2: execCommand('copy') via hidden textarea (works on many iOS 16 setups)
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.left = '0';
    ta.style.opacity = '0';
    ta.setAttribute('readonly', '');
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand && document.execCommand('copy');
    document.body.removeChild(ta);
    if (ok) return { ok: true };
  } catch (err) {
    // continue to next fallback
    // no return here to try share/prompt
  }

  // Strategy 3: Web Share API as a user-facing fallback (copies via share targets on iOS)
  try {
    if ((navigator as any).share && isGesture()) {
      await (navigator as any).share({ text });
      return { ok: true };
    }
  } catch (err) {
    // continue to prompt
    return { ok: false, error: err, strategy: 'share' };
  }

  // Strategy 4: Prompt fallback to let user copy manually
  try {
    // eslint-disable-next-line no-alert
    const _ = window.prompt('Copy the text below and press OK', text);
    return { ok: !!_, strategy: 'prompt' } as any;
  } catch (err) {
    return { ok: false, error: err, strategy: 'prompt' };
  }
}

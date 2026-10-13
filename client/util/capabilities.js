export function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    );
  } catch {
    return false;
  }
}

export function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

const VIEW_KEY = 'whataudio.view';

/** 'ring' or 'list'. A saved choice wins; otherwise fall back when the ring can't run well. */
export function initialView() {
  try {
    const saved = localStorage.getItem(VIEW_KEY);
    if (saved === 'ring' || saved === 'list') return saved;
  } catch {
    // Storage can be blocked; the default below still works.
  }
  return supportsWebGL() && !prefersReducedMotion() ? 'ring' : 'list';
}

export function saveView(view) {
  try {
    localStorage.setItem(VIEW_KEY, view);
  } catch {
    // Not worth surfacing.
  }
}

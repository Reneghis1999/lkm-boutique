/**
 * Instance du défilement fluide (Lenis) active sur la page, s’il y en a une.
 * Permet au bouton « remonter » de défiler en douceur sans importer Lenis.
 */
type SmoothScroller = {
  scrollTo: (target: number, options?: { duration?: number }) => void;
};

let current: SmoothScroller | null = null;

export function setSmoothScroller(instance: SmoothScroller | null) {
  current = instance;
}

export function getSmoothScroller() {
  return current;
}

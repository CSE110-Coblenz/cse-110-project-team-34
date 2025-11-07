// Lightweight runtime font setup to make custom fonts available across the app
// Injects @font-face and an optional preload once per page.

const FONT_ID = 'app-fonts-lief';
const PRELOAD_ID = 'app-fonts-preload-lief';
const KA1_FONT_ID = 'app-fonts-ka1';
const KA1_PRELOAD_ID = 'app-fonts-preload-ka1';

/** Ensure the 'Lief' font-face is registered in the document. */
export function ensureLiefFontLoaded(): void {
    if (typeof document === 'undefined') return;

    // Add a <link rel="preload"> for faster fetch (safe to add once)
    if (!document.getElementById(PRELOAD_ID)) {
        const link = document.createElement('link');
        link.id = PRELOAD_ID;
        link.rel = 'preload';
        link.as = 'font';
        link.crossOrigin = '';
        link.href = '/my custom font/Lief.ttf';
        document.head.appendChild(link);
    }

    // Inject @font-face only once
    if (!document.getElementById(FONT_ID)) {
        const style = document.createElement('style');
        style.id = FONT_ID;
        style.type = 'text/css';
        style.textContent = `
@font-face {
  font-family: 'Lief';
  src: url('/my custom font/Lief.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
        `;
        document.head.appendChild(style);
    }
}

/** Ensure the 'Ka1' font-face is registered in the document. */
export function ensureKa1FontLoaded(): void {
    if (typeof document === 'undefined') return;

    // Add a <link rel="preload"> for faster fetch (safe to add once)
    if (!document.getElementById(KA1_PRELOAD_ID)) {
        const link = document.createElement('link');
        link.id = KA1_PRELOAD_ID;
        link.rel = 'preload';
        link.as = 'font';
        link.crossOrigin = '';
        link.href = '/my custom font/ka1.ttf';
        document.head.appendChild(link);
    }

    // Inject @font-face only once
    if (!document.getElementById(KA1_FONT_ID)) {
        const style = document.createElement('style');
        style.id = KA1_FONT_ID;
        style.type = 'text/css';
        style.textContent = `
@font-face {
  font-family: 'Ka1';
  src: url('/my custom font/ka1.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
        `;
        document.head.appendChild(style);
    }
}

/** Returns a promise that resolves when document fonts are ready (best-effort). */
export function waitForFontsReady(): Promise<void> {
    const anyDoc = document as any;
    if (anyDoc && anyDoc.fonts && typeof anyDoc.fonts.ready?.then === 'function') {
        return anyDoc.fonts.ready.then(() => undefined).catch(() => undefined);
    }
    // Fallback: small timeout to allow font to load
    return new Promise((resolve) => setTimeout(resolve, 250));
}

# Custom Fonts Guide

This project is set up to use a custom TTF font named "Lief" located in the public folder at: /my custom font/Lief.ttf

The app automatically registers this font at runtime and preloads it so it is available for text across all screens (Menu, Game, etc.).

What’s already wired
- A runtime font loader adds an @font-face for the family name: Lief
- A preload hint is injected to start fetching the font early
- Menu screen triggers a redraw after fonts are ready so Konva text will render with the custom font when used
- Game screen ensures the font is registered as well

How to use the font
- In HTML/CSS: set the font family to Lief (e.g., in component styles or global CSS)
- In Konva (canvas) text: set the text’s font family to Lief (property name: fontFamily)
- In inline SVG (inserted into the DOM): set the font family to Lief via style or attributes

Notes
- Use the web-served path for assets in code (forward slashes). Do not use Windows file-system paths.
- If the font appears to fall back initially, it will switch once loaded. The menu view already schedules a redraw after fonts are ready.
- If you add more custom fonts later, give each a unique and consistent family name and declare them similarly. We can extend the loader if needed.
- For best performance and browser coverage, consider adding a .woff2 version alongside the .ttf and prefer that format when available.

Troubleshooting
- Confirm the font file loads: check the Network tab for 200 OK on /my custom font/Lief.ttf
- Confirm the computed font-family reflects Lief (not a fallback)
- If changes don’t show after replacing the font file, perform a hard refresh or clear cache.

import Konva from 'konva';

/**
 * Create a Konva.Image configured for pixel-art (nearest-neighbor) rendering.
 * Forces imageSmoothingEnabled=false so scaled pixels remain crisp.
 */
export function createPixelImage(
  image: HTMLImageElement,
  config: Partial<Konva.ImageConfig> = {}
): Konva.Image {
  return new Konva.Image({
    image,
    // Apply caller config first, then force nearest-neighbor
    ...config,
    imageSmoothingEnabled: false,
  });
}

export class GameModel {
    // Base background image (Game screen)
    baseBackgroundSrc: string = '/Humble Gift - Paper UI System v1.1/Sprites/Book Desk/desk image.jpg';

    // Secondary background (overlay) image on top of the base background
    overlayBackgroundSrc: string = '/Humble Gift - Paper UI System v1.1/Sprites/Paper UI Pack/Plain/10 Calander/1.png';

    // Overlay scale (use 1,1 for natural size)
    overlayScaleX: number = 1.8;
    overlayScaleY: number = 1.6;

    // Whether to center the overlay after loading
    centerOverlay: boolean = true;

    // Vertical offset to apply to the OVERLAY background and the US SVG map (base background does not move)
    // Negative moves up, positive moves down
    overlayMapOffsetY: number = -90;

    // Additional left-side image configuration
    leftSideImageSrc: string = '/Humble Gift - Paper UI System v1.1/Sprites/Paper UI Pack/Plain/9 Rewards/1.png';
    leftSideImageScaleX: number = 2;
    leftSideImageScaleY: number = 2;
    // Rotate -90 (counter-clockwise) before adding
    leftSideImageRotationDeg: number = -90;
    // Margin from the left edge when positioned
    leftSideImageMarginLeft: number = -260;
    // Vertical offset (px) to move the left-side image up/down (independent of overlay/map)
    leftSideImageOffsetY: number = 90;

    // Image to place below the secondary (overlay) background
    belowOverlayImageSrc: string = '/Humble Gift - Paper UI System v1.1/Sprites/Paper UI Pack/Plain/9 Rewards/2.png';
    belowOverlayImageScaleX: number = 2;
    belowOverlayImageScaleY: number = 1.3;
    // Vertical gap between overlay bottom and this image's top
    belowOverlayMarginTop: number = -25;
}

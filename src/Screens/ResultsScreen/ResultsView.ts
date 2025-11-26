import Konva from 'konva';

export class ResultsView {
    private stage: Konva.Stage;
    private layer: Konva.Layer;
    private backgroundRect: Konva.Rect;
    private vignetteRect: Konva.Rect;
    private sparkleGroup: Konva.Group;
    private cardGroup: Konva.Group;
    private cardRect: Konva.Rect;
    private titleText: Konva.Text;
    private scoreValueText: Konva.Text;
    private messageText: Konva.Text;
    private statsGroup: Konva.Group;
    private statesGroup: Konva.Group;
    private rankGroup: Konva.Group;
    private statesValueText: Konva.Text;
    private rankValueText: Konva.Text;
    private buttonGroup: Konva.Group;
    private buttonRect: Konva.Rect;
    private buttonText: Konva.Text;
    private backButtonElement: HTMLButtonElement | null = null;
    private onBackButtonClick: (() => void) | null = null;
    private resizeHandler: () => void;
    private resizeListenerAttached = false;
    private currentScore = 0;

    constructor(stage: Konva.Stage) {
        this.stage = stage;
        this.layer = new Konva.Layer();
        this.stage.add(this.layer);

        this.backgroundRect = new Konva.Rect({
            x: 0,
            y: 0,
            width: stage.width(),
            height: stage.height(),
            fillLinearGradientStartPoint: { x: 0, y: 0 },
            fillLinearGradientEndPoint: { x: stage.width(), y: stage.height() },
            fillLinearGradientColorStops: [0, '#020617', 1, '#0f172a'],
            listening: false,
        });
        this.layer.add(this.backgroundRect);

        this.sparkleGroup = new Konva.Group({ listening: false });
        this.layer.add(this.sparkleGroup);

        this.vignetteRect = new Konva.Rect({
            x: 0,
            y: 0,
            width: stage.width(),
            height: stage.height(),
            fillRadialGradientStartPoint: { x: stage.width() / 2, y: stage.height() / 2 },
            fillRadialGradientStartRadius: 0,
            fillRadialGradientEndPoint: { x: stage.width() / 2, y: stage.height() / 2 },
            fillRadialGradientEndRadius: Math.max(stage.width(), stage.height()),
            fillRadialGradientColorStops: [
                0,
                'rgba(15,23,42,0)',
                0.6,
                'rgba(15,23,42,0.35)',
                1,
                'rgba(2,6,23,0.85)',
            ],
            listening: false,
        });
        this.layer.add(this.vignetteRect);

        this.cardGroup = new Konva.Group();
        this.layer.add(this.cardGroup);

        this.cardRect = new Konva.Rect({
            x: -260,
            y: -220,
            width: 520,
            height: 440,
            cornerRadius: 32,
            fill: 'rgba(15,23,42,0.85)',
            stroke: 'rgba(148,163,184,0.35)',
            strokeWidth: 1,
            shadowColor: '#000000',
            shadowBlur: 48,
            shadowOffsetY: 20,
            shadowOpacity: 0.45,
        });
        this.cardGroup.add(this.cardRect);

        this.titleText = new Konva.Text({
            text: 'Mission Complete',
            fontSize: 40,
            fontFamily: 'Lief, Arial, sans-serif',
            fill: '#f8fafc',
            align: 'center',
            width: 420,
            x: -210,
            y: -180,
            letterSpacing: 1,
        });
        this.cardGroup.add(this.titleText);

        this.scoreValueText = new Konva.Text({
            text: '0',
            fontSize: 96,
            fontFamily: 'Ka1, Arial, sans-serif',
            fill: '#38bdf8',
            align: 'center',
            width: 420,
            x: -210,
            y: -100,
            listening: false,
        });
        this.cardGroup.add(this.scoreValueText);

        this.messageText = new Konva.Text({
            text: 'Calculating results...',
            fontSize: 24,
            fontFamily: 'Lief, Arial, sans-serif',
            fill: '#cbd5f5',
            align: 'center',
            width: 420,
            x: -210,
            y: -10,
            lineHeight: 1.4,
        });
        this.cardGroup.add(this.messageText);

        this.statsGroup = new Konva.Group({ y: 120 });
        const statesPill = this.createStatPill('States Found');
        this.statesGroup = statesPill.group;
        this.statesGroup.x(-110);
        this.statesValueText = statesPill.valueText;
        const rankPill = this.createStatPill('Rank');
        this.rankGroup = rankPill.group;
        this.rankGroup.x(110);
        this.rankValueText = rankPill.valueText;
        this.statsGroup.add(this.statesGroup, this.rankGroup);
        this.cardGroup.add(this.statsGroup);

        this.buttonGroup = new Konva.Group({ y: 180 });
        this.buttonRect = new Konva.Rect({
            x: -160,
            y: -32,
            width: 320,
            height: 64,
            cornerRadius: 18,
            fillLinearGradientStartPoint: { x: 0, y: 0 },
            fillLinearGradientEndPoint: { x: 320, y: 64 },
            fillLinearGradientColorStops: [0, '#f97316', 1, '#ea580c'],
            shadowColor: '#000000',
            shadowBlur: 24,
            shadowOpacity: 0.35,
            shadowOffsetY: 8,
        });
        this.buttonText = new Konva.Text({
            text: 'Return to Menu',
            fontSize: 24,
            fontFamily: 'DungeonFont, Lief, Arial, sans-serif',
            fill: '#0f172a',
            align: 'center',
            verticalAlign: 'middle',
            width: 320,
            height: 64,
            x: -160,
            y: -32,
        });
        this.buttonGroup.add(this.buttonRect, this.buttonText);
        this.buttonGroup.on('mouseenter', () => {
            document.body.style.cursor = 'pointer';
            this.buttonRect.fillLinearGradientColorStops([0, '#fb923c', 1, '#f97316']);
            this.layer.batchDraw();
        });
        this.buttonGroup.on('mouseleave', () => {
            document.body.style.cursor = 'default';
            this.buttonRect.fillLinearGradientColorStops([0, '#f97316', 1, '#ea580c']);
            this.layer.batchDraw();
        });
        this.buttonGroup.on('click', () => {
            this.onBackButtonClick?.();
        });
        this.cardGroup.add(this.buttonGroup);

        this.createBackButton();
        this.resizeHandler = () => this.updateLayout();
        this.updateLayout();
        this.layer.hide();
    }

    show(): void {
        this.attachResizeListener();
        this.updateLayout();
        this.layer.show();
        this.layer.batchDraw();
        if (this.backButtonElement) this.backButtonElement.style.display = 'flex';
    }

    hide(): void {
        this.layer.hide();
        this.detachResizeListener();
        if (this.backButtonElement) this.backButtonElement.style.display = 'none';
        document.body.style.cursor = 'default';
    }

    updateScore(score: number): void {
        this.currentScore = Math.max(0, Math.floor(score));
        const statesFound = Math.min(50, this.currentScore);
        this.scoreValueText.text(this.currentScore.toLocaleString());
        this.statesValueText.text(`${statesFound}/50`);
        this.rankValueText.text(this.deriveRankLabel(this.currentScore));
        this.messageText.text(this.buildCelebrationMessage(this.currentScore, statesFound));
        this.layer.batchDraw();
    }

    setOnBackButtonClick(callback: () => void): void {
        this.onBackButtonClick = callback;
    }

    private attachResizeListener(): void {
        if (this.resizeListenerAttached) return;
        window.addEventListener('resize', this.resizeHandler);
        this.resizeListenerAttached = true;
    }

    private detachResizeListener(): void {
        if (!this.resizeListenerAttached) return;
        window.removeEventListener('resize', this.resizeHandler);
        this.resizeListenerAttached = false;
    }

    private updateLayout(): void {
        const width = this.stage.width();
        const height = this.stage.height();

        this.backgroundRect.width(width);
        this.backgroundRect.height(height);
        this.backgroundRect.fillLinearGradientEndPoint({ x: width, y: height });

        this.vignetteRect.width(width);
        this.vignetteRect.height(height);
        this.vignetteRect.fillRadialGradientStartPoint({ x: width / 2, y: height / 2 });
        this.vignetteRect.fillRadialGradientEndPoint({ x: width / 2, y: height / 2 });
        this.vignetteRect.fillRadialGradientEndRadius(Math.max(width, height));

        const cardWidth = Math.min(560, width - 64);
        const cardHeight = Math.min(460, height - 120);
        this.cardRect.width(cardWidth);
        this.cardRect.height(cardHeight);
        this.cardRect.x(-cardWidth / 2);
        this.cardRect.y(-cardHeight / 2);

        const innerWidth = cardWidth - 80;
        this.titleText.width(innerWidth);
        this.titleText.x(-innerWidth / 2);
        this.titleText.y(-cardHeight / 2 + 48);

        this.scoreValueText.width(innerWidth);
        this.scoreValueText.x(-innerWidth / 2);
        this.scoreValueText.y(this.titleText.y() + 70);

        this.messageText.width(innerWidth);
        this.messageText.x(-innerWidth / 2);
        this.messageText.y(this.scoreValueText.y() + 110);

        this.statsGroup.y(this.messageText.y() + 90);
        const statsSpacing = Math.min(280, innerWidth - 120);
        this.statesGroup.x(-statsSpacing / 2);
        this.rankGroup.x(statsSpacing / 2);

        const buttonWidth = Math.min(360, innerWidth);
        const buttonHeight = 64;
        this.buttonRect.width(buttonWidth);
        this.buttonRect.height(buttonHeight);
        this.buttonRect.x(-buttonWidth / 2);
        this.buttonRect.y(-buttonHeight / 2);
        this.buttonRect.fillLinearGradientEndPoint({ x: buttonWidth, y: buttonHeight });
        this.buttonText.width(buttonWidth);
        this.buttonText.x(-buttonWidth / 2);
        this.buttonText.y(-buttonHeight / 2);
        this.buttonGroup.y(cardHeight / 2 - buttonHeight - 24);

        this.cardGroup.position({ x: width / 2, y: height / 2 });
        this.refreshSparkles();
        this.layer.batchDraw();
    }

    private refreshSparkles(): void {
        this.sparkleGroup.destroyChildren();
        const width = this.stage.width();
        const height = this.stage.height();
        for (let i = 0; i < 24; i++) {
            const star = new Konva.Circle({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2 + 0.5,
                fill: 'rgba(255,255,255,0.45)',
                opacity: Math.random() * 0.4 + 0.2,
            });
            this.sparkleGroup.add(star);
        }
    }

    private deriveRankLabel(score: number): string {
        if (score >= 5000) return 'Cartographer Supreme';
        if (score >= 2500) return 'Elite Pathfinder';
        if (score >= 1000) return 'Trailblazer';
        if (score >= 200) return 'Seasoned Scout';
        if (score >= 50) return 'State Sleuth';
        return 'Rookie Explorer';
    }

    private buildCelebrationMessage(score: number, statesFound: number): string {
        if (score >= 5000) {
            return 'Legendary cartography! Multipliers were on fire.';
        }
        if (score >= 2000) {
            return 'Masterful route planning and lightning-fast guesses.';
        }
        if (statesFound >= 50 && score > 50) {
            return 'All 50 states plus bonus style points—unreal!';
        }
        if (statesFound >= 50) {
            return 'All 50 states mapped! That\'s a flawless victory.';
        }
        if (statesFound >= 40) {
            return 'Only a few states left—phenomenal work!';
        }
        return 'Solid run! Keep sharpening those geography skills.';
    }

    private createStatPill(label: string): { group: Konva.Group; valueText: Konva.Text } {
        const width = 200;
        const height = 90;
        const group = new Konva.Group();
        const rect = new Konva.Rect({
            x: -width / 2,
            y: -height / 2,
            width,
            height,
            cornerRadius: 22,
            fill: 'rgba(15,23,42,0.9)',
            stroke: 'rgba(148,163,184,0.25)',
            strokeWidth: 1,
            shadowColor: '#000000',
            shadowBlur: 20,
            shadowOpacity: 0.3,
        });
        const labelText = new Konva.Text({
            x: -width / 2 + 16,
            y: -height / 2 + 12,
            text: label.toUpperCase(),
            fontSize: 14,
            fontFamily: 'Lief, Arial, sans-serif',
            fill: '#94a3b8',
            letterSpacing: 1,
        });
        const valueText = new Konva.Text({
            x: -width / 2 + 16,
            y: labelText.y() + 26,
            text: '--',
            fontSize: 28,
            fontFamily: 'Ka1, Arial, sans-serif',
            fill: '#f8fafc',
        });
        group.add(rect, labelText, valueText);
        return { group, valueText };
    }

    private createBackButton(): void {
        const container = this.stage.container();
        container.style.position = 'relative';

        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = '↩';
        Object.assign(button.style, {
            position: 'fixed',
            top: '16px',
            right: '16px',
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            border: '2px solid #ffffff',
            background: 'rgba(0,0,0,0.65)',
            color: '#ffffff',
            fontSize: '28px',
            fontFamily: 'Lief, Arial, sans-serif',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: '3000',
        } as CSSStyleDeclaration);

        button.addEventListener('mouseenter', () => {
            button.style.background = 'rgba(0,0,0,0.85)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.background = 'rgba(0,0,0,0.65)';
        });
        button.addEventListener('click', () => {
            this.onBackButtonClick?.();
        });

        container.appendChild(button);
        this.backButtonElement = button;
    }
}

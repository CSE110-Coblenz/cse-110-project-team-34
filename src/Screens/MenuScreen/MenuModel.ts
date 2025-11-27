type GameMode = "practice" | "classic" | "cracked";

type UnlockState = {
    classic: boolean;
    cracked: boolean;
};

const DEFAULT_UNLOCK_STATE: UnlockState = { classic: false, cracked: false };
let sessionUnlockState: UnlockState = { ...DEFAULT_UNLOCK_STATE };

function getSessionUnlockState(): UnlockState {
    return { ...sessionUnlockState };
}

function updateSessionUnlockState(updates: Partial<UnlockState>): void {
    sessionUnlockState = { ...sessionUnlockState, ...updates };
}

export function unlockClassicMode(): void {
    if (!sessionUnlockState.classic) {
        updateSessionUnlockState({ classic: true });
    }
}

export function unlockCrackedMode(): void {
    if (!sessionUnlockState.cracked) {
        updateSessionUnlockState({ cracked: true });
    }
}

/**
 * Tracks which modes are unlocked on the menu screen.
 * Practice is always available; other modes remain unlocked for this session only.
 */
export class MenuModel {
    private unlockedModes: Record<GameMode, boolean>;

    constructor() {
        const unlockState = getSessionUnlockState();
        this.unlockedModes = {
            practice: true,
            classic: unlockState.classic,
            cracked: unlockState.cracked,
        };
    }

    isModeUnlocked(mode: GameMode): boolean {
        return this.unlockedModes[mode];
    }

    unlockMode(mode: Exclude<GameMode, "practice">): void {
        this.unlockedModes[mode] = true;
        updateSessionUnlockState({ [mode]: true } as Partial<UnlockState>);
    }

    getLockedModes(): { classicLocked: boolean; crackedLocked: boolean } {
        return {
            classicLocked: !this.unlockedModes.classic,
            crackedLocked: !this.unlockedModes.cracked,
        };
    }
}

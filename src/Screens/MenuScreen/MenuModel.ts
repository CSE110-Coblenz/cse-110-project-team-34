type GameMode = "practice" | "classic" | "cracked";

type UnlockState = {
    classic: boolean;
    cracked: boolean;
};

const MODE_UNLOCK_STORAGE_KEY = 'statepanic-mode-unlocks';
const DEFAULT_UNLOCK_STATE: UnlockState = { classic: false, cracked: false };

function loadUnlockState(): UnlockState {
    if (typeof window === 'undefined' || !window.localStorage) {
        return { ...DEFAULT_UNLOCK_STATE };
    }
    try {
        const raw = window.localStorage.getItem(MODE_UNLOCK_STORAGE_KEY);
        if (!raw) return { ...DEFAULT_UNLOCK_STATE };
        const parsed = JSON.parse(raw);
        return {
            classic: Boolean(parsed.classic),
            cracked: Boolean(parsed.cracked),
        };
    } catch {
        return { ...DEFAULT_UNLOCK_STATE };
    }
}

function saveUnlockState(state: UnlockState): void {
    if (typeof window === 'undefined' || !window.localStorage) {
        return;
    }
    window.localStorage.setItem(MODE_UNLOCK_STORAGE_KEY, JSON.stringify(state));
}

export function unlockClassicAndCrackedModes(): void {
    const current = loadUnlockState();
    if (current.classic && current.cracked) {
        return;
    }
    const updated: UnlockState = { classic: true, cracked: true };
    saveUnlockState(updated);
}

/**
 * Tracks which modes are unlocked on the menu screen.
 * Practice is always available; other modes persist once unlocked.
 */
export class MenuModel {
    private unlockedModes: Record<GameMode, boolean>;

    constructor() {
        const unlockState = loadUnlockState();
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
        this.persist();
    }

    getLockedModes(): { classicLocked: boolean; crackedLocked: boolean } {
        return {
            classicLocked: !this.unlockedModes.classic,
            crackedLocked: !this.unlockedModes.cracked,
        };
    }

    private persist(): void {
        const state: UnlockState = {
            classic: this.unlockedModes.classic,
            cracked: this.unlockedModes.cracked,
        };
        saveUnlockState(state);
    }
}

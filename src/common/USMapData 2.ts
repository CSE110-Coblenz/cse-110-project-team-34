/**
 * USMapData.ts - Shared US States Data
 * 
 * This module contains the common data structures used across all game modes:
 * - State class: Represents an individual US state's data and color state
 * - stateNames: Mapping of state codes to full state names
 * - stateAdjacencyList: Graph of state neighbors
 * 
 * Applying "Abstract Common Services" tactic (Chapter 8, Software Architecture in Practice)
 * to eliminate modularity violations and reduce modification cost.
 */

/**
 * Mapping from state abbreviation (lowercase) to full state name.
 */
export const stateNames = new Map<string, string>([
  ["al", "Alabama"], ["ak", "Alaska"], ["az", "Arizona"], ["ar", "Arkansas"],
  ["ca", "California"], ["co", "Colorado"], ["ct", "Connecticut"], ["de", "Delaware"],
  ["fl", "Florida"], ["ga", "Georgia"], ["hi", "Hawaii"], ["id", "Idaho"],
  ["il", "Illinois"], ["in", "Indiana"], ["ia", "Iowa"], ["ks", "Kansas"],
  ["ky", "Kentucky"], ["la", "Louisiana"], ["me", "Maine"], ["md", "Maryland"],
  ["ma", "Massachusetts"], ["mi", "Michigan"], ["mn", "Minnesota"], ["ms", "Mississippi"],
  ["mo", "Missouri"], ["mt", "Montana"], ["ne", "Nebraska"], ["nv", "Nevada"],
  ["nh", "New Hampshire"], ["nj", "New Jersey"], ["nm", "New Mexico"], ["ny", "New York"],
  ["nc", "North Carolina"], ["nd", "North Dakota"], ["oh", "Ohio"], ["ok", "Oklahoma"],
  ["or", "Oregon"], ["pa", "Pennsylvania"], ["ri", "Rhode Island"], ["sc", "South Carolina"],
  ["sd", "South Dakota"], ["tn", "Tennessee"], ["tx", "Texas"], ["ut", "Utah"],
  ["vt", "Vermont"], ["va", "Virginia"], ["wa", "Washington"], ["wv", "West Virginia"],
  ["wi", "Wisconsin"], ["wy", "Wyoming"]
]);

/**
 * A graph of the 50 US states represented as an adjacency list.
 * The key is the state's 2-letter abbreviation (lowercase).
 * The value is a Set of the 2-letter abbreviations of its neighboring states.
 */
export const stateAdjacencyList = new Map<string, Set<string>>([
  ["al", new Set(["ms", "tn", "ga", "fl"])],
  ["ak", new Set<string>(["ca", "or", "wa", "hi"])],
  ["az", new Set(["ca", "nv", "ut", "co", "nm"])],
  ["ar", new Set(["la", "tx", "ok", "mo", "tn", "ms"])],
  ["ca", new Set(["or", "nv", "az", "ak", "hi"])],
  ["co", new Set(["wy", "ne", "ks", "ok", "nm", "az", "ut"])],
  ["ct", new Set(["ny", "ma", "ri"])],
  ["de", new Set(["md", "pa", "nj"])],
  ["fl", new Set(["al", "ga"])],
  ["ga", new Set(["fl", "al", "tn", "nc", "sc"])],
  ["hi", new Set<string>(["ca", "or", "wa", "ak"])],
  ["id", new Set(["mt", "wy", "ut", "nv", "or", "wa"])],
  ["il", new Set(["in", "ky", "mo", "ia", "wi"])],
  ["in", new Set(["mi", "oh", "ky", "il"])],
  ["ia", new Set(["mn", "wi", "il", "mo", "ne", "sd"])],
  ["ks", new Set(["ne", "mo", "ok", "co"])],
  ["ky", new Set(["in", "oh", "wv", "va", "tn", "mo", "il"])],
  ["la", new Set(["tx", "ar", "ms"])],
  ["me", new Set(["nh"])],
  ["md", new Set(["va", "wv", "pa", "de"])],
  ["ma", new Set(["ri", "ct", "ny", "vt", "nh"])],
  ["mi", new Set(["wi", "in", "oh", "mn"])],
  ["mn", new Set(["wi", "ia", "sd", "nd", "mi"])],
  ["ms", new Set(["la", "ar", "tn", "al"])],
  ["mo", new Set(["ia", "il", "ky", "tn", "ar", "ok", "ks", "ne"])],
  ["mt", new Set(["nd", "sd", "wy", "id"])],
  ["ne", new Set(["sd", "ia", "mo", "ks", "co", "wy"])],
  ["nv", new Set(["id", "ut", "az", "ca", "or"])],
  ["nh", new Set(["vt", "me", "ma"])],
  ["nj", new Set(["de", "pa", "ny"])],
  ["nm", new Set(["az", "ut", "co", "ok", "tx"])],
  ["ny", new Set(["nj", "pa", "vt", "ma", "ct"])],
  ["nc", new Set(["va", "tn", "ga", "sc"])],
  ["nd", new Set(["mn", "mt", "sd"])],
  ["oh", new Set(["pa", "wv", "ky", "in", "mi"])],
  ["ok", new Set(["ks", "mo", "ar", "tx", "nm", "co"])],
  ["or", new Set(["ca", "nv", "id", "wa", "ak", "hi"])],
  ["pa", new Set(["ny", "nj", "de", "md", "wv", "oh"])],
  ["ri", new Set(["ct", "ma"])],
  ["sc", new Set(["ga", "nc"])],
  ["sd", new Set(["nd", "mn", "ia", "ne", "wy", "mt"])],
  ["tn", new Set(["ky", "va", "nc", "ga", "al", "ms", "ar", "mo"])],
  ["tx", new Set(["nm", "ok", "ar", "la"])],
  ["ut", new Set(["id", "wy", "co", "nm", "az", "nv"])],
  ["vt", new Set(["ny", "nh", "ma"])],
  ["va", new Set(["wv", "md", "nc", "tn", "ky"])],
  ["wa", new Set(["id", "or", "ak", "hi"])],
  ["wv", new Set(["oh", "pa", "md", "va", "ky"])],
  ["wi", new Set(["mi", "mn", "ia", "il"])],
  ["wy", new Set(["mt", "sd", "ne", "co", "ut", "id"])]
]);

/**
 * State class - Pure data representation of a US state
 * Contains no DOM manipulation, only data and state management.
 */
export class State {
    public code: string; // 2-letter state code (e.g., 'ca', 'tx')
    public originalColor: string;
    private _currentColor: string;
    private _isGuessed: boolean = false;
    private _isHighlighted: boolean = false;

    constructor(code: string, originalColor: string = '#cccccc') {
        this.code = code;
        this.originalColor = originalColor;
        this._currentColor = originalColor;
    }

    // Chainable method to set color (pure data, no DOM)
    color(newColor: string): State {
        this._currentColor = newColor;
        return this;
    }

    // Chainable method to set isGuessed
    isGuessed(guessed: boolean): State {
        this._isGuessed = guessed;
        return this;
    }

    // Chainable method to set highlight
    highlight(highlighted: boolean): State {
        this._isHighlighted = highlighted;
        return this;
    }

    // Getter for current color
    getColor(): string {
        return this._currentColor;
    }

    // Getter for isGuessed
    getIsGuessed(): boolean {
        return this._isGuessed;
    }

    // Getter for isHighlighted
    getIsHighlighted(): boolean {
        return this._isHighlighted;
    }

    // Reset to original state
    reset(): State {
        this._currentColor = this.originalColor;
        this._isGuessed = false;
        this._isHighlighted = false;
        return this;
    }

    // Set a new original color (accepts HEX, rgb, or named colors)
    setOriginalColor(newColor: string): State {
        this.originalColor = newColor;
        this._currentColor = newColor;
        return this;
    }

    // Reset color to original while preserving other state
    resetColor(): State {
        this._currentColor = this.originalColor;
        return this;
    }
}

import { stateAdjacencyList } from '../common/USMapData';

/**
 * Calculates the minimum number of bridging states between a start and end state using Breadth-First Search (BFS).
 * 
 * @param startState The 2-letter code for the starting state (e.g., 'ca').
 * @param endState The 2-letter code for the ending state (e.g., 'ny').
 * @returns The number of intermediate states in the shortest path. Returns 0 if start and end are the same, 
 *          and -1 if no path is found.
 */
export function findShortestBridgeSize(startState: string, endState: string): number {
    if (startState === endState) return 0;

    const queue: string[][] = [[startState]];
    const visited: Set<string> = new Set([startState]);

    while (queue.length > 0) {
        const currentPath = queue.shift()!;
        const currentState = currentPath[currentPath.length - 1];

        if (currentState === endState) {
            return currentPath.length - 2;
        }

        const neighbors = stateAdjacencyList.get(currentState);
        if (neighbors) {
            neighbors.forEach(neighbor => {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push([...currentPath, neighbor]);
                }
            });
        }
    }

    return -1;
}

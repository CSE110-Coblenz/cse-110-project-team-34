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
    if (startState === endState) {
        return 0;
    }

    // The queue will store the entire path taken to reach a state.
    const queue: string[][] = [[startState]];
    const visited: Set<string> = new Set([startState]);

    while (queue.length > 0) {
        // Non-null assertion (!) because we checked queue.length > 0
        const currentPath = queue.shift()!; 
        const currentState = currentPath[currentPath.length - 1];

        // If we've reached the destination, calculate and return the number of bridging states.
        if (currentState === endState) {
            // The number of bridging states is the total path length minus the start and end states.
            return currentPath.length - 2;
        }

        const neighbors = stateAdjacencyList.get(currentState);

        if (neighbors) {
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    const newPath = [...currentPath, neighbor];
                    queue.push(newPath);
                }
            }
        }
    }

    // If the queue empties and we haven't found the end state, no path exists.
    return -1; 
}

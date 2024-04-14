import { State } from "./State";

export namespace AStar {
    class Node<ActionType> {
        state: State<ActionType>;
        parent: Node<ActionType> | null;
        action: ActionType | null;
        g: number; // Cost from the start node
        h: number; // Heuristic estimate of cost to goal
        f: number; // Estimated total cost (f = g + h)
        depth: number;

        constructor(state: State<ActionType>, parent: Node<ActionType> | null, action: ActionType | null = null, g: number = 0, h: number = 0, depth: number = 0) {
            this.state = state;
            this.parent = parent;
            this.action = action;
            this.g = g;
            this.h = h;
            this.f = g + h;
            this.depth = depth;
        }
    }

    export class AStarSearch<ActionType> {
        private _openSet: Node<ActionType>[] = [];
        private _closedSet: Set<string> = new Set();
        private _maxDepth: number;
        private _bestNode: Node<ActionType> | null = null;
        private _heuristicFn: (state: State<ActionType>) => number;

        constructor(initialState: State<ActionType>, maxDepth: number, heuristicFn: (state: State<ActionType>) => number = (state) => (1 - state.getScore() * state.getSize())) {
            this._maxDepth = maxDepth;
            const rootNode = new Node(initialState, null, null, 0, initialState.getScore(), 0);
            this._openSet.push(rootNode);
            this._heuristicFn = heuristicFn;
        }

        // Helper function to find a node in a set based on its state
        findNodeInSet(nodeSet: Node<ActionType>[], state: State<ActionType>): Node<ActionType> | undefined {
            return nodeSet.find(n => {
                return n.state.equals(state)
            });
        }

        private reconstructPath(endNode: Node<ActionType>): State<ActionType>[] {
            let path: State<ActionType>[] = [];
            let currentNode = endNode;

            while (currentNode != null) {
                path.unshift(currentNode.state); // Prepend the state to the path
                currentNode = currentNode.parent!;
            }

            return path;
        }

        findPath(): State<ActionType>[] | null {
            while (this._openSet.length > 0 && this._openSet.length < this._maxDepth) {
                // Sort openSet by f value and pick the node with the lowest f
                this._openSet.sort((a, b) => a.f - b.f);
                let currentNode = this._openSet.shift()!;

                // If the goal is reached, reconstruct the path
                if (currentNode.state.isSolved()) {
                    return this.reconstructPath(currentNode);
                }

                this._closedSet.add(currentNode.state.hash());

                currentNode.state.getPossibleActions().forEach(action => {
                    let newState = currentNode.state.clone();
                    newState.requestAction(action, false);
                    const hash = newState.hash();

                    if (this._closedSet.has(hash)) {
                        return; // Skip expansion if the new state is already in closedSet
                    }
                    
                    let newG = currentNode.g + 1;
                    let newH = this._heuristicFn(newState);
                    let newNode = new Node(newState, currentNode, action, newG, newH, currentNode.depth + 1);

                    // Check if the new node is the best node found so far
                    if (this._bestNode == null || newNode.f < this._bestNode.f) {
                        this._bestNode = newNode;
                    }

                    if (!this._openSet.some(n => n.state.equals(newState) && n.g <= newG)) {
                        this._openSet.push(newNode);
                    } else {
                        return; // Skip expansion if the new state is already in openSet with a lower g value
                    }
                });
            }

            if (this._bestNode != null) {
                return this.reconstructPath(this._bestNode); // Skip the root node
            }

            return null; // No path found
        }
    }
}

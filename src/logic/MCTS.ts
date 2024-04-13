import { State } from "./State";

export namespace MCTS {
    class Node<ActionType> {
        state: State<ActionType>;
        parent: Node<ActionType> | null;
        children: Node<ActionType>[];
        action: ActionType | null;
        wins: number = 0;
        visits: number = 0;
        untriedActions: ActionType[];
    
        constructor(state: State<ActionType>, parent: Node<ActionType> | null, action: ActionType | null = null) {
            this.state = state;
            this.parent = parent;
            this.action = action;
            this.children = [];
            this.untriedActions = state.getPossibleActions();
        }
    
        isFullyExpanded(): boolean {
            return this.untriedActions.length === 0  && this.children.length > 0;
        }
    
        bestChild(cParam: number = 1.41): Node<ActionType> {
            return this.children.reduce((prev, current) => {
                const prevScore = prev.wins / prev.visits + cParam * Math.sqrt(Math.log(this.visits) / prev.visits);
                const currentScore = current.wins / current.visits + cParam * Math.sqrt(Math.log(this.visits) / current.visits);
                return prevScore > currentScore ? prev : current;
            });
        }
    
        expand(): Node<ActionType> {
            const action = this.untriedActions.pop()!;
            const newState = this.state.clone();
            newState.requestAction(action, false);
            const childNode = new Node(newState, this, action);
            this.children.push(childNode);
            return childNode;
        }
    }

    export class MCTSSearch<ActionType> {
        private _root: Node<ActionType>;
        private _cParam: number;
        private _scoreFn: (state: State<ActionType>) => number;
    
        constructor(rootState: State<ActionType>, cParam: number = 1.41, scoreFn: (state: State<ActionType>) => number = (state) => state.getScore()) {
            this._root = new Node(rootState, null);
            this._cParam = cParam;
            this._scoreFn = scoreFn;
        }
    
        selectPromisingNode(node: Node<ActionType>): Node<ActionType> {
            while (node.isFullyExpanded()) {
                node = node.bestChild(this._cParam);
            }
            return node;
        }
    
        simulateRandomPlayout(node: Node<ActionType>): number {
            let tempNode = node;
            let state = tempNode.state;
            let possibleActions: ActionType[] = state.getPossibleActions();

            while (!state.isTerminal()) {
                const action = possibleActions[Math.floor(Math.random() * possibleActions.length)];
                state = state.clone();
                state.requestAction(action, false);
                possibleActions = state.getPossibleActions();
            }
    
            return this._scoreFn(state);
        }
    
        backPropagate(node: Node<ActionType>, reward: number): void {
            while (node != null) {
                node.visits++;
                node.wins += reward;
                node = node.parent!;
            }
        }
    
        findNextMove(rootState: State<ActionType>, iterationCount: number): State<ActionType> {
            this._root = new Node(rootState, null);
    
            for (let i = 0; i < iterationCount; i++) {
                let promisingNode = this.selectPromisingNode(this._root);
                if (!promisingNode.state.isTerminal()) {
                    promisingNode = promisingNode.expand();
                }
                const playoutResult = this.simulateRandomPlayout(promisingNode);
                this.backPropagate(promisingNode, playoutResult);
            }
    
            return this._root.bestChild(0).state;
        }
    }
}

export interface State<ActionType> {
    getPossibleActions(): ActionType[];
    requestAction(action: ActionType, verifyAction: boolean): boolean;
    clone(): State<ActionType>;
    isTerminal(): boolean;
    isSolved(): boolean;
    getScore(): number;
    equals(other: State<ActionType>): boolean;
    hash(): string;
    getSize(): number;
}

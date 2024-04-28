export interface State<TState, TAction> {
    get(): TState;

    withActionApplied(action: TAction): State<TState, TAction>;
    getPossibleActions(): TAction[];
    isSolved(): boolean;
    getScore(): number;
    equals(other: State<TState, TAction>): boolean;
    hash(): string;
}

import { Rank, Ranks } from './Rank';
import { Suit, Suits } from './Suit';
import { CardPosition, Card, Move } from './Card';
import { State } from "./State";

export class BoardState implements State<Move> {
    private _state: (Card | null)[][];
    private _onUpdate: () => void = () => {};
    private _possibleActions: Move[] | null = null;
    private _score: number | null = null;
    private _stuckGaps: CardPosition[] | null = null;
    private _seed: string | null = null;
    private _doubleGaps: CardPosition[] | null = null;
    private _wellPlacedCards: CardPosition[] | null = null;

    getRows() {
        return this._state.length;
    }

    getColumns() {
        return this._state[0].length;
    }

    getState(): readonly (Card | null)[][] {
        return this._state;
    }

    getLastRank() {
        return Ranks[this.getColumns() - 1];
    }

    getSize() {
        return this.getRows() * this.getColumns();
    }

    reset(rows: number, columns: number) {
        this._state = new Array(rows).fill(null).map((_, i) => new Array(columns).fill(null).map((_, j) => {
            const suitIdx = i % Suits.length;
            const rankIdx = j % Ranks.length;
            return {
                suit: Suits[suitIdx],
                rank: Ranks[rankIdx],
            };
        }));
        this.callOnUpdate();
    }

    constructor(rows: number, columns: number) {
        this._state = [];
        this.reset(rows, columns);
    }

    set onUpdate(fn: () => void) {
        this._onUpdate = fn;
    }

    private callOnUpdate() {
        this._possibleActions = null;
        this._score = null;
        this._stuckGaps = null;
        this._seed = null;
        this._doubleGaps = null;
        this._wellPlacedCards = null;

        this._onUpdate();
    }

    equals(other: BoardState): boolean {
        if (this.getRows() !== other.getRows() || this.getColumns() !== other.getColumns()) {
            return false;
        }

        for (let i = 0; i < this.getRows(); i++) {
            for (let j = 0; j < this.getColumns(); j++) {
                const card1 = this.getCardAt({ row: i, column: j });
                const card2 = other.getCardAt({ row: i, column: j });
                if (!this.areCardsEqual(card1, card2)) {
                    return false;
                }
            }
        }

        return true;
    }

    clone(): BoardState {
        const clone = new BoardState(this.getRows(), this.getColumns());
        clone._state = this._state.map(row => row.map(card => card));
        return clone;
    }

    hash(): string {
        return this.getSeed();
    }

    load(bs: BoardState) {
        this._state = bs._state.map(row => row.map(card => card));
        this.callOnUpdate();
    }

    isSolved(): boolean {
        const wellPlacedCards = this.getWellPlacedCards();
        return wellPlacedCards.length === this.getRows() * this.getColumns();
    }

    isTerminal(): boolean {
        return this.getPossibleActions().length === 0;
    }

    getChildren(): BoardState[] {
        const possibleMoves = this.getPossibleActions();
        const children = possibleMoves.map(move => {
            const clone = this.clone();
            clone.requestAction(move, false);
            return clone;
        });
        return children;
    }

    getSeed(): string {
        if (this._seed !== null) {
            return this._seed;
        }
        let seed = `${this.getRows()}.${this.getColumns()} `;
        seed += this.flatMap(card => card ? `${card.suit}.${card.rank}` : "x.x").join(" ");
        this._seed = seed;
        return seed;
    }

    loadSeed(seed: string) {
        const parts = seed.trim().split(" ");
        const [rows, columns] = parts[0].split(".").map(Number);
        this.reset(rows, columns);

        const cardParts = parts.slice(1);
        cardParts.forEach((part, idx) => {
            const [suit, rank] = part.split(".").map((part) => {
                if (part === "x") {
                    return null
                }
                return Number(part);
            });

            this._state[Math.floor(idx / columns)][idx % columns] = suit === null ? null : { suit: suit! as Suit, rank: rank! as Rank };
        });

        this.callOnUpdate();
    }

    removeHighestCards() {
        for (let i = 0; i < this._state.length; i++) {
            for (let j = 0; j <  this._state[i].length; j++) {
                if (this._state[i][j]?.rank === this.getLastRank()) {
                    this.setCardAt({ row: i, column: j }, null);
                }
            }
        }
    }

    getCardAt(position: CardPosition): Card | null {
        return this._state[position.row][position.column];
    }

    areCardsEqual(card1: Card | null, card2: Card | null): boolean {
        if (card1 === null && card2 === null) {
            return true;
        }
        if (card1 === null && card2 !== null) {
            return false;
        }
        if (card1 !== null && card2 === null) {
            return false;
        }
        return card1!.suit === card2!.suit && card1!.rank === card2!.rank;
    }

    setCardAt(position: CardPosition, value: Card | null): void {
        this._state[position.row][position.column] = value;
        this.callOnUpdate();
    }

    map<T>(fn: (card: Card | null, position: CardPosition) => T): T[][] {
        return this._state.map((row, rowIdx) => row.map((card, columnIdx) => fn(card, { row: rowIdx, column: columnIdx } )));
    }

    flatMap<T>(fn: (card: Card | null, position: CardPosition) => T): T[] {
        return this._state.flatMap((row, rowIdx) => row.map((card, columnIdx) => fn(card, { row: rowIdx, column: columnIdx } )));
    }

    filter(fn: (card: Card | null, position: CardPosition) => boolean): { card: Card | null, position: CardPosition }[] {
        const cards = this.flatMap((card, position) => ({ card, position }));
        return cards.filter(({ card, position }) => fn(card, position));
    }

    swap(from: CardPosition, to: CardPosition) {
        const temp = this.getCardAt(from);
        this.setCardAt(from, this.getCardAt(to));
        this.setCardAt(to, temp);
    }

    shuffle() {
        for (let i = 0; i < this.getColumns(); i++) {
            for (let j = 0; j < this.getRows(); j++) {
                let randColumn = Math.floor(Math.random() * this.getColumns());
                let randRow = Math.floor(Math.random() * this.getRows());
                this.swap({ row: j, column: i }, { row: randRow, column: randColumn });
            }
        }
    }

    // Indicates which other cards the specified card can be swapped with (the so-called "candidate" cards).
    // This information is used to highlight the candidate cards.
    getCandidateGaps(cardPosition: CardPosition): Array<CardPosition> {
        let card = this.getCardAt(cardPosition);
        let gaps = this.getGapsPositions();
        gaps = gaps.filter(gap => {
            const previousColumn = gap.column - 1;

            // If the gap is at the top or left edge of the board, it can be swapped with any card.
            if (previousColumn < 0) {
                return true;
            }


            const previousCard = this.getCardAt({ row: gap.row, column: previousColumn });
            
            // If the card preceding the gap is also a gap, it can't be swapped
            if (previousCard === null) {
                return false;
            }

            return (
                previousCard.rank+1 === card?.rank &&
                previousCard.suit === card?.suit
            );
        })
        return gaps;
    }

    // Informs this component that the user would like to perform a swap (i.e., they selected a second card).
    // Note that while the UI code ensures that a card is not swapped with itself, it does not ensure consistency
    // with 'requestSwapCandidates'. That is, this function is also called for cards that have not previously
    // been reported as candidates.
    requestAction(move: Move, verifyValidity: boolean = true): boolean {
        const fromCard = this.getCardAt(move.from);
        const toCard = this.getCardAt(move.to);

        if (fromCard === null) {
            return false;
        }

        if (!verifyValidity) {
            this.setCardAt(move.from, null);
            this.setCardAt(move.to, fromCard);
            return true;
        }

        // Check if the card preceding the gap is the card that differs by one rank and has the same suit.
        const previousColumn = move.to.column - 1;
        if (previousColumn < 0 && toCard === null) {
            this.setCardAt(move.from, null);
            this.setCardAt(move.to, fromCard);
            return true;
        }

        // If the card preceding the gap is also a gap, the swap is invalid.
        const previousCard = this.getCardAt({ row: move.to.row, column: previousColumn });
        if (previousCard === null) {
            return false;
        }

        if (previousCard.rank+1 === fromCard.rank && previousCard.suit === fromCard.suit) {
            this.setCardAt(move.from, null);
            this.setCardAt(move.to, fromCard);
            return true;
        }

        return false;
    }

    getPossibleActions(): Move[] {
        if (this._possibleActions !== null) {
            return this._possibleActions;
        }
        const moveableCards = this.getState().reduce<Move[]>((acc, row, rowIdx) => {
            return row.reduce<Move[]>((acc, card, columnIdx) => {
                if (card === null) {
                    return acc;
                }

                const cardPosition = { row: rowIdx, column: columnIdx };
                const candidates = this.getCandidateGaps(cardPosition);
                const moves = candidates.map(candidate => ({ from: cardPosition, to: candidate }));
                return [...acc, ...moves];
            }, acc);
        }, []);
        this._possibleActions = moveableCards;
        return moveableCards;
    }

    getGapsPositions(): CardPosition[] {
        return this.filter(card => card === null).map(({ position }) => position);
    }

    getStuckGaps(): CardPosition[] {
        if (this._stuckGaps !== null) {
            return this._stuckGaps;
        }
        const stuckGaps = this.getGapsPositions().filter(gap => {
            const previousColumn = gap.column - 1;
            if (previousColumn < 0) {
                return false;
            }

            const nextColumn = gap.column + 1;
            if (nextColumn >= this.getColumns()) {
                return false;
            }

            const previousCard = this.getCardAt({ row: gap.row, column: previousColumn });
            if (previousCard === null) {
                return false;
            }

            if (previousCard.rank === this.getLastRank() - 1) {
                return true;
            }

            return false;
        });
        this._stuckGaps = stuckGaps;
        return stuckGaps;
    }

    getDoubleGaps(): CardPosition[] {
        if (this._doubleGaps !== null) {
            return this._doubleGaps;
        }
        const doubleGaps = this.getGapsPositions().filter(gap => {
            const previousColumn = gap.column - 1;
            if (previousColumn < 0) {
                return false;
            }
            // const emptyToTheEnd = this._state[gap.row].slice(gap.column).every(card => card === null);
            // if (emptyToTheEnd) {
            //     return false;
            // }

            const previousCard = this.getCardAt({ row: gap.row, column: previousColumn });
            if (previousCard === null) {
                return true;
            }

            return false;
        });
        this._doubleGaps = doubleGaps;
        return doubleGaps;
    }

    getWellPlacedCards(): CardPosition[] {
        if (this._wellPlacedCards !== null) {
            return this._wellPlacedCards;
        }
        const res = this.getState().reduce<CardPosition[][]>((acc, row, rowIdx) => {
            const resRow = row.reduce<CardPosition[][]>((acc, card, columnIdx) => {
                if (this.isCardInCorrectColumn(card, columnIdx)) {
                    const cardPosition = { row: rowIdx, column: columnIdx };
                    let addTo = acc.length - 1;
                    if (card !== null) {
                        addTo = card.suit;
                    }
                    acc[addTo] = [...acc[addTo], cardPosition];
                }
                return acc;
            }, Array(this.getRows()+1).fill([]));

            const lengths = resRow.map(arr => arr.length);
            const argMax = lengths.reduce((acc, val, idx) => {
                if (val > lengths[acc]) {
                    return idx;
                }
                return acc;
            }, 0);

            acc[argMax] = resRow.flat();

            return acc;
        }, Array(this.getRows()+1).fill([]));
        this._wellPlacedCards = res.flat();
        return this._wellPlacedCards;
    }

    isCardInCorrectColumn(card: Card | null, column: number): boolean {
        if (card === null) {
            return column === this.getColumns() - 1;
        }
        return card.rank === Ranks[column];
    }

    async aStar(heuristic: (bs: BoardState) => number, maxDepth: number): Promise<BoardState[]> {
        const open: BoardState[] = [this];
        const closed: BoardState[] = [];
        const openSet = new Set<String>();
        const closedSet = new Set<String>();
        const gScore = new Map<BoardState, number>();
        const fScore = new Map<BoardState, number>();
        const cameFrom = new Map<BoardState, BoardState | null>();

        gScore.set(this, 0);
        fScore.set(this, heuristic(this));

        while (open.length > 0) {
            open.sort((a, b) => fScore.get(a)! - fScore.get(b)!);
            const current = open.shift()!;

            if (current.isTerminal() || open.length >= maxDepth) {
                let path: BoardState[] = [current];
                let state = current;
                while (cameFrom.has(state)) {
                    state = cameFrom.get(state)!;
                    path = [state, ...path];
                }
                return Promise.resolve(path);
            }

            closed.push(current);
            closedSet.add(current.getSeed());
            const children = current.getChildren();
            children.forEach(child => {
                const seed = child.getSeed();
                if (closedSet.has(seed)) {
                    return;
                }

                const tentativeGScore = gScore.get(current)! + 1;
                if (!openSet.has(seed)) {
                    open.push(child);
                    openSet.add(seed);
                } else if (tentativeGScore >= gScore.get(child)!) {
                    return;
                }

                cameFrom.set(child, current);
                gScore.set(child, tentativeGScore);
                fScore.set(child, gScore.get(child)! + heuristic(child));
            });
        }

        return Promise.resolve([]);
    }

    getScore(): number {
        if (this._score !== null) {
            return this._score;
        }

        const isSolved = this.isSolved();
        if (isSolved) {
            this._score = 1;
            return this._score;
        }

        const size = this.getRows() * this.getColumns();
        const functions = [
            this.getWellPlacedCards().length / size,
            (4 - this.getStuckGaps().length) / 4,
            (3 - this.getDoubleGaps().length) / 3,
            (this.getPossibleActions().length / size),
        ]
        const weights = [5, 3, 2, 1];
        const weightsSum = weights.reduce((acc, val) => acc + val, 0);
        let finalScore = functions.reduce((acc, val, idx) => acc + val * weights[idx], 0);
        console.log(functions, weights, finalScore, finalScore / weightsSum);
        finalScore /= weightsSum;
        this._score = finalScore;
        return this._score;
    }
}


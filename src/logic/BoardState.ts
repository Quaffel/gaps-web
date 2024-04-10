import { Rank, Ranks } from './Rank';
import { Suit, Suits } from './Suit';
import { CardPosition, Swap, Card } from './Card';


export class BoardState {
    private _state: (Card | null)[][];
    private _onUpdate: () => void = () => {};

    get rows() {
        return this._state.length;
    }

    get columns() {
        return this._state[0].length;
    }

    get state(): readonly (Card | null)[][] {
        return this._state;
    }

    get lastRank() {
        return Ranks[this.columns - 1];
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
        this._onUpdate();
    }

    constructor(rows: number, columns: number) {
        this._state = [];
        this.reset(rows, columns);
    }

    set onUpdate(fn: () => void) {
        this._onUpdate = fn;
    }

    computeSeed(): string {
        let seed = `${this.rows}.${this.columns} `;
        seed += this.flatMap(card => card ? `${card.suit}.${card.rank}` : "x.x").join(" ");
        return seed;
    }

    loadSeed(seed: string) {
        const parts = seed.split(" ");
        const [rows, columns] = parts[0].split(".").map(Number);
        this.reset(rows, columns);

        const cardParts = parts.slice(1);
        cardParts.forEach((part, idx) => {
            const [suit, rank] = part.split(".").map((part) => {
                if (part === "x") {
                    return null
                }
                return part as Suit | Rank;
            });

            this._state[Math.floor(idx / columns)][idx % columns] = suit === null ? null : { suit: suit! as Suit, rank: rank! as Rank };
        });

        this._onUpdate();
    }

    removeHighestCards() {
        for (let i = 0; i < this._state.length; i++) {
            for (let j = 0; j <  this._state[i].length; j++) {
                if (this._state[i][j]?.rank === this.lastRank) {
                    this._state[i][j] = null;
                }
            }
        }
    }

    getCardAt(position: CardPosition): Card | null {
        return this._state[position.row][position.column];
    }

    setCardAt(position: CardPosition, value: Card | null): void {
        this._state[position.row][position.column] = value;
        this._onUpdate();
        console.log(this.getStuckGaps())
        console.log(this.computeSeed())
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

    getGapsPositions(): CardPosition[] {
        return this.filter(card => card === null).map(({ position }) => position);
    }

    swap(from: CardPosition, to: CardPosition) {
        const temp = this.getCardAt(from);
        this.setCardAt(from, this.getCardAt(to));
        this.setCardAt(to, temp);
    }

    shuffle() {
        for (let i = 0; i < this.columns; i++) {
            for (let j = 0; j < this.rows; j++) {
                let randColumn = Math.floor(Math.random() * this.columns);
                let randRow = Math.floor(Math.random() * this.rows);
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
    requestMove(from: CardPosition, to: CardPosition, verifyValidity: boolean = true): boolean {
        const fromCard = this.getCardAt(from);
        const toCard = this.getCardAt(to);

        if (fromCard === null) {
            return false;
        }

        if (!verifyValidity) {
            this.setCardAt(from, null);
            this.setCardAt(to, fromCard);
            return true;
        }

        // Check if the card preceding the gap is the card that differs by one rank and has the same suit.
        const previousColumn = to.column - 1;
        if (previousColumn < 0 && toCard === null) {
            this.setCardAt(from, null);
            this.setCardAt(to, fromCard);
            return true;
        }

        // If the card preceding the gap is also a gap, the swap is invalid.
        const previousCard = this.getCardAt({ row: to.row, column: previousColumn });
        if (previousCard === null) {
            return false;
        }

        if (previousCard.rank+1 === fromCard.rank && previousCard.suit === fromCard.suit) {
            this.setCardAt(from, null);
            this.setCardAt(to, fromCard);
            return true;
        }

        return false;
    }

    getMoveableCards(): CardPosition[] {
        const gaps: CardPosition[] = this.getGapsPositions();
        const moveableCards = this.filter((card, position) => {
            if (card === null) {
                return false;
            }

            for (let gap of gaps) {
                const previousColumn = gap.column - 1;
                if (previousColumn < 0) {
                    return true;
                }

                const previousCard = this.getCardAt({ row: gap.row, column: previousColumn });
                if (previousCard === null) {
                    continue;
                }

                if (card.rank === previousCard.rank+1 && card.suit === previousCard.suit) {
                    return true;
                }
            }
            return false;
        });
        return moveableCards.map(({ position }) => position);
    }

    getStuckGaps(): CardPosition[] {
        return this.filter((card, position) => {
            const previousColumn = position.column - 1;
            if (previousColumn < 0) {
                return false;
            }
            const previousCard = this.getCardAt({ row: position.row, column: previousColumn });
            if (previousCard?.rank === this.lastRank) {
                return true;
            }
            return false;
        }).map(({ position }) => position);
    }
}

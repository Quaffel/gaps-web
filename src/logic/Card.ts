import { Rank } from './Rank';
import { Suit } from './Suit';

export interface Card {
    suit: Suit,
    rank: Rank,
}

export interface CardPosition {
    row: number,
    column: number,
}

export interface Move {
    from: CardPosition,
    to: CardPosition,
}

import { ComponentType } from "./util/types";

export const SuitValues = ['spades', 'hearts', 'clubs', 'diamonds'] as const;
export const RankValues = ['7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'] as const;

export type Suit = ComponentType<typeof SuitValues>;
export type Rank = ComponentType<typeof RankValues>;

export interface Card {
    suit: Suit,
    rank: Rank,
}

export type Row<T> = Array<T>;
export type Board<T> = Array<Row<T>>

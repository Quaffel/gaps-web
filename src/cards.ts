// Less elegant than using an enum declaration as an enum has the concept of cardinality inherent to it.
// It is relatively hard to get the members of an enum though, as Object#keys and Object#values
// also report the respective inverse mapping.
const suitsCardinality = {
    'spades': 0,
    'hearts': 1,
    'clubs': 2,
    'diamonds': 3,
} as const;

export type Suit = keyof typeof suitsCardinality;

export const SUITS = Object.keys(suitsCardinality) as Array<Suit>

export function getSuitCardinality(suit: Suit): number {
    return suitsCardinality[suit];
}

const ranksCardinality = {
    '7': 0,
    '8': 1,
    '9': 2,
    '10': 3,
    'jack': 4,
    'queen': 5,
    'king': 6,
    'ace': 7
} as const;

export type Rank = keyof typeof ranksCardinality;

export const RANKS = Object.keys(ranksCardinality) as Array<Rank>;

export function getRankCardinality(rank: Rank): number {
    return ranksCardinality[rank];
}

export interface Card {
    suit: Suit,
    rank: Rank,
}

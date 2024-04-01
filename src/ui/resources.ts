import { Card } from "../cards";
import { ComponentType } from "../util/types";

export const IconValues = [
    'play', 'pause',
    'fast-forward', 'rewind',
    'skip-forward', 'skip-back',
    'back',
    'disc',
    'star', 'github',
] as const;

export type Icon = ComponentType<typeof IconValues>;

export function getImagePathForIcon(icon: Icon): string {
    return `./res/icons/${icon}.svg`;
}

export function getImagePathForCard(card: Card | null): string {
    const basePath = './res/cards';
    if (card === null) {
        return `${basePath}/back.svg`;
    }

    return `${basePath}/${card.rank}_of_${card.suit}.svg`
}

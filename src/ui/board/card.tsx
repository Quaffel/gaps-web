import { Card } from "../../cards"
import { Resource, getResourcePath } from "../resources";
import './card.css';

function getAltTextForCard(card: Card | null): string {
    if (card === null) {
        return "placeholder for a card";
    }

    return `card of rank ${card.rank} and suit ${card.suit}`
}

export interface CardSpotState {
    card: Card | null,
    highlight: 'selection' | 'candidate' | 'none',
}

export function CardTile({
    spotState,
    onSelect
}: {
    spotState: CardSpotState,
    onSelect?: () => void
}): JSX.Element {
    function getCardResource(card: Card | null): string {
        const cardPath = card === null ? 'cards/back' as const : `cards/${card.rank}_of_${card.suit}` as const;
        return getResourcePath(cardPath);
    }

    let classes = ["card"]

    const highlightClass = {
        "candidate": "card-highlight-candidate",
        "selection": "card-highlight-selection",
        "none": null
    }[spotState.highlight]
    if (highlightClass !== null) classes.push(highlightClass);

    if (spotState.card != null) {
        classes.push("card-present");
    }

    const imageElement = (() => {
        const imageSrc = getCardResource(spotState.card);
        const altText = getAltTextForCard(spotState.card);

        return <img src={imageSrc} alt={altText} />;
    })();

    return <div className={classes.join(" ")} onClick={() => onSelect?.()}>
        {imageElement}
    </div>
}

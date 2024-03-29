import { Card } from "../../cards"
import './card.css';

function getImagePathForCard(card: Card | null): string {
    const basePath = './res/cards';
    if (card === null) {
        return `${basePath}/back.svg`;
    }

    return `${basePath}/${card.rank}_of_${card.suit}.svg`
}

function getAltTextForCard(card: Card | null): string {
    if (card === null) {
        return "placeholder for a card";
    }

    return `card of rank ${card.rank} and suit ${card.suit}`
}

export interface CardSpotState {
    card: Card | null,
    highlight: 'selection' | 'candidate' | 'none'
}

export function CardTile({
    spotState,
    onSelect
}: {
    spotState: CardSpotState,
    onSelect?: () => void
}): JSX.Element {
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
        const imageSrc = getImagePathForCard(spotState.card);
        const altText = getAltTextForCard(spotState.card);

        return <img src={imageSrc} alt={altText} />;
    })();

    return imageElement ?? <div />;
    /*
    return <div className={classes.join(" ")} onClick={() => onSelect?.()}>
        {imageElement}
    </div>*/
}
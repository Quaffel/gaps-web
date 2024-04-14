import { Card } from "../logic/Card";
import { getResourcePath } from "../logic/Ressource";

import "./card.css";

function getAltTextForCard(card: Card | null): string {
    if (card === null) {
        return "placeholder for a card";
    }

    return `card of rank ${card.rank} and suit ${card.suit}`;
}

interface CardTileProps {
    height?: string | number;
    isMoveable?: boolean;
    isCandidate?: boolean;
    card: Card | null;
    isSelected?: boolean;
    onSelect?: () => void;
}

export function CardTile(props: CardTileProps): JSX.Element {
    function getCardResource(card: Card | null): string | null {
        if (card === null) {
            return getResourcePath(`cards/back` as const);
        }
        return getResourcePath(`cards/${card.rank}_of_${card.suit}` as const);
    }

    let classes = ["card"];
    if (props.isSelected || props.isMoveable) {
        classes.push("selected");
    } else if (props.isCandidate) {
        classes.push("candidate");
    }

    const imageElement = (() => {
        const imageSrc = getCardResource(props.card);
        const altText = getAltTextForCard(props.card);

        if (imageSrc === null) {
            return <div className="card-back card-inner" />;
        }
        return <img className="card-inner" src={imageSrc} alt={altText} />;
    })();

    return (
        <div
        className={classes.join(" ")}
        onClick={() => props.onSelect?.()}>
            {imageElement}
        </div>
    );
}

import './labeled-ruler.css';

export function LabeledRuler({
    label,
}: {
    label: string,
}): JSX.Element {
    return <div className="labeled-ruler">
        <hr />
        <span>OR</span>
        <hr />
    </div>
}

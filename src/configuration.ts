import { BoardDimensions } from "./board"

export interface Configuration {
    boardGeneration: {
        method: 'random',
        dimensions: BoardDimensions,
    } | {
        method: 'seed',
        seed: string,
    }
}

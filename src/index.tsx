import React from 'react';
import ReactDOM from 'react-dom/client';
import { Game } from './ui/game';
import { DemoGame } from './gameDemo';
import { PlaybackControlsBar } from './ui/playback';
import { GamePlayback } from './ui/game-playback';
import { Board } from './ui/board/board';
import { Card, RankValues, SuitValues } from './cards';

import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const testBoardState: Board<Card | null> = SuitValues.map(suit => RankValues.map(rank => ({
  rank, suit
})));

testBoardState[1][2] = null;


root.render(
  <React.StrictMode>
    <header>
      <span>Gaps</span>
    </header>
    <main>
      {/* <h1>Regular game</h1>
      <DemoGame /> */}
      <h1>Playback</h1>
      <GamePlayback initialBoard={testBoardState} swaps={[
        {
          from: {
            column: 1,
            row: 1,
          },
          to: {
            column: 2,
            row: 2,
          }
        }
      ]} />
    </main>
  </React.StrictMode>
);


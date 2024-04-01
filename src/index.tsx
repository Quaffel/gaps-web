import React from 'react';
import ReactDOM from 'react-dom/client';

import { GameDemo } from './demo/game';
import { PlaybackDemo } from './demo/playback';
import { SelectionDisplay, WithSelector } from './ui/menu/selection';
import { SelectionBar } from './ui/menu/selection-bar';
import { getResourcePath } from './ui/resources';

import './index.css';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <React.StrictMode>
        <WithSelector options={[
            {
                label: "Play yourself",
                icon: 'icon-feather/play',
                content: () => <GameDemo />
            }, {
                label: "Solve with A*",
                icon: 'icon-feather/star',
                content: () => <PlaybackDemo />,
            }]}>
            <header>
                <span>Gaps</span>
                <SelectionBar />

                <a href=""><img src={getResourcePath('icon-feather/github')} alt='go to GitHub repository' /></a>
            </header>
            <main>
                <SelectionDisplay />
            </main>
        </WithSelector>
    </React.StrictMode >
);

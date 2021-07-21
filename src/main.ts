import * as PIXI from 'pixi.js';
import { getDot, Dot } from './add-dot';
import { simulateDots } from './simulate-dots';
import './style.css';

// Map of all the dots indexed by their unique ID
const dotMap = new Map<string, Dot>();

// Map of dot IDs and their graphic object
// It's separate from the dotMap to allow for the usage
// of webworkers in the future as graphics can't be seralised
const spriteMap = new Map<string, PIXI.Graphics>();

const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundAlpha: 0,
    antialias: true,
    resolution: window.devicePixelRatio,
});

document.body.insertBefore(app.view, null);

// Initialise the dots
const DOT_COUNT = 2000;
const { width, height } = app.screen;

for (let i = 0; i < DOT_COUNT; i++) {
    const [dot, sprite] = getDot(width, height);
    spriteMap.set(dot.id, sprite);
    dotMap.set(dot.id, dot);
    app.stage.addChild(sprite);
}

// Start the app loop
app.ticker.add(function loop() {
    simulateDots({
        dots: Array.from(dotMap.values()),
        spriteMap,
        app,
    });
});

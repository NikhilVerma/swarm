import * as PIXI from 'pixi.js';
import Victor from 'victor';
import { getUniqueId } from './get-unique-id';
import { getValueBetween } from './simulate-dots';

const groups = ['A', 'B', 'C', 'D'] as const;

const colorMap: Record<typeof groups[number], number> = {
    A: 0x000000,
    B: 0xff9000,
    C: 0xff00ae,
    D: 0x00ffff,
};

export function getDot(width: number, height: number): [Dot, PIXI.Graphics] {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);

    const dot: Dot = {
        group: groups[Math.floor(Math.random() * groups.length)],
        id: getUniqueId(),
        pos: new Victor(x, y),
        velocity: new Victor(getValueBetween(-1, 1), getValueBetween(-1, 1)),
        maxSpeed: getValueBetween(1, 3),
        loveForOthers: getValueBetween(1, 5),
        loatheForOthers: getValueBetween(1, 7),
        racistNess: getValueBetween(1, 7),
    };

    const sprite = new PIXI.Graphics();
    sprite.beginFill(colorMap[dot.group], 1);
    sprite.drawEllipse(0, 0, 1.5, 6);
    sprite.endFill();
    sprite.position.set(x, y);

    return [dot, sprite];
}

export type Dot = {
    group: typeof groups[number];
    id: string;
    pos: Victor;
    velocity: Victor;
    maxSpeed: number;
    loveForOthers: number;
    loatheForOthers: number;
    racistNess: number;
};

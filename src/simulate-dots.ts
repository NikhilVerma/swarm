import * as PIXI from 'pixi.js';
import Victor from 'victor';
import { Dot } from './add-dot';

/**
 * After this count of neighbors there is an insignifcant change
 * in the heading of the dots so we can avoid expensive calculations
 */
const MAX_NEIGHBOR_COUNT = 20;
const CROWING_DISTANCE = 50;
const AVOID_GROUPS_DISTANCE = 1000;
const COHESION_DISTANCE = 5000;

export function simulateDots({
    dots,
    spriteMap,
    app,
}: {
    dots: Dot[];
    spriteMap: Map<string, PIXI.Graphics>;
    app: PIXI.Application;
}) {
    const len = dots.length;
    const { width: maxX, height: maxY } = app.screen;

    for (let idx = 0; idx < len; idx++) {
        const dot = dots[idx];
        const { group, pos, velocity } = dots[idx];

        // Try to stick together with other similar dots
        const cohesionAcceleration = new Victor(0, 0);

        // Try not to get too close with other dots
        const crowdingPreventionAcceleration = new Victor(0, 0);

        // Avoid going to dots from other groups
        const groupAvoidanceAcceleration = new Victor(0, 0);

        // Try to go in the same direction as other dots
        const velocityDirection = velocity.clone();

        let cohesionDotsCound = 0;
        let crowdingPreventionDotsCound = 0;
        let groupAvoidanceDotsCount = 0;

        let neighborCount = MAX_NEIGHBOR_COUNT;

        for (let idx2 = 0; idx2 < len; idx2++) {
            const dot2 = dots[idx2];

            if (dot2 === dot) {
                continue;
            }

            // We reached the max number of closest neigbors
            // "stop the count"
            // "stop the count"
            // "stop the count"
            if (neighborCount < 0) {
                break;
            }

            // Square distance since we only care for comparisons
            const dist = pos.distanceSq(dot2.pos);

            if (dist < COHESION_DISTANCE) {
                if (dot2.group !== group) {
                    groupAvoidanceAcceleration.add(dot2.pos);
                    groupAvoidanceDotsCount++;
                } else {
                    cohesionAcceleration.add(dot2.pos);
                    cohesionDotsCound++;

                    // Try to match velocities
                    velocityDirection.add(dot2.velocity);
                }
            }

            if (dist < CROWING_DISTANCE && dot2.group === group) {
                neighborCount--;
                crowdingPreventionAcceleration.add(dot2.pos);
                crowdingPreventionDotsCound++;
            } else if (dist < AVOID_GROUPS_DISTANCE && dot2.group !== group) {
                neighborCount--;
                crowdingPreventionAcceleration.add(dot2.pos);
                crowdingPreventionDotsCound++;
            }
        }

        const acceleration = new Victor(0, 0);

        // Add some randomness to the acceleration
        const randomHeadingVector = new Victor(
            getValueBetween(-1, 1),
            getValueBetween(-1, 1)
        ).normalize();
        acceleration.add(randomHeadingVector);

        if (cohesionDotsCound > 0) {
            cohesionAcceleration
                .divideScalar(cohesionDotsCound)
                .subtract(pos)
                .normalize()
                .multiplyScalar(dot.loveForOthers);

            velocityDirection.normalize().multiplyScalar(dot.loveForOthers);

            acceleration.add(cohesionAcceleration);
            acceleration.add(velocityDirection);
        }

        if (crowdingPreventionDotsCound > 0) {
            crowdingPreventionAcceleration
                .divideScalar(crowdingPreventionDotsCound)
                .subtract(pos)
                .normalize()
                .multiplyScalar(dot.loatheForOthers);
            acceleration.subtract(crowdingPreventionAcceleration);
        }

        if (groupAvoidanceDotsCount > 0) {
            groupAvoidanceAcceleration
                .divideScalar(groupAvoidanceDotsCount)
                .subtract(pos)
                .normalize()
                .multiplyScalar(dot.racistNess);
            acceleration.subtract(groupAvoidanceAcceleration);
        }

        acceleration.normalize().multiplyScalar(1);

        const oldVelocity = velocity.clone();
        velocity.add(acceleration).normalize().multiplyScalar(dot.maxSpeed);
        pos.add(velocity);

        pos.x = wrapValue(pos.x, maxX);
        pos.y = wrapValue(pos.y, maxY);

        const sprite = spriteMap.get(dot.id);
        if (sprite) {
            sprite.position.set(pos.x, pos.y);
            sprite.rotation = oldVelocity.subtract(velocity).horizontalAngle();
        }
    }
}

export function getValueBetween(num1: number, num2: number) {
    return num1 + (num2 - num1) * Math.random();
}

function wrapValue(value: number, maxValue: number) {
    if (value < 0) {
        value += maxValue;
    } else if (value > maxValue) {
        value -= maxValue;
    }

    return value;
}

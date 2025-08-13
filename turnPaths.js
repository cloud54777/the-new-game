// Lane and intersection geometry
const laneWidth = 20;
const halfIntersection = 100;
const laneOffset = laneWidth / 2;

// Path definitions for all turns and straight movements
export const TURN_PATHS = {
    // Right turns
    northToEast: {
        P0: { x: +laneOffset, y: -halfIntersection },
        P1: { x: halfIntersection, y: -halfIntersection },
        P2: { x: halfIntersection, y: -laneOffset }
    },
    eastToSouth: {
        P0: { x: halfIntersection, y: -laneOffset },
        P1: { x: halfIntersection, y: halfIntersection },
        P2: { x: +laneOffset, y: halfIntersection }
    },
    southToWest: {
        P0: { x: -laneOffset, y: halfIntersection },
        P1: { x: -halfIntersection, y: halfIntersection },
        P2: { x: -halfIntersection, y: +laneOffset }
    },
    westToNorth: {
        P0: { x: -halfIntersection, y: +laneOffset },
        P1: { x: -halfIntersection, y: -halfIntersection },
        P2: { x: -laneOffset, y: -halfIntersection }
    },

    // Left turns
    northToWest: {
        P0: { x: -laneOffset, y: -halfIntersection },
        P1: { x: -halfIntersection, y: -halfIntersection },
        P2: { x: -halfIntersection, y: +laneOffset }
    },
    westToSouth: {
        P0: { x: -halfIntersection, y: -laneOffset },
        P1: { x: -halfIntersection, y: halfIntersection },
        P2: { x: -laneOffset, y: halfIntersection }
    },
    southToEast: {
        P0: { x: +laneOffset, y: halfIntersection },
        P1: { x: halfIntersection, y: halfIntersection },
        P2: { x: halfIntersection, y: -laneOffset }
    },
    eastToNorth: {
        P0: { x: halfIntersection, y: +laneOffset },
        P1: { x: halfIntersection, y: -halfIntersection },
        P2: { x: +laneOffset, y: -halfIntersection }
    },

    // Straight movements
    northStraightLeft:  { P0: { x: -laneOffset, y: -halfIntersection }, P1: { x: -laneOffset, y: 0 }, P2: { x: -laneOffset, y: halfIntersection } },
    northStraightRight: { P0: { x: +laneOffset, y: -halfIntersection }, P1: { x: +laneOffset, y: 0 }, P2: { x: +laneOffset, y: halfIntersection } },
    southStraightLeft:  { P0: { x: +laneOffset, y: halfIntersection }, P1: { x: +laneOffset, y: 0 }, P2: { x: +laneOffset, y: -halfIntersection } },
    southStraightRight: { P0: { x: -laneOffset, y: halfIntersection }, P1: { x: -laneOffset, y: 0 }, P2: { x: -laneOffset, y: -halfIntersection } },
    eastStraightLeft:   { P0: { x: halfIntersection, y: +laneOffset }, P1: { x: 0, y: +laneOffset }, P2: { x: -halfIntersection, y: +laneOffset } },
    eastStraightRight:  { P0: { x: halfIntersection, y: -laneOffset }, P1: { x: 0, y: -laneOffset }, P2: { x: -halfIntersection, y: -laneOffset } },
    westStraightLeft:   { P0: { x: -halfIntersection, y: -laneOffset }, P1: { x: 0, y: -laneOffset }, P2: { x: halfIntersection, y: -laneOffset } },
    westStraightRight:  { P0: { x: -halfIntersection, y: +laneOffset }, P1: { x: 0, y: +laneOffset }, P2: { x: halfIntersection, y: +laneOffset } }
};

// Quadratic Bézier curve follower
export function followCurve(car, path, t) {
    const { P0, P1, P2 } = path;
    // Bézier formula
    const x = (1 - t) * (1 - t) * P0.x + 2 * (1 - t) * t * P1.x + t * t * P2.x;
    const y = (1 - t) * (1 - t) * P0.y + 2 * (1 - t) * t * P1.y + t * t * P2.y;

    // For rotation: look ahead a bit
    const dt = 0.01;
    const tNext = Math.min(t + dt, 1);
    const xNext = (1 - tNext) * (1 - tNext) * P0.x + 2 * (1 - tNext) * tNext * P1.x + tNext * tNext * P2.x;
    const yNext = (1 - tNext) * (1 - tNext) * P0.y + 2 * (1 - tNext) * tNext * P1.y + tNext * tNext * P2.y;

    car.x = x;
    car.y = y;
    car.angle = Math.atan2(yNext - y, xNext - x);

    // Snap to lane center at end
    if (t >= 1) {
        car.x = P2.x;
        car.y = P2.y;
    }
}

// Example usage: move a car along a right turn from north to east
/*
import { TURN_PATHS, followCurve } from './turnPaths.js';

let car = { x: 0, y: 0, angle: 0 };
for (let t = 0; t <= 1; t += 0.01) {
    followCurve(car, TURN_PATHS.northToEast, t);
        // Render car at car.x, car.y,
    */
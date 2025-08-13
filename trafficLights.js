import { CONFIG } from "./config.js";

const TrafficLightState = {
    RED: 'red',
    YELLOW: 'yellow',
    GREEN: 'green',
    OFF: 'off'
};

export class TrafficLightController {
    constructor() {
        this.lights = {};
        this.mode = CONFIG.MODES.FIXED;
        this.currentPhase = 0; // 0: NS green, 1: NS yellow, 2: all red, 3: EW green, 4: EW yellow, 5: all red
        this.phaseTimer = 0;
        this.adaptiveData = {};
        this.lastGreenChange = 0;
        
        this.initializeLights();
    }

    initializeLights() {
        // Initialize all lights to red
        Object.values(CONFIG.DIRECTIONS).forEach(direction => {
            this.lights[direction] = {
                state: CONFIG.LIGHT_STATES.RED,
                timer: 0
            };
        });
    }

    initialize(mode, settings) {
        this.mode = mode;
        this.settings = settings;
        this.reset();
    }

    reset() {
        this.currentPhase = 0;
        this.phaseTimer = 0;
        this.lastGreenChange = 0;
        
        // Reset to initial state
        if (this.mode === CONFIG.MODES.FIXED) {
            this.setFixedTimerState();
        } else {
            this.setAdaptiveState();
        }
    }

    update(deltaTime, mode, settings) {
        this.mode = mode;
        this.settings = settings;

        if (this.mode === CONFIG.MODES.FIXED) {
            this.updateFixedTimer(deltaTime);
        } else {
            this.updateAdaptive(deltaTime);
        }
    }

    updateFixedTimer(deltaTime) {
        this.phaseTimer += deltaTime;

        switch (this.currentPhase) {
            case 0: // North-South Green
                if (this.phaseTimer >= this.settings.GREEN_DURATION) {
                    this.advancePhase();
                }
                break;
            case 1: // North-South Yellow
                if (this.phaseTimer >= this.settings.YELLOW_DURATION) {
                    this.advancePhase();
                }
                break;
            case 2: // All Red
                if (this.phaseTimer >= this.settings.ALL_RED_DURATION) {
                    this.advancePhase();
                }
                break;
            case 3: // East-West Green
                if (this.phaseTimer >= this.settings.GREEN_DURATION) {
                    this.advancePhase();
                }
                break;
            case 4: // East-West Yellow
                if (this.phaseTimer >= this.settings.YELLOW_DURATION) {
                    this.advancePhase();
                }
                break;
            case 5: // All Red
                if (this.phaseTimer >= this.settings.ALL_RED_DURATION) {
                    this.advancePhase();
                }
                break;
        }
    }

    updateAdaptive(deltaTime) {
        this.phaseTimer += deltaTime;
        
        // Ensure minimum green time before considering changes
        if (this.phaseTimer < this.settings.MIN_GREEN_TIME) {
            return;
        }

        // Check if we should change the light based on sensor data
        if (this.adaptiveData && Object.keys(this.adaptiveData).length > 0) {
            const currentGreenDirection = this.getCurrentGreenDirection();
            const nextDirection = this.calculateNextDirection();
            
            if (nextDirection !== currentGreenDirection && nextDirection !== null) {
                this.changeToDirection(nextDirection);
            }
        }
    }

    updateAdaptiveLogic(sensorData, deltaTime) {
        this.adaptiveData = sensorData;
    }

    advancePhase() {
        this.currentPhase = (this.currentPhase + 1) % 6;
        this.phaseTimer = 0;
        this.setFixedTimerState();
    }

    setFixedTimerState() {
        // Reset all lights to red first
        Object.values(CONFIG.DIRECTIONS).forEach(direction => {
            this.lights[direction].state = CONFIG.LIGHT_STATES.RED;
        });

        switch (this.currentPhase) {
            case 0: // North-South Green
                this.lights[CONFIG.DIRECTIONS.NORTH].state = CONFIG.LIGHT_STATES.GREEN;
                this.lights[CONFIG.DIRECTIONS.SOUTH].state = CONFIG.LIGHT_STATES.GREEN;
                break;
            case 1: // North-South Yellow
                this.lights[CONFIG.DIRECTIONS.NORTH].state = CONFIG.LIGHT_STATES.YELLOW;
                this.lights[CONFIG.DIRECTIONS.SOUTH].state = CONFIG.LIGHT_STATES.YELLOW;
                break;
            case 2: // All Red (between NS and EW)
                // All lights already set to red
                break;
            case 3: // East-West Green
                this.lights[CONFIG.DIRECTIONS.EAST].state = CONFIG.LIGHT_STATES.GREEN;
                this.lights[CONFIG.DIRECTIONS.WEST].state = CONFIG.LIGHT_STATES.GREEN;
                break;
            case 4: // East-West Yellow
                this.lights[CONFIG.DIRECTIONS.EAST].state = CONFIG.LIGHT_STATES.YELLOW;
                this.lights[CONFIG.DIRECTIONS.WEST].state = CONFIG.LIGHT_STATES.YELLOW;
                break;
            case 5: // All Red (between EW and NS)
                // All lights already set to red
                break;
        }
    }

    setAdaptiveState() {
        // Start with North-South green in adaptive mode
        Object.values(CONFIG.DIRECTIONS).forEach(direction => {
            this.lights[direction].state = CONFIG.LIGHT_STATES.RED;
        });
        
        this.lights[CONFIG.DIRECTIONS.NORTH].state = CONFIG.LIGHT_STATES.GREEN;
        this.lights[CONFIG.DIRECTIONS.SOUTH].state = CONFIG.LIGHT_STATES.GREEN;
    }

    getCurrentGreenDirection() {
        for (const [direction, light] of Object.entries(this.lights)) {
            if (light.state === CONFIG.LIGHT_STATES.GREEN) {
                return parseInt(direction);
            }
        }
        return null;
    }

    calculateNextDirection() {
        if (!this.adaptiveData) return null;

        let maxPriority = 0;
        let nextDirection = null;

        Object.entries(this.adaptiveData).forEach(([direction, data]) => {
            const dir = parseInt(direction);
            if (this.lights[dir].state !== CONFIG.LIGHT_STATES.GREEN && data.carsWaiting > 0) {
                const priority = data.carsWaiting * (data.waitTime / 1000); // Simple priority calculation
                if (priority > maxPriority) {
                    maxPriority = priority;
                    nextDirection = dir;
                }
            }
        });

        return nextDirection;
    }

    changeToDirection(direction) {
        // Set all lights to red first
        Object.values(CONFIG.DIRECTIONS).forEach(dir => {
            this.lights[dir].state = CONFIG.LIGHT_STATES.RED;
        });

        // Set the chosen direction(s) to green
        if (direction === CONFIG.DIRECTIONS.NORTH || direction === CONFIG.DIRECTIONS.SOUTH) {
            this.lights[CONFIG.DIRECTIONS.NORTH].state = CONFIG.LIGHT_STATES.GREEN;
            this.lights[CONFIG.DIRECTIONS.SOUTH].state = CONFIG.LIGHT_STATES.GREEN;
        } else {
            this.lights[CONFIG.DIRECTIONS.EAST].state = CONFIG.LIGHT_STATES.GREEN;
            this.lights[CONFIG.DIRECTIONS.WEST].state = CONFIG.LIGHT_STATES.GREEN;
        }

        this.phaseTimer = 0;
        this.lastGreenChange = Date.now();
    }

    render(ctx, intersection) {
        const directions = ['north', 'south', 'east', 'west'];
        directions.forEach(direction => {
            const state = this.lights[CONFIG.DIRECTIONS[direction.toUpperCase()]].state;
            this.renderTrafficLight(ctx, direction, state, intersection);
        });
    }

renderTrafficLight(ctx, direction, state, intersection) {
    const position = intersection.getLightPosition(direction);
    if (!position) return;

    const lightSize = CONFIG.LIGHT_SIZE || 12;
    const spacing = lightSize + 2;

    // Draw light housing
    ctx.fillStyle = '#333';
    ctx.fillRect(position.x - lightSize - 1, position.y - spacing * 1.5 - 1, (lightSize + 1) * 2, spacing * 3 + 2);

    // Draw lights
    const lights = ['red', 'yellow', 'green'];
    lights.forEach((color, index) => {
        const lightY = position.y - spacing + (index * spacing);

        // Light background
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(position.x, lightY, lightSize, 0, Math.PI * 2);
        ctx.fill();

        // Active light
        if (state === color) {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(position.x, lightY, lightSize - 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

    // Public methods for UI and game engine
    getLightStates() {
        const states = {};
        Object.entries(this.lights).forEach(([direction, light]) => {
            states[direction] = light.state;
        });
        return states;
    }

    setMode(mode) {
        this.mode = mode;
        this.reset();
    }

    updateSettings(settings) {
        this.settings = settings;
    }

    isRedLight(direction) {
        return this.lights[direction].state === CONFIG.LIGHT_STATES.RED;
    }

    canProceed(direction) {
        const state = this.lights[direction].state;
        return state === CONFIG.LIGHT_STATES.GREEN || state === CONFIG.LIGHT_STATES.YELLOW;
    }
}
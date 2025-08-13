import { GameEngine } from './gameEngine.js';
import { UIController } from './ui.js';
import { CONFIG } from './config.js';
import { TURN_PATHS, followCurve } from './turnPaths.js';
import { TrafficLightController } from './trafficLights.js';
import { Car } from './cars.js';

class TrafficSimulator {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameEngine = new GameEngine(this.canvas, this.ctx);
        this.uiController = new UIController(this.gameEngine);
        this.trafficLightController = new TrafficLightController();
        
        this.isRunning = true;
        this.lastTime = 0;
        
        this.initializeGame();
        this.startGameLoop();
    }

    initializeGame() {
        // Set canvas size
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;
        
        // Initialize game systems
        this.gameEngine.initialize();
        this.uiController.initialize();
        
        console.log('Traffic Simulator initialized');
    }

    startGameLoop() {
        const gameLoop = (currentTime) => {
            const deltaTime = (currentTime - this.lastTime) / 1000;
            this.lastTime = currentTime;

            if (this.isRunning) {
                // Get durations from sliders
                const settings = {
                    GREEN_DURATION: Number(document.getElementById('greenDuration').value),
                    YELLOW_DURATION: Number(document.getElementById('yellowDuration').value),
                    ALL_RED_DURATION: Number(document.getElementById('redDuration').value),
                    ...CONFIG
                };

                this.trafficLightController.update(deltaTime, CONFIG.MODES.FIXED, settings);
                this.gameEngine.update(deltaTime);
            }

            // Render intersection and traffic lights
            this.intersection.render(this.ctx);
            this.trafficLightController.render(this.ctx, this.intersection);

            this.gameEngine.render();
            requestAnimationFrame(gameLoop);
        };

        requestAnimationFrame(gameLoop);
    }

    pause() {
        this.isRunning = false;
    }

    resume() {
        this.isRunning = true;
    }

    reset() {
        this.gameEngine.reset();
    }

    togglePause() {
        this.isRunning = !this.isRunning;
        return this.isRunning;
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.trafficSimulator = new TrafficSimulator();
});

const simulator = new TrafficSimulator();

const directions = ['north', 'south', 'east', 'west'];
function spawnCar(intersection, carManager) {
    const direction = directions[Math.floor(Math.random() * directions.length)];
    const car = new Car({
        intersection: intersection,
        direction: direction
        // ...other car properties...
    });
    carManager.cars.push(car); // Use .cars array
}

// Spawn a car every 2 seconds
setInterval(() => {
    spawnCar(simulator.gameEngine.intersection, simulator.gameEngine.carManager);
}, 2000);
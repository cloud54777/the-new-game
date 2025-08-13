import { Intersection } from './intersection.js';
import { TrafficLightController } from './trafficLights.js';
import { CarManager } from './cars.js';
import { SensorSystem } from './sensors.js';
import { Statistics } from './statistics.js';
import { CONFIG } from './config.js'; // Ensure CONFIG is imported

export class GameEngine {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        
        // Game components
        this.intersection = new Intersection(CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2);
        this.trafficLights = new TrafficLightController();
        this.carManager = new CarManager(this.intersection);
        this.sensorSystem = new SensorSystem(this.intersection);
        this.statistics = new Statistics();
        
        // Game state
        this.mode = CONFIG.MODES.FIXED;
        this.settings = { ...CONFIG.DEFAULT_SETTINGS };
        
        // Event listeners for settings changes
        this.setupEventListeners();
    }

    initialize() {
        this.intersection.initialize();
        this.intersection.setCarManager(this.carManager);
        this.trafficLights.initialize(this.mode, this.settings);
        this.carManager.initialize(this.settings);
        this.sensorSystem.initialize(this.settings.DETECTOR_DISTANCE);
        this.statistics.initialize();
        
        console.log('Game engine initialized');
    }

    setupEventListeners() {
        // Listen for car completion events
        this.carManager.onCarCompleted = (car) => {
            this.statistics.recordCarCompletion(car);
        };
    }

    update(deltaTime) {
        // Update traffic lights
        this.trafficLights.update(deltaTime, this.mode, this.settings);
        
        // Update cars
        this.carManager.update(deltaTime, this.trafficLights.getLightStates());
        
        // Update sensors (for adaptive mode)
        if (this.mode === CONFIG.MODES.ADAPTIVE) {
            const sensorData = this.sensorSystem.update(this.carManager.getCars());
            this.trafficLights.updateAdaptiveLogic(sensorData, deltaTime);
        }
        
        // Update statistics
        this.statistics.update(this.carManager.getCars(), deltaTime);
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render intersection
        this.intersection.render(this.ctx);
        
        // Render sensor detection zones (for adaptive mode)
        if (this.mode === CONFIG.MODES.ADAPTIVE) {
            this.sensorSystem.render(this.ctx);
        }
        
        // Render cars
        this.carManager.render(this.ctx);
        
        // Render traffic lights
        this.trafficLights.render(this.ctx, this.intersection);
    }

    reset() {
        this.carManager.reset();
        this.trafficLights.reset();
        this.statistics.reset();
        console.log('Game reset');
    }

    // Settings update methods
    updateMode(mode) {
        this.mode = mode;
        this.trafficLights.setMode(mode);
        console.log(`Mode changed to: ${mode}`);
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        
        // Apply setting changes to relevant systems
        switch (key) {
            case 'CAR_SPAWN_RATE':
            case 'CAR_SPEED':
            case 'TURN_RATE':
                this.carManager.updateSettings(this.settings);
                break;
            case 'DETECTOR_DISTANCE':
                this.sensorSystem.updateDetectorDistance(value);
                break;
            case 'GREEN_DURATION':
            case 'YELLOW_DURATION':
            case 'ALL_RED_DURATION':
            case 'MIN_GREEN_TIME':
                this.trafficLights.updateSettings(this.settings);
                break;
        }
    }

    // Getters for UI
    getStatistics() {
        return this.statistics.getStats();
    }

    getLightStates() {
        return this.trafficLights.getLightStates();
    }

    getCurrentMode() {
        return this.mode;
    }

    getSettings() {
        return { ...this.settings };
    }
}


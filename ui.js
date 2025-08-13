import { CONFIG } from './config.js';

export class UIController {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.elements = {};
        this.isPlaying = true;
        
        this.initializeElements();
    }

    initializeElements() {
        // Control elements
        this.elements = {
            modeSelect: document.getElementById('mode-select'),
            playPauseBtn: document.getElementById('playPauseBtn'),
            resetBtn: document.getElementById('resetBtn'),
            
            // Fixed timer controls
            fixedControls: document.getElementById('fixed-controls'),
            greenDuration: document.getElementById('greenDuration'),
            yellowDuration: document.getElementById('yellowDuration'),
            allRedDuration: document.getElementById('allRedDuration'),
            greenValue: document.getElementById('greenDurationValue'),
            yellowValue: document.getElementById('yellowDurationValue'),
            allRedValue: document.getElementById('redDurationValue'),
            
            // Adaptive controls
            adaptiveControls: document.getElementById('adaptive-controls'),
            detectorDistance: document.getElementById('detectorDistance'),
            minGreenTime: document.getElementById('minGreenTime'),
            detectorValue: document.getElementById('detectorValue'),
            minGreenValue: document.getElementById('minGreenValue'),
            
            // Car controls
            carSpawnRate: document.getElementById('carSpawnRate'),
            carSpeed: document.getElementById('carSpeed'),
            turnRate: document.getElementById('turnRate'),
            spawnValue: document.getElementById('spawnValue'),
            speedValue: document.getElementById('speedValue'),
            turnValue: document.getElementById('turnValue'),
            
            // Statistics
            carsPassedStat: document.getElementById('carsPassedStat'),
            avgWaitStat: document.getElementById('avgWaitStat'),
            currentCarsStat: document.getElementById('currentCarsStat'),
            
            // Light status
            northLight: document.getElementById('north-light'),
            eastLight: document.getElementById('east-light'),
            southLight: document.getElementById('south-light'),
            westLight: document.getElementById('west-light')
        };
    }

    initialize() {
        this.setupEventListeners();
        this.updateModeDisplay();
        this.startStatsUpdate();
    }

    setupEventListeners() {
        // Mode selector
        this.elements.modeSelect.addEventListener('change', (e) => {
            this.gameEngine.updateMode(e.target.value);
            this.updateModeDisplay();
        });

        // Control buttons
        this.elements.playPauseBtn.addEventListener('click', () => {
            this.isPlaying = window.trafficSimulator.togglePause();
            this.elements.playPauseBtn.textContent = this.isPlaying ? '⏸️ Pause' : '▶️ Play';
        });

        this.elements.resetBtn.addEventListener('click', () => {
            this.gameEngine.reset();
        });

        // Fixed timer controls
        this.setupSlider('greenDuration', 'greenValue', 'GREEN_DURATION', (value) => value * 1000);
        this.setupSlider('yellowDuration', 'yellowValue', 'YELLOW_DURATION', (value) => value * 1000);
        this.setupSlider('allRedDuration', 'allRedValue', 'ALL_RED_DURATION', (value) => value * 1000);

        // Adaptive controls
        this.setupSlider('detectorDistance', 'detectorValue', 'DETECTOR_DISTANCE');
        this.setupSlider('minGreenTime', 'minGreenValue', 'MIN_GREEN_TIME', (value) => value * 1000);

        // Car controls
        this.setupSlider('carSpawnRate', 'spawnValue', 'CAR_SPAWN_RATE');
        this.setupSlider('carSpeed', 'speedValue', 'CAR_SPEED');
        this.setupSlider('turnRate', 'turnValue', 'TURN_RATE', (value) => value / 100);
    }

    setupSlider(sliderId, valueId, settingKey, transform = null) {
        const slider = this.elements[sliderId];
        const valueDisplay = this.elements[valueId];

        if (!slider || !valueDisplay) return;

        slider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            valueDisplay.textContent = value;
            
            const settingValue = transform ? transform(value) : value;
            this.gameEngine.updateSetting(settingKey, settingValue);
        });

        // Initialize display
        valueDisplay.textContent = slider.value;
    }

    updateModeDisplay() {
        const mode = this.gameEngine.getCurrentMode();
        
        if (mode === CONFIG.MODES.FIXED) {
            this.elements.fixedControls.style.display = 'block';
            this.elements.adaptiveControls.style.display = 'none';
        } else {
            this.elements.fixedControls.style.display = 'none';
            this.elements.adaptiveControls.style.display = 'block';
        }
    }

    startStatsUpdate() {
        setInterval(() => {
            this.updateStatistics();
            this.updateLightStatus();
        }, 100); // Update 10 times per second
    }

    updateStatistics() {
        const stats = this.gameEngine.getStatistics();
        
        this.elements.carsPassedStat.textContent = stats.totalCarsPassed;
        this.elements.avgWaitStat.textContent = stats.averageWaitTime.toFixed(1) + 's';
        this.elements.currentCarsStat.textContent = stats.currentCars;
    }

    updateLightStatus() {
        const lightStates = this.gameEngine.getLightStates();
        
        const lightElements = {
            [CONFIG.DIRECTIONS.NORTH]: this.elements.northLight,
            [CONFIG.DIRECTIONS.EAST]: this.elements.eastLight,
            [CONFIG.DIRECTIONS.SOUTH]: this.elements.southLight,
            [CONFIG.DIRECTIONS.WEST]: this.elements.westLight
        };

        Object.entries(lightStates).forEach(([direction, state]) => {
            const element = lightElements[direction];
            if (element) {
                // Remove all state classes
                element.classList.remove('red', 'yellow', 'green');
                
                // Add current state class
                element.classList.add(state);
            }
        });
    }

    // Public methods for external control
    setMode(mode) {
        this.elements.modeSelect.value = mode;
        this.updateModeDisplay();
    }

    updateSliderValue(sliderId, value) {
        const slider = this.elements[sliderId];
        if (slider) {
            slider.value = value;
            slider.dispatchEvent(new Event('input'));
        }
    }
}

document.getElementById('greenDuration').min = 15;
document.getElementById('greenDuration').max = 100;

document.getElementById('redDuration').min = 15;
document.getElementById('redDuration').max = 100;

const greenSlider = document.getElementById('greenDuration');
const greenValue = document.getElementById('greenDurationValue');
greenSlider.addEventListener('input', () => {
    greenValue.textContent = greenSlider.value;
});

const yellowSlider = document.getElementById('yellowDuration');
const yellowValue = document.getElementById('yellowDurationValue');
yellowSlider.addEventListener('input', () => {
    yellowValue.textContent = yellowSlider.value;
});

const redSlider = document.getElementById('redDuration');
const redValue = document.getElementById('redDurationValue');
redSlider.addEventListener('input', () => {
    redValue.textContent = redSlider.value;
});



















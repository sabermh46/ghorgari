// scripts/visualizers/base-visualizer.js
export class BaseVisualizer {
    constructor(canvas, ctx, analyser = null) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.analyser = analyser;
        this.dataArray = null;
        
        if (this.analyser) {
            this._initializeDataArray();
        }
    }

    _initializeDataArray() {
        if (this.analyser && this.analyser.frequencyBinCount) {
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        }
    }

    setAnalyser(analyser) {
        this.analyser = analyser;
        this._initializeDataArray();
    }

    getFrequencyData() {
        if (!this.analyser || !this.dataArray) {
            return new Uint8Array(0); // Return empty array if not initialized
        }
        
        try {
            this.analyser.getByteFrequencyData(this.dataArray);
            return this.dataArray;
        } catch (error) {
            console.error('Error getting frequency data:', error);
            return new Uint8Array(0);
        }
    }

    init() { /* To be overridden */ }
    draw() { /* To be overridden */ }
}
// scripts/visualizers/simple-particles.js
import { AudioManager } from '../audio-manager.js';

export default class SimpleParticlesVisualizer {
  constructor() {
    this.particles = Array.from({length: 150}, () => ({
      x: 0, y: 0, angle: 0, r: 0, size: 0, hue: 0
    }));
    this.lastTime = performance.now();
    this.bgGradient = null;
    this.lastCanvasSize = {w: 0, h: 0};
    this.bgCanvas = document.createElement('canvas');
    this.bgContext = this.bgCanvas.getContext('2d');
    
    // Default configuration
    this.centerX = 50;
    this.centerY = 30;
    this.boostFactor = 0.4;
  }

  draw(ctx, canvas) {
    const now = performance.now();
    const dt = (now - this.lastTime) / 1000; 
    this.lastTime = now;
    
    const freq = AudioManager.getFrequencyData();
    const high = freq.slice(200).reduce((s, v) => s + v, 0) / 56 || 0;
    const boost = high / 255 * this.boostFactor;
    
    const cx = canvas.width * (this.centerX / 100);
    const cy = canvas.height * (this.centerY / 100);

    if(canvas.width !== this.lastCanvasSize.w || canvas.height !== this.lastCanvasSize.h) {
      this.bgCanvas.width = canvas.width;
      this.bgCanvas.height = canvas.height;
      this.bgGradient = this.bgContext.createRadialGradient(
        cx, cy, 0, 
        cx, cy, Math.max(canvas.width, canvas.height) * 0.6
      );
      // this.bgGradient.addColorStop(0, 'rgba(8, 8, 32, 0.9)');
      // this.bgGradient.addColorStop(1, 'rgba(4, 4, 16, 0.6)');
      
      // this.bgContext.fillStyle = this.bgGradient;
      // this.bgContext.fillRect(0, 0, canvas.width, canvas.height);
      this.lastCanvasSize = {w: canvas.width, h: canvas.height};
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(this.bgCanvas, 0, 0);

    ctx.globalCompositeOperation = 'screen';
    this.particles.forEach(p => {
      if(Math.random() < boost * 0.03) {
        p.angle = Math.random() * Math.PI * 2;
        p.r = 0; 
        p.size = 1 + Math.random() * 2;
        p.hue = (240 + high * 0.2 + Math.random() * 40) % 360;
      }

      p.r += dt * (80 + boost * 300);
      p.x = cx + Math.cos(p.angle) * p.r;
      p.y = cy + Math.sin(p.angle) * p.r;

      const alpha = Math.min(0.6, 1 - p.r/(canvas.width/3));
      if(alpha <= 0) p.r = 0;
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
      ctx.fillStyle = `hsla(${p.hue},50%,65%,${alpha * 0.7})`;
      ctx.fill();
    });

    ctx.globalCompositeOperation = 'source-over';
  }
}
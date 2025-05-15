// scripts/visualizers/hypnotic-vortex.js
import { AudioManager } from '../audio-manager.js';

const PERSPECTIVE = 800;
const MIN_Z = -500; // Prevent particles getting too close

export default class HypnoticVortex {
  constructor() {
    this.particles = [];
    this.rotation = { angle: 0, velocity: 0 };
    this.lastFrame = performance.now();
    this.hueOffset = 0;
    
    this.initParticles();
    this.cos = Math.cos;
    this.sin = Math.sin;
    this.zoomSpeed = 2;
    this.rotationSettings = {
      baseSpeed: 0.000000005, // Keep this very low
      bassSensitivity: 0, // Set to 0 to completely disable bass influence
      minRotation: 0 // Add this to set absolute minimum
    };
    this.particleSettings = {
      orbitalSpeed: 0.03, // Reduced from original 0.02-0.03 range
    };
    this.centerDrift = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    speed: 0.002 // Drift speed (lower = smoother)
  };

  }

  initParticles() {
    for(let i = 0; i < 500; i++) {
      this.particles.push({
        z: Math.random() * 1500 - 500, // Adjusted z-range
        angle: Math.random() * Math.PI * 2,
        radius: 50 + Math.random() * 300,
        speed: 0.02 + Math.random() * 0.03,
        size: 2 + Math.random() * 4,
        speed: 0.01 * (0.5 + Math.random()), // Random variation
      });
    }
  }

  draw(ctx, canvas) {
    const now = performance.now();
    const delta = (now - this.lastFrame) / 16.67;
    this.lastFrame = now;

    const freq = AudioManager.getFrequencyData();
    const bass = freq.slice(0, 60).reduce((a,b) => a + b, 0) / 60;
    const mid = freq.slice(60, 180).reduce((a,b) => a + b, 0) / 120;
    const high = freq.slice(180, 255).reduce((a,b) => a + b, 0) / 75;

    this.updateSystem(bass, mid, high, delta);
    this.drawBackground(ctx, canvas, high);
    this.drawVortex(ctx, canvas, bass, mid, high);
  }

  updateSystem(bass, mid, high, delta) {
    const rotationForce = this.rotationSettings.bassSensitivity > 0 
      ? (bass/6000) * this.rotationSettings.bassSensitivity
      : 0;
      
    this.rotation.velocity = this.lerp(
      this.rotation.velocity, 
      rotationForce,
      0.1
    );
    
    // Apply absolute minimum limit
    this.rotation.angle += Math.max(
      this.rotationSettings.minRotation,
      this.rotationSettings.baseSpeed * delta
    );
    
    this.hueOffset = (this.hueOffset + mid * 0.02) % 360;
  }


  drawBackground(ctx, canvas, high) {
  // Define the frequency range and corresponding alpha values
    const minFreq = 40;
    const maxFreq = 200;
    const minAlpha = 0.4; // Fully transparent
    const maxAlpha = 0.6; // Fully opaque

    // Clamp the high-frequency value within the defined range
    const clampedHigh = Math.max(minFreq, Math.min(high, maxFreq));

    // Calculate the alpha value using linear interpolation
    const alpha = maxAlpha - ((clampedHigh - minFreq) / (maxFreq - minFreq)) * (maxAlpha - minAlpha);

    // Set the fill style with the computed alpha
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the star field or other background elements
    this.drawStarField(ctx, canvas, high);
  }

  updateCenterDrift(delta) {
  // Randomly change target position occasionally
  if(Math.random() < 0.005) {
    this.centerDrift.targetX = (Math.random() - 0.5) * 200;
    this.centerDrift.targetY = (Math.random() - 0.5) * 200;
  }
  
  // Smoothly drift toward target
  this.centerDrift.x = this.lerp(
    this.centerDrift.x,
    this.centerDrift.targetX,
    this.centerDrift.speed * delta
  );
  this.centerDrift.y = this.lerp(
    this.centerDrift.y,
    this.centerDrift.targetY,
    this.centerDrift.speed * delta
  );
}



  drawVortex(ctx, canvas, bass, mid, high) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const audioIntensity = Math.min(1, (bass + mid * 0.5 + high * 0.3) / 255);

    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(this.rotation.angle);

    this.drawParticles(ctx, audioIntensity, high);
    this.drawCentralGlow(ctx, high);

    ctx.restore();
  }

  drawParticles(ctx, audioIntensity, high) {
    this.particles.sort((a,b) => b.z - a.z).forEach(particle => {
      


      // Ensure valid scale calculation
      const denominator = Math.max(PERSPECTIVE + particle.z, 10);
      const scale = PERSPECTIVE / denominator;
      
      const x = this.cos(particle.angle) * particle.radius * scale;
      const y = this.sin(particle.angle) * particle.radius * scale;
      
      particle.angle += particle.speed * (0.1 + audioIntensity * 1); // Reduced multipliers
      particle.z = Math.max(MIN_Z, particle.z - (this.zoomSpeed + high * 0.1));
      
      if(particle.z <= MIN_Z) {
        particle.z = 1000;
        particle.radius = 50 + Math.random() * 300;
      }

      const luminance = 50 + 45 * (particle.z / 1000);
      const alpha = 0.8 - (particle.z / 2000);

      ctx.beginPath();
      const radius = Math.max(0.1, particle.size * scale);
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${(this.hueOffset + particle.angle * 30) % 360}, 
                       ${70 + high * 0.2}%, 
                       ${luminance}%, 
                       ${alpha})`;
      ctx.fill();
    });
  }

  drawCentralGlow(ctx, high) {
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 200);
    gradient.addColorStop(0, `hsla(${this.hueOffset}, 80%, 60%, 0.4)`);
    gradient.addColorStop(1, `hsla(${(this.hueOffset + 180) % 360}, 80%, 30%, 0)`);
    
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, 200 + high * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  drawStarField(ctx, canvas, high) {
    ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + high/255 * 0.3})`;
    
    for(let i = 0; i < 100; i++) {
      if(Math.random() > 0.98) {
        const size = 1 + Math.random() * 2;
        ctx.beginPath();
        ctx.arc(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          size * (0.5 + high/255),
          0, Math.PI * 2
        );
        ctx.fill();
      }
    }
  }

  lerp(a, b, t) {
    return a + (b - a) * t;
  }
}
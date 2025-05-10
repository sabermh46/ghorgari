// scripts/fixed-background.js

let bgHue = 200;
let bgParticles = [];
const PARTICLE_COUNT = 200;

export function initParticles() {
    bgParticles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        bgParticles.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.5 + 0.1
        });
    }
}

export function drawBackground({ ctx, canvas, dataArray, showBackground }) {
    if (!showBackground) return;

    bgHue = (bgHue + 0.1) % 360;

    // draw gradient
    const gradient = ctx.createRadialGradient(
        canvas.width/2, canvas.height/2, 50,
        canvas.width/2, canvas.height/2, Math.max(canvas.width, canvas.height)
    );
    gradient.addColorStop(0, `hsla(${bgHue}, 80%, 10%, 1)`);
    gradient.addColorStop(1, `hsla(${(bgHue + 180)%360}, 80%, 5%, 1)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // slice may be empty → give reduce an initial value of 0 :contentReference[oaicite:2]{index=2}
    const slice = dataArray ? dataArray.slice(100, 255) : [];
    const sum = slice.reduce((acc, v) => acc + v, 0);
    const highFreq = slice.length ? (sum / slice.length) : 0;
    const speedMultiplier = 1 + (highFreq / 255) * 2;

    const centerX = canvas.width/2;
    const centerY = canvas.height/2;
    const warpStrength = 0.0002 * speedMultiplier;
    const rotationSpeed = 0.001 * speedMultiplier;
    const maxDepth = 3000;

    ctx.save();
    bgParticles.forEach(particle => {
        if (!particle.z) {
            particle.z = Math.random() * maxDepth;
            particle.angle = Math.random() * Math.PI * 2;
            particle.speed = 0.2 + Math.random() * 1;
            particle.size = 0.5 + Math.random() * 2;
        }

        particle.z -= particle.speed * speedMultiplier * 30;
        particle.angle += rotationSpeed + (warpStrength * (maxDepth - particle.z) / maxDepth);

        if (particle.z < 1) {
            particle.z = maxDepth;
            particle.angle = Math.random() * Math.PI * 2;
            particle.speed = 0.1 + Math.random() * 0.1;
        }

        const depthFactor = maxDepth / particle.z;
        const x = centerX + Math.cos(particle.angle) * depthFactor * 80;
        const y = centerY + Math.sin(particle.angle) * depthFactor * 80;
        const size = particle.size * (0.3 + depthFactor * 0.7);

        const hueShift = (particle.z / maxDepth) * 120;
        const opacity = 0.6 - (particle.z / maxDepth) * 0.4;

        ctx.fillStyle = `hsla(${(bgHue + hueShift)%360}, 70%, 75%, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI*2);
        ctx.fill();

        if (depthFactor > 2 && Math.random() > 0.7) {
            ctx.strokeStyle = `hsla(${(bgHue + hueShift)%360}, 60%, 80%, ${opacity * 0.3})`;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(
                x - Math.cos(particle.angle) * 15 * depthFactor,
                y - Math.sin(particle.angle) * 15 * depthFactor
            );
            ctx.lineWidth = size * 0.3;
            ctx.stroke();
        }
    });
    ctx.restore();
}

// scripts/background2.js

let bg2Stars = [];
let bg2Planets = [];
const STAR_COUNT = 100;
const PLANET_COUNT = 20;

export function initBackground2(canvas) {
  bg2Stars = [];
  bg2Planets = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    bg2Stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5 + 0.5,
      speed: Math.random() * 0.05 + 0.01,
      hueOffset: Math.random() * 360
    });
  }
  for (let i = 0; i < PLANET_COUNT; i++) {
    bg2Planets.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: 10 + Math.random() * 20,
      speed: Math.random() * 0.02 + 0.005,
      hueOffset: Math.random() * 360
    });
  }
}

export function drawBackground2({ ctx, canvas, dataArray }) {
    console.log('drawn bg 2');
    
  // Always draw; if dataArray is too short, treat it as zeros
  const arr = (dataArray && dataArray.length >= 160)
    ? dataArray
    : new Array(160).fill(0);

  // safe slice + reduce with initialValue :contentReference[oaicite:2]{index=2}
  const midSlice = arr.slice(80, 160);
  const sum = midSlice.reduce((acc, v) => acc + v, 0);
  const avg = sum / midSlice.length;
  const baseHue = (avg / 255) * 360;

  ctx.save();
  // translucent fill to give motion‑trail effect
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // draw distant stars
  bg2Stars.forEach(star => {
    star.x -= star.speed;
    if (star.x < 0) star.x = canvas.width;
    const hue = (baseHue + star.hueOffset) % 360;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${hue},60%,85%,0.6)`;
    ctx.shadowColor = `hsla(${(hue+30)%360},60%,50%,0.3)`;
    ctx.shadowBlur = 4;  // non‑zero to see glow :contentReference[oaicite:3]{index=3}
    ctx.fill();
  });

  // draw slow‑moving planets
  bg2Planets.forEach(planet => {
    planet.x -= planet.speed;
    if (planet.x + planet.radius < 0) 
      planet.x = canvas.width + planet.radius;
    const hue = (baseHue + planet.hueOffset) % 360;
    ctx.beginPath();
    ctx.arc(planet.x, planet.y, planet.radius/2, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${hue},50%,30%,0.7)`;
    ctx.shadowColor = `hsla(${(hue+60)%360},70%,70%,0.4)`;
    ctx.shadowBlur = 15;
    ctx.fill();
  });

  ctx.restore();
}

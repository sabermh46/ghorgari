// scripts/main.js
import { AudioManager } from './audio-manager.js';
import { drawBackground2, initBackground2 } from './background2.js';
import { drawBackground, initParticles } from './fixed-background.js';
import { VisualizerManager } from './visualizer-manager.js';
import BlockVisualizer from './visualizers/block-visualizer.js';
import HypnoticVortex from './visualizers/hypnotic-vortex.js';
import SimpleParticlesVisualizer from './visualizers/simple-particles.js'

const canvas = document.getElementById('visualizer-canvas');
const ctx = canvas.getContext('2d');

let showBackground = true;
let showVisualizer = true;
let currentViz = 'vortex';
const playPauseBtn = document.querySelector('.play-pause');
const progressBarEl = document.querySelector('.progress');
const progressHandleEl = document.querySelector('.progress-handle');
const currentTimeEl = document.querySelector('.current-time');
const durationEl = document.querySelector('.duration');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
    initParticles();       // From fixed-background
  initBackground2(canvas); // New
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

AudioManager.init();
initParticles();


document.getElementById('audio-file').addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) {
    AudioManager.loadFile(file);
    document.querySelector('.playback-controls').classList.remove('hidden');
    document.querySelector('.playback-controls').classList.add('visible');
    // once metadata is loaded, show duration
    AudioManager.onEnded(() => {
      playPauseBtn.textContent = '▶';
    });
    // update duration when available
    setTimeout(() => {
      durationEl.textContent = formatTime(AudioManager.getDuration());
    }, 200);
  }
});

playPauseBtn.addEventListener('click', () => {
  AudioManager.togglePlayPause();
  // toggle icon :contentReference[oaicite:3]{index=3}
  playPauseBtn.textContent = AudioManager.isPlaying() ? '❚❚' : '▶';
});

document.querySelector('.seek-back').addEventListener('click', () => {
  AudioManager.seek(AudioManager.getCurrentTime() - 5);
});
document.querySelector('.seek-forward').addEventListener('click', () => {
  AudioManager.seek(AudioManager.getCurrentTime() + 5);
});

document.getElementById('toggle-bg').addEventListener('click', () => {
  showBackground = !showBackground;
});

document.getElementById('toggle-vis').addEventListener('click', () => {
  VisualizerManager.setActive('vortex');
  // toggle between block and vortex :contentReference[oaicite:15]{index=15}
  currentViz = (currentViz === 'block') ? 'vortex' : 'block';
  VisualizerManager.setActive(currentViz);
 });

// helper to format mm:ss
function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// update progress bar on click :contentReference[oaicite:4]{index=4}
document.querySelector('.progress-bar').addEventListener('click', e => {
  const rect = e.currentTarget.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  const newTime = pct * AudioManager.getDuration();
  AudioManager.seek(newTime);
});


const particlesBg = new SimpleParticlesVisualizer();
const visualizer = new HypnoticVortex();

// Configure position
particlesBg.centerX = 20;  // 50% of width
particlesBg.centerY = 30;  // 30% of height
particlesBg.boostFactor = 0.3;

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  drawBackground({
    ctx,
    canvas,
    dataArray: AudioManager.getFrequencyData(),
    showBackground
  });
  drawBackground2({
    ctx,
    canvas,
    dataArray: AudioManager.getFrequencyData()
  });

  particlesBg.draw(ctx, canvas);
  visualizer.draw(ctx, canvas);

  // update progress line & handle each frame
  const ct = AudioManager.getCurrentTime();
  const dur = AudioManager.getDuration();
  if (dur > 0) {
    const pct = (ct / dur) * 100;
    progressBarEl.style.width = pct + '%';
    // position handle at right edge of filled bar
    progressHandleEl.style.left = `calc(${pct}% - ${progressHandleEl.offsetWidth/2}px)`;
    currentTimeEl.textContent = formatTime(ct);
  }

  requestAnimationFrame(render);
}
render();

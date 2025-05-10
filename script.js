

document.addEventListener('DOMContentLoaded', () => {
    // Canvas setup
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const visualizerSettings = {
        currentType: 'hypno',//'Swirl',//'concentric', //'spiral', // 'blocks', 'flower', or 
        circleRadius: Math.min(canvas.width, canvas.height) * 0.3,
        barThickness: 2,
        rotationAngle: 0.01,
        fftSize: 256,
        spiralTurns: 3,
        flowerPetals: 8,
        pointCount: 500,
        maxRadius: 0,
        rotationSpeed: 0.005,
        rotationAngle: 0,
        visualizerScale: 1.5,
        blockCount: 36,
        blockWidth: 15,
        blockSpacing: 0.8,
        blockAnimationDelay: 60, // ms between bar updates
        maxBlockHeight: 300,      // increased from previous 150
        currentBars: [],
        randomness: 0, // 0-1 amount of random variation
        activeBarProbability: 0.3,
        vortexSpeed: 0.2,
        spiralDensity: 18,
        hueShiftSpeed: 0.3,
        maxDepth: 60,
        zoomFactor: 0.96,
        frequencyThresholds: {
            low: { min: 0, max: 85, multiplier: 0.2 },
            mid: { min: 86, max: 200, multiplier: 3.5 },
            high: { min: 200, max: 255, multiplier: 7.5 }
        },
        middleLayer: {
            rings: 8,
            ringSpacing: 50,
            maxPulse: 40
        },
        rotation: {
        baseSpeed: 0.0015,
        boostMultiplier: 2.2,
        currentSpeed: 0,
        currentAngle: 0,
        boostLevel: 0,
        boostDecay: 0.88,
        layerRotations: [], // Stores smoothed rotations per depth
        portalRotation: 0
    }
    };
    const blockCountInput = document.getElementById('blockCount');
    const maxHeightInput = document.getElementById('maxHeight');

    blockCountInput.addEventListener('input', (e) => {
        visualizerSettings.blockCount = parseInt(e.target.value);
    });

    maxHeightInput.addEventListener('input', (e) => {
        visualizerSettings.maxBlockHeight = parseInt(e.target.value);
    });

    const animSpeedInput = document.getElementById('animSpeed');
    const heightMultInput = document.getElementById('heightMult');

    animSpeedInput.addEventListener('input', (e) => {
        visualizerSettings.blockAnimationDelay = parseInt(e.target.value);
    });

    heightMultInput.addEventListener('input', (e) => {
        visualizerSettings.maxBlockHeight = 150 * parseFloat(e.target.value);
    });

    const randomnessInput = document.getElementById('randomness');
    const activityInput = document.getElementById('activity');

    randomnessInput.addEventListener('input', (e) => {
        visualizerSettings.randomness = parseFloat(e.target.value);
    });

    activityInput.addEventListener('input', (e) => {
        visualizerSettings.activeBarProbability = parseFloat(e.target.value);
    });
        
    // Add control elements
    const spiralTurnsInput = document.getElementById('spiralTurns');
    const rotationSpeedInput = document.getElementById('rotationSpeed');
    const hueSpeedInput = document.getElementById('hueSpeed');
    const toggleVisualizerBtn = document.getElementById('toggleVisualizer');

    // Control event listeners
    spiralTurnsInput.addEventListener('input', (e) => {
        visualizerSettings.spiralTurns = parseFloat(e.target.value);
    });

    rotationSpeedInput.addEventListener('input', (e) => {
        visualizerSettings.rotationSpeed = parseFloat(e.target.value);
    });

    hueSpeedInput.addEventListener('input', (e) => {
        visualizerSettings.hueShiftSpeed = parseFloat(e.target.value);
    });

    toggleVisualizerBtn.addEventListener('click', () => {
        visualizerSettings.currentType = visualizerSettings.currentType === 'spiral' ? 'flower' : 'spiral';
        toggleVisualizerBtn.textContent = visualizerSettings.currentType === 'spiral' 
            ? 'Switch to Flower Visualizer' 
            : 'Switch to Spiral Visualizer';
    });
    // Set canvas to full window size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        visualizerSettings.circleRadius = Math.min(canvas.width, canvas.height) * 0.3;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Audio context setup
    let audioContext;
    let analyser;
    let dataArray;
    let source;
    let audioBuffer;
    let isPlaying = false;
    let startTime = 0;
    let pausedTime = 0;
    let animationId;
    
    // UI elements
    const playPauseBtn = document.getElementById('play-pause');
    const seekBackBtn = document.getElementById('seek-back');
    const seekForwardBtn = document.getElementById('seek-forward');
    const timeline = document.getElementById('timeline');
    const progress = document.getElementById('progress');
    const currentTimeDisplay = document.getElementById('current-time');
    const totalTimeDisplay = document.getElementById('total-time');
    const audioFileInput = document.getElementById('audio-file');
    const toggleBgBtn = document.getElementById('toggle-bg');
    const toggleVisBtn = document.getElementById('toggle-vis');
    
    // Layer visibility
    let showBackground = true;
    let showVisualizer = true;
    
    // Visualizer settings
    
    visualizerSettings.maxRadius = visualizerSettings.circleRadius * 1.5;
    
    // Background animation
    
    
    function drawVisualizer() {
        if (!showVisualizer || !analyser || !dataArray) return;
    
        analyser.getByteFrequencyData(dataArray);
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        if (visualizerSettings.currentType === 'spiral') {
            drawSpiralVisualizer();
        } else if (visualizerSettings.currentType === 'flower') {
            drawFlowerVisualizer();
        }else if (visualizerSettings.currentType === 'concentric') {
            drawConcentricArcsVisualizer();
        }
        else if (visualizerSettings.currentType === 'Swirl') {
            drawSwirlingRadialWaveVisualizer();
        } else if (visualizerSettings.currentType === 'hypno') {
            drawHypnoticVortex();
        }
        else if (visualizerSettings.currentType === 'block') {
            drawBlockVisualizer();
        } else {
            drawRadialWaveform();
        }
    }

    toggleVisualizerBtn.addEventListener('click', () => {
        const types = ['spiral', 'flower', 'blocks'];
        const currentIndex = types.indexOf(visualizerSettings.currentType);
        visualizerSettings.currentType = types[(currentIndex + 1) % types.length];
        toggleVisualizerBtn.textContent = `Switch to ${types[(currentIndex + 2) % 3]} Visualizer`;
    });

// function drawHypnoticVortex() {
//     const { 
//         vortexSpeed, 
//         spiralDensity, 
//         hueShiftSpeed, 
//         maxDepth,
//         zoomFactor,
//         rotation
//     } = visualizerSettings;
    
//     analyser.getByteFrequencyData(dataArray);
//     const centerX = canvas.width / 2;
//     const centerY = canvas.height / 2;
//     const time = Date.now() * 0.001;

//     const highFreq = dataArray 
//         ? dataArray.slice(200, 255).reduce((a, b) => a + b) / 55 
//         : 0;
//     const boostThreshold = 0.65;
    
//     // Smoother boost transitions
//     if (highFreq > boostThreshold) {
//         rotation.boostLevel = Math.min(rotation.boostLevel + 0.15, 1); // Reduced boost increment
//     } else {
//         rotation.boostLevel *= rotation.boostDecay;
//     }

//     // Interpolated rotation speed
//     const targetSpeed = rotation.baseSpeed + 
//                        (rotation.baseSpeed * rotation.boostMultiplier * rotation.boostLevel);
//     const currentSpeed = lerp(rotation.currentSpeed, targetSpeed, 0.1); // Linear interpolation
//     rotation.currentSpeed = currentSpeed;   
//     rotation.currentAngle += currentSpeed;

//     // Update visual properties
//     bgHue = (bgHue + hueShiftSpeed) % 360;
//     const averageFreq = dataArray.reduce((a, b) => a + b) / dataArray.length;
    
//     ctx.save();
//     ctx.translate(centerX, centerY);
    
//     // Smooth main rotation with eased transitions
//     ctx.rotate(-rotation.currentAngle);

//     // Infinite spiral generator with smoothed rotations
//     function drawSpiralTunnel(radius, depth, rotationAccumulator) {
//         if(depth > maxDepth) return;
        
//         const angleStep = (Math.PI * 2) / spiralDensity;
//         const freqIndex = Math.floor((depth / maxDepth) * dataArray.length);
//         const energy = dataArray[freqIndex] / 255;
        
//         ctx.save();
        
//         // Smoothed layer rotation
//         const targetLayerRotation = rotationAccumulator + 
//                                   (time * 0.003 * depth) + // Reduced time multiplier
//                                   (energy * 0.08); // Reduced energy impact
//         const layerRotation = lerp(rotation.layerRotations[depth] || 0, targetLayerRotation, 0.1);
//         rotation.layerRotations[depth] = layerRotation;
//         ctx.rotate(layerRotation);

//         // Animated particle effects
//         const pulse = smoothStep(time * 1.5 + depth) * 6 * energy * (1 - depth/maxDepth);
//         const lineWidth = 1.5 + energy * 8 * (1 - depth/maxDepth);
        
//         // Color dynamics
//         const hue = (bgHue + depth * 12 + time * 30) % 360; // Reduced hue shift
//         const saturation = 75 + Math.sin(time * 0.6 + depth) * 10; // Reduced saturation variation
//         const lightness = 40 + energy * 35;
//         const opacity = 0.8 - (depth/maxDepth) * 0.6;

//         // Draw spiral elements with position interpolation
//         for(let i = 0; i < spiralDensity; i++) {
//             const angle = angleStep * i;
//             const prevAngle = angleStep * (i - 1);
            
//             // Interpolated positions
//             const currentX = lerp(
//                 Math.cos(prevAngle) * (radius + pulse),
//                 Math.cos(angle) * (radius + pulse),
//                 0.1
//             );
            
//             const currentY = lerp(
//                 Math.sin(prevAngle) * (radius + pulse),
//                 Math.sin(angle) * (radius + pulse),
//                 0.1
//             );

//             // Core particle
//             ctx.beginPath();
//             ctx.arc(currentX, currentY, lineWidth, 0, Math.PI * 2);
//             ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`;
//             ctx.fill();

//             // Subtle trail effect
//             ctx.beginPath();
//             ctx.arc(currentX, currentY, lineWidth * 1.2, 0, Math.PI * 2);
//             ctx.strokeStyle = `hsla(${(hue + 20) % 360}, ${saturation}%, 80%, ${opacity * 0.3})`;
//             ctx.lineWidth = lineWidth * 0.2;
//             ctx.stroke();
//         }

//         // Recursive call with dampened progression
//         drawSpiralTunnel(
//             radius * zoomFactor, 
//             depth + 1,
//             rotationAccumulator * 1.03 + (energy * 0.1) // Reduced multipliers
//         );
        
//         ctx.restore();
//     }

//     // Initial spiral parameters
//     drawSpiralTunnel(
//         Math.min(canvas.width, canvas.height) * 0.45, 
//         0,
//         rotation.currentAngle + averageFreq * 0.0003 // Reduced frequency impact
//     );

//     // Smoothed central portal rotation
//     const targetPortalRotation = time * vortexSpeed * 1.5;
//     const portalRotation = lerp(rotation.portalRotation || 0, targetPortalRotation, 0.1);
//     rotation.portalRotation = portalRotation;
    
//     ctx.save();
//     ctx.rotate(portalRotation);
    
//     const portalSize = 15 + averageFreq * 0.4;
//     const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, portalSize);
//     gradient.addColorStop(0, `hsla(${bgHue}, 95%, 75%, 0.9)`);
//     gradient.addColorStop(1, `hsla(${(bgHue + 180) % 360}, 95%, 60%, 0)`);
    
//     ctx.beginPath();
//     ctx.arc(0, 0, portalSize, 0, Math.PI * 2);
//     ctx.fillStyle = gradient;
//     ctx.fill();
//     ctx.restore();

//     ctx.restore();

//     // Linear interpolation helper
//     function lerp(a, b, t) {
//         return a * (1 - t) + b * t;
//     }

//     // Smooth stepping function
//     function smoothStep(t) {
//         return t*t*(3 - 2*t);
//     }
// }


function drawHypnoticVortex() {
    const { 
        vortexSpeed, 
        spiralDensity, 
        hueShiftSpeed, 
        maxDepth,
        zoomFactor,
        rotation
    } = visualizerSettings;
    
    analyser.getByteFrequencyData(dataArray);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const time = Date.now() * 0.001;

    const highFreq = dataArray 
        ? dataArray.slice(200, 255).reduce((a, b) => a + b) / 55 
        : 0;
    const boostThreshold = 0.65; // 65% of max high freq
    
    // Update boost level
    if (highFreq > boostThreshold) {
        rotation.boostLevel = Math.min(rotation.boostLevel + 0.25, 1);
    } else {
        rotation.boostLevel *= rotation.boostDecay;
    }

    // Calculate current rotation speed
    const currentSpeed = rotation.baseSpeed + 
                        (rotation.baseSpeed * rotation.boostMultiplier * rotation.boostLevel);
    
    // Update rotation angle
    rotation.currentAngle += currentSpeed;


    // Update visual properties
    bgHue = (bgHue + hueShiftSpeed) % 360;
    const averageFreq = dataArray.reduce((a, b) => a + b) / dataArray.length;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    
    // Base rotation with dual-axis control
    const baseRotation = time * vortexSpeed;
    ctx.rotate(-rotation.currentAngle);

    // Infinite spiral generator with rotational layering
    function drawSpiralTunnel(radius, depth, rotationAccumulator) {
        if(depth > maxDepth) return;
        
        const angleStep = (Math.PI * 2) / spiralDensity;
        const freqIndex = Math.floor((depth / maxDepth) * dataArray.length);
        const energy = dataArray[freqIndex] / 255;
        
        // Layer transformation matrix
        ctx.save();
        
        // Dual rotation components
        const layerRotation = rotationAccumulator + 
                             (time * 0.005 * depth) + 
                             (energy * 0.1);
        ctx.rotate(layerRotation);

        // Dynamic particle effects
        const pulse = Math.sin(time * 2 + depth) * 8 * energy;
        const lineWidth = 2 + energy * 10 * (1 - depth/maxDepth);
        
        // Color dynamics
        const hue = (bgHue + depth * 15 + time * 50) % 360;
        const saturation = 80 + Math.sin(time * 0.8 + depth) * 15;
        const lightness = 35 + energy * 40;
        const opacity = 0.7 - (depth/maxDepth) * 0.7;

        // Draw spiral elements
        for(let i = 0; i < spiralDensity; i++) {
            const angle = angleStep * i;
            const x = Math.cos(angle) * (radius + pulse);
            const y = Math.sin(angle) * (radius + pulse);
            
            // Core particle
            ctx.beginPath();
            ctx.arc(x, y, lineWidth, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`;
            ctx.fill();

            // Glowing trail effect
            ctx.beginPath();
            ctx.arc(x, y, lineWidth * 1.5, 0, Math.PI * 2);
            ctx.strokeStyle = `hsla(${(hue + 30) % 360}, ${saturation}%, 75%, ${opacity * 0.4})`;
            ctx.lineWidth = lineWidth * 0.3;
            ctx.stroke();
        }

        // Recursive call with rotational progression
        drawSpiralTunnel(
            radius * zoomFactor, 
            depth + 1,
            rotationAccumulator * 1.05 + (energy * 0.2)
        );
        
        ctx.restore();
    }

    // Initial spiral parameters
    drawSpiralTunnel(
        Math.min(canvas.width, canvas.height) * 0.5, 
        0,
        baseRotation + averageFreq * 0.0005
    );

    // Central singularity effect
    const portalRotation = time * vortexSpeed * 2;
    ctx.save();
    ctx.rotate(portalRotation);
    
    const portalSize = 20 + averageFreq * 0.5;
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, portalSize);
    gradient.addColorStop(0, `hsla(${bgHue}, 100%, 80%, 0.95)`);
    gradient.addColorStop(1, `hsla(${(bgHue + 180) % 360}, 100%, 60%, 0)`);
    
    ctx.beginPath();
    ctx.arc(0, 0, portalSize, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.restore();

    ctx.restore();
}

function drawBlockVisualizer() {
    const {
        circleRadius,
        blockCount,
        blockWidth,
        maxBlockHeight,
        blockSpacing,
        rotationSpeed, // Now controls fixed rotation
        fixedAngle // Added to visualizerSettings
    } = visualizerSettings;

    analyser.getByteFrequencyData(dataArray);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Update fixed rotation angle
    visualizerSettings.fixedAngle = (fixedAngle + rotationSpeed) % (Math.PI * 2);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(fixedAngle); // Apply fixed rotation

    const angleStep = (Math.PI * 2) / blockCount;
    const frequencyStep = Math.floor(dataArray.length / blockCount);

    // Draw all blocks
    for (let i = 0; i < blockCount; i++) {
        const freqIndex = i * frequencyStep;
        const frequency = dataArray[freqIndex] || 0;
        const height = (frequency / 255) * maxBlockHeight;
        
        const angle = angleStep * i;
        const x = Math.cos(angle) * circleRadius;
        const y = Math.sin(angle) * circleRadius;
        const hue = (bgHue + i * 15) % 360;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + Math.PI/2); // Maintain block orientation
        
        // Draw block with fixed rotation base
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.9)`;
        ctx.fillRect(
            -blockWidth/2 * blockSpacing,
            -height/2,
            blockWidth * blockSpacing,
            height
        );

        ctx.restore();
    }

    ctx.restore();
}



    
    
    
    
// Add new middle layer drawing function
function drawMiddleLayer() {
    if (!showBackground) return;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const averageFreq = dataArray ? dataArray.reduce((a, b) => a + b) / dataArray.length : 0;
    const pulse = (averageFreq / 255) * visualizerSettings.middleLayer.maxPulse;

    // Draw pulsating rings
    ctx.save();
    ctx.translate(centerX, centerY);
    
    for (let i = 0; i < visualizerSettings.middleLayer.rings; i++) {
        const radius = i * visualizerSettings.middleLayer.ringSpacing + pulse;
        const opacity = 0.2 - (i * 0.02);
        
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${bgHue}, 70%, 60%, ${opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    ctx.restore();
}


    // Add new draw function
    // Modify the drawBlockVisualizer function
    function drawRadialWaveform() {
        const { rotationAngle, hueShiftSpeed } = visualizerSettings;
        analyser.getByteFrequencyData(dataArray);
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = visualizerSettings.circleRadius;
    
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotationAngle);
        
        const steps = dataArray.length;
        ctx.beginPath();
    
        for (let i = 0; i < steps; i++) {
            const angle = (Math.PI * 2 / steps) * i;
            const value = dataArray[i] / 255;
            const radial = radius + value * 75;
    
            const x = Math.cos(angle) * radial;
            const y = Math.sin(angle) * radial;
    
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = `hsla(${(bgHue + 120) % 360}, 80%, 60%, 0.8)`;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }
    

    


    function drawSwirlingRadialWaveVisualizer() {
        const { barThickness, hueShiftSpeed, rotationAngle, fftSize } = visualizerSettings;
        analyser.getByteFrequencyData(dataArray);
    
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
    
        const lines = dataArray.length;
        const radius = Math.min(canvas.width, canvas.height) / 4;
    
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotationAngle);
    
        for (let i = 0; i < lines; i++) {
            const value = dataArray[i];
            const angle = (i / lines) * Math.PI * 2;
    
            // Swirling offset with sine wave
            const swirl = Math.sin((performance.now() / 1000) + i * 0.1) * 30;
            const dynamicRadius = radius + swirl + (value / 2);
    
            const x = Math.cos(angle) * dynamicRadius;
            const y = Math.sin(angle) * dynamicRadius;
    
            const hue = (bgHue + i * 2) % 360;
    
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(x, y);
            ctx.strokeStyle = `hsl(${hue}, 100%, 60%)`;
            ctx.lineWidth = barThickness;
            ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;
            ctx.shadowBlur = 8;
            ctx.stroke();
        }
    
        ctx.restore();
    }
    


    // Draw spiral visualizer
    function drawSpiralVisualizer() {
        if (!showVisualizer || !analyser || !dataArray) return;
        
        analyser.getByteFrequencyData(dataArray);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const { 
            circleRadius,
            spiralTurns,
            pointCount,
            maxRadius,
            rotationSpeed,
            hueShiftSpeed
        } = visualizerSettings;
        
        // Update rotation and hue
        visualizerSettings.rotationAngle += rotationSpeed;
        bgHue = (bgHue + hueShiftSpeed) % 360;
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(visualizerSettings.rotationAngle);
        
        // Draw spiral
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < pointCount; i++) {
            const progress = i / pointCount;
            const angle = spiralTurns * 2 * Math.PI * progress;
            const radius = circleRadius * progress;
            
            // Get frequency data
            const dataIndex = Math.floor(progress * (dataArray.length - 1));
            const value = dataArray[dataIndex] / 255;
            const height = value * 50;
            
            const x = Math.cos(angle) * (radius + height);
            const y = Math.sin(angle) * (radius + height);
            
            // Color based on position and frequency
            const hue = (bgHue + progress * 120) % 360;
            const saturation = 80;
            const lightness = 30 + value * 40;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
                
                // Draw glow effect
                ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${0.2 + value * 0.8})`;
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x, y);
            }
        }
        
        ctx.restore();
    }
    function drawFlowerVisualizer() {
        const { 
            circleRadius,
            flowerPetals,
            rotationSpeed,
            hueShiftSpeed,
            visualizerScale
        } = visualizerSettings;

        // Update rotation and hue
        visualizerSettings.rotationAngle += rotationSpeed;
        bgHue = (bgHue + hueShiftSpeed) % 360;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(visualizerSettings.rotationAngle);

        // Draw flower pattern
        ctx.lineWidth = 2;
        const petalBaseSize = circleRadius * 0.5;
        
        for (let i = 0; i < flowerPetals; i++) {
            const angle = (Math.PI * 2 / flowerPetals) * i;
            const frequency = dataArray[Math.floor((i / flowerPetals) * dataArray.length)];
            const scale = 1 + (frequency / 255) * visualizerScale;

            // Calculate petal position
            const x = Math.cos(angle) * circleRadius;
            const y = Math.sin(angle) * circleRadius;

            // Draw petal
            ctx.fillStyle = `hsla(${(bgHue + i * 40) % 360}, 80%, 60%, 0.8)`;
            ctx.beginPath();
            ctx.ellipse(
                x, y,
                petalBaseSize * scale, 
                petalBaseSize * (0.3 + scale * 0.2),
                angle, 
                0, 
                Math.PI * 2
            );
            ctx.fill();
        }

        ctx.restore();
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        drawBackground();
        drawMiddleLayer();
        drawVisualizer();
        updateTimeDisplay();
        
        animationId = requestAnimationFrame(animate);
    }
    animate();
    
    // Initialize audio
    function initAudio(buffer) {
        // Stop any current playback
        if (source) {
            source.stop();
            source.disconnect();
        }
        
        audioBuffer = buffer;
        
        // Create new audio context if needed
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        
        source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        // Update UI
        totalTimeDisplay.textContent = formatTime(buffer.duration);
        playPauseBtn.textContent = '▶';
        isPlaying = false;
        pausedTime = 0;
        
        // Update file label
        const label = audioFileInput.querySelector('label');
        label.textContent = '✔ ' + audioFileInput.files[0].name.substring(0, 20);
        label.style.color = '#4CAF50';
    }
    
    // Play/pause audio
    function togglePlayback() {
        if (!audioBuffer) return;
        
        if (isPlaying) {
            // Pause
            source.stop();
            pausedTime += audioContext.currentTime - startTime;
            isPlaying = false;
            playPauseBtn.textContent = '▶';
        } else {
            // Play
            source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            
            startTime = audioContext.currentTime;
            source.start(0, pausedTime % audioBuffer.duration);
            isPlaying = true;
            playPauseBtn.textContent = '❚❚';
            
            source.onended = () => {
                isPlaying = false;
                pausedTime = 0;
                playPauseBtn.textContent = '▶';
                updateTimeDisplay();
            };
        }
    }
    
    // Seek to specific time
    function seekTo(time) {
        if (!audioBuffer) return;
        
        // Ensure time is within bounds
        time = Math.max(0, Math.min(audioBuffer.duration, time));
        pausedTime = time;
        
        if (isPlaying) {
            source.stop();
            source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            source.start(0, pausedTime % audioBuffer.duration);
            startTime = audioContext.currentTime;
            
            source.onended = () => {
                isPlaying = false;
                pausedTime = 0;
                playPauseBtn.textContent = '▶';
                updateTimeDisplay();
            };
        }
        
        updateTimeDisplay();
    }
    
    // Seek in timeline
    function handleTimelineClick(e) {
        if (!audioBuffer) return;
        
        const rect = timeline.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        seekTo(pos * audioBuffer.duration);
    }
    
    // Event listeners
    playPauseBtn.addEventListener('click', togglePlayback);
    
    seekBackBtn.addEventListener('click', () => {
        seekTo(getCurrentTime() - 5);
    });
    
    seekForwardBtn.addEventListener('click', () => {
        seekTo(getCurrentTime() + 5);
    });
    
    timeline.addEventListener('click', handleTimelineClick);
    
    toggleBgBtn.addEventListener('click', () => {
        showBackground = !showBackground;
        toggleBgBtn.style.background = showBackground 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(255, 0, 0, 0.3)';
    });
    
    toggleVisBtn.addEventListener('click', () => {
        showVisualizer = !showVisualizer;
        toggleVisBtn.style.background = showVisualizer 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(255, 0, 0, 0.3)';
    });
    
    audioFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            // Try both Promise and callback APIs for maximum compatibility
            if (audioContext.decodeAudioData.length === 1) {
                audioContext.decodeAudioData(e.target.result)
                    .then(initAudio)
                    .catch(error => {
                        console.error('Error decoding audio:', error);
                    });
            } else {
                audioContext.decodeAudioData(e.target.result, initAudio, (error) => {
                    console.error('Error decoding audio:', error);
                });
            }
        };
        reader.onerror = (error) => {
            console.error('FileReader error:', error);
        };
        reader.readAsArrayBuffer(file);
    });
    
    // Handle drag and drop
    document.addEventListener('dragover', (e) => {
        e.preventDefault();
    });
    
    document.addEventListener('drop', (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.match('audio.*')) {
            audioFileInput.files = e.dataTransfer.files;
            const event = new Event('change');
            audioFileInput.dispatchEvent(event);
        }
    });
});
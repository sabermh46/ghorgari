function drawConcentricArcsVisualizer() {
    
        const { hueShiftSpeed, rotationSpeed, barThickness, circleRadius } = visualizerSettings;
        analyser.getByteFrequencyData(dataArray);
    
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const now = Date.now();
    
        // Update visual properties
        visualizerSettings.rotationAngle += rotationSpeed;
        bgHue = (bgHue + hueShiftSpeed) % 360;
    
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(visualizerSettings.rotationAngle);
    
        const arcBands = Math.floor(dataArray.length / 2); // Use more frequency bands
        const baseRadius = circleRadius * 0.8;
        const maxArcLength = Math.PI * 1.5; // Maximum arc length in radians
    
        // Create smooth arc transitions
        dataArray.forEach((value, i) => {
            if(i >= arcBands) return;
    
            const frequency = value / 255;
            const radius = baseRadius + (i * (barThickness * 1.5));
            const angleOffset = (Math.PI * 2) * (i / arcBands); // Distribute arcs evenly
            
            // Animated arc properties
            const arcLength = 0.2 + (frequency * maxArcLength);
            const pulse = Math.sin(now * 0.002 + i) * 2;
            const lineWidth = barThickness + (frequency * 5);
            
            // Color dynamics
            const hue = (bgHue + i * 8) % 360;
            const saturation = 80 + (frequency * 20);
            const lightness = 50 + (frequency * 30);
            const opacity = 0.7 + (frequency * 0.3);
    
            ctx.beginPath();
            ctx.arc(0, 0, radius + pulse, 
                   angleOffset - (arcLength/2), 
                   angleOffset + (arcLength/2));
            
            // Style with gradients
            const gradient = ctx.createLinearGradient(
                Math.cos(angleOffset) * radius * 2,
                Math.sin(angleOffset) * radius * 2,
                -Math.cos(angleOffset) * radius * 2,
                -Math.sin(angleOffset) * radius * 2
            );
            
            gradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`);
            gradient.addColorStop(1, `hsla(${(hue + 60) % 360}, ${saturation}%, ${lightness}%, ${opacity * 0.5})`);
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = lineWidth;
            ctx.lineCap = 'round';
            
            // Add dynamic glow
            ctx.shadowColor = `hsla(${hue}, 100%, 70%, ${opacity * 0.5})`;
            ctx.shadowBlur = 15 + (frequency * 25);
            ctx.stroke();
        });
    
        ctx.restore();
    }
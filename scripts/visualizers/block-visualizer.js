// scripts/visualizers/block-visualizer.js

const BlockVisualizer = {
  init() {
    // nothing to initialize for now
  },

  /**
   * Draw frequency bars
   * @param {CanvasRenderingContext2D} ctx
   * @param {HTMLCanvasElement} canvas
   * @param {Uint8Array} dataArray
   */
  draw(ctx, canvas, dataArray) {
    const bufferLength = dataArray.length;
    const barCount = 64;                       // number of bars :contentReference[oaicite:3]{index=3}
    const barWidth = canvas.width / barCount;  // width per bar :contentReference[oaicite:4]{index=4}
    const scale = canvas.height / 255;         // scale factor for amplitude :contentReference[oaicite:5]{index=5}

    ctx.save();
    ctx.translate(0, canvas.height);           // origin at bottom-left :contentReference[oaicite:6]{index=6}

    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor((i / barCount) * bufferLength);
      const amplitude = dataArray[dataIndex];  // 0–255 :contentReference[oaicite:7]{index=7}
      const barHeight = amplitude * scale;

      // color gradient per bar
      const hue = (i / barCount) * 360;
      ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;  // dynamic coloring :contentReference[oaicite:8]{index=8}

      ctx.fillRect(
        i * barWidth,       // x
        -barHeight,         // y (negative because origin moved) :contentReference[oaicite:9]{index=9}
        barWidth * 0.8,     // width with spacing :contentReference[oaicite:10]{index=10}
        barHeight           // height
      );
    }

    ctx.restore();
  }
};

export default BlockVisualizer;

// scripts/visualizer-manager.js

import BlockVisualizer from "./visualizers/block-visualizer.js";
import hypnoticVortex from "./visualizers/hypnotic-vortex.js";

export const VisualizerManager = (() => {
  const visualizers = new Map();
  let activeKey = null;

  return {
    /** Register a visualizer under a unique key */
    register(key, visualizer) {
      visualizers.set(key, visualizer);
    },

    /** Activate one of the registered visualizers */
    setActive(key) {
      if (!visualizers.has(key)) {
        console.warn(`Visualizer "${key}" not found`);
        return;
      }
      activeKey = key;
      visualizers.get(activeKey).init?.();  // optional init hook
    },

    /** Draw the active visualizer each frame */
    draw({ ctx, canvas, dataArray }) {
      if (!activeKey) return;
      const viz = visualizers.get(activeKey);
      viz.draw(ctx, canvas, dataArray);
    }
  };
})();

VisualizerManager.register('block', BlockVisualizer);
VisualizerManager.register('vortex', hypnoticVortex);
VisualizerManager.setActive('vortex');
// scripts/audio-manager.js

let audioContext;
let audioElement;
let audioSource;
let analyser;
let gainNode;
let dataArray;
let bufferLength;
let playing = false;    // renamed from isPlaying

export const AudioManager = {
  init(onUserGesture) {
    // Defer context creation until user gesture, per autoplay policy 
    const createCtx = () => {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      // create analyser & gain once context exists
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;  // smoother visuals 
      bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);

      gainNode = audioContext.createGain();
      // default unity gain
      gainNode.gain.value = 1;
    };

    // if context already running, create immediately
    if (audioContext && audioContext.state !== 'suspended') {
      createCtx();
    } else {
      // wait for first user gesture
      const handler = () => {
        if (audioContext?.state === 'suspended') {
          audioContext.resume();
        }
        createCtx();
        window.removeEventListener('click', handler);
      };
      window.addEventListener('click', handler, { once: true });
    }
  },

  loadFile(file) {
    if (audioElement) {
      audioElement.pause();
      audioElement.src = '';
    }
    audioElement = new Audio();
    audioElement.src = URL.createObjectURL(file);
    audioElement.crossOrigin = "anonymous";

    audioElement.addEventListener('loadedmetadata', () => {
      // connect graph only once metadata (duration, etc.) is known
      this._setupAudioGraph();
    });

    // UI can listen to this for progress updates 
    audioElement.ontimeupdate = () => {
      if (this.onTimeUpdate) this.onTimeUpdate(audioElement.currentTime);
    };
  },

  getAnalyser() {
    return analyser || null;
    },

  _setupAudioGraph() {
    if (!audioContext) this.init();
    if (audioSource) audioSource.disconnect();

    audioSource = audioContext.createMediaElementSource(audioElement);
    // source → analyser → gain → destination
    audioSource.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(audioContext.destination);
  },

  play() {
    if (!audioElement) return;
    audioContext.resume();
    audioElement.play();
    playing = true;
  },

  pause() {
    if (!audioElement) return;
    audioElement.pause();
    playing = false;
  },

  togglePlayPause() {
    playing ? this.pause() : this.play();
  },

  seek(time) {
    if (audioElement) {
      audioElement.currentTime = Math.max(0, Math.min(audioElement.duration, time));
    }
  },

  getCurrentTime() {
    return audioElement ? audioElement.currentTime : 0;
  },

  getDuration() {
    return audioElement ? audioElement.duration : 0;
  },

  isPlaying() {
    return playing;
  },

  getFrequencyData() {
    if (!analyser || !dataArray) {
      // always return fixed‑length array to avoid empty slice errors 
      return new Uint8Array(bufferLength || 1024);
    }
    analyser.getByteFrequencyData(dataArray);
    return dataArray;
  },

  getTimeDomainData() {
    if (!analyser || !dataArray) {
      return new Uint8Array(bufferLength || 1024);
    }
    analyser.getByteTimeDomainData(dataArray);
    return dataArray;
  },

  setVolume(v) {
    if (gainNode) gainNode.gain.value = v;
  },

  onEnded(callback) {
    if (audioElement) audioElement.onended = callback;
  },

  // Consumer can assign this to get time updates
  onTimeUpdate: null
};

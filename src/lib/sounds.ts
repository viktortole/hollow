/**
 * Programmatic sound effects using Web Audio API.
 * No audio files needed — tones are generated on-the-fly.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
  }
  // Resume if suspended (browser autoplay policy)
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  return ctx;
}

function playTone(frequencies: number[], durations: number[], type: OscillatorType = "sine", volume = 0.25) {
  try {
    const audioCtx = getCtx();
    const now = audioCtx.currentTime;

    frequencies.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      const startTime = now + (durations[i] ?? 0);
      const endTime = startTime + (durations[i + 1] ?? durations[durations.length - 1] ?? 0.15);

      // Envelope: attack → hold → release
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
      gain.gain.setValueAtTime(volume, endTime - 0.02);
      gain.gain.linearRampToValueAtTime(0, endTime);

      osc.start(startTime);
      osc.stop(endTime + 0.01);
    });
  } catch {
    // AudioContext may be blocked if user hasn't interacted — silent fail
  }
}

export function playLevelUp() {
  // Rising major chord: C5 → E5 → G5 → C6
  playTone([523.25, 659.25, 783.99, 1046.5], [0, 0.1, 0.1, 0.1, 0.2], "sine", 0.2);
}

export function playAchievementUnlock() {
  // Golden fanfare: G4 → B4 → D5 (G major triad arpeggiated)
  playTone([392.0, 493.88, 587.33], [0, 0.12, 0.12, 0.18], "triangle", 0.22);
}

export function playStageUp() {
  // Ethereal shimmer: layered fifths — A4 + E5
  playTone([440.0, 659.25, 880.0], [0, 0, 0.08, 0.12], "sine", 0.18);
}

export function playCompleteFast() {
  // Triumphant burst: C4 → G4 → C5 → E5 → G5 (C major arpeggio)
  playTone([261.63, 392.0, 523.25, 659.25, 783.99], [0, 0.07, 0.07, 0.07, 0.07, 0.25], "sine", 0.2);
}

const noteFreqs = [
  { note: "E", freq: [82.41, 164.81, 329.63, 659.25] },
  { note: "F", freq: [87.31, 174.61, 349.23] },
  { note: "F#", freq: [92.5, 185.0, 369.99] },
  { note: "Gb", freq: [92.5, 185.0, 369.99] },
  { note: "G", freq: [98.0, 196.0, 392.0] },
  { note: "G#", freq: [103.83, 207.65, 415.3] },
  { note: "Ab", freq: [103.83, 207.65, 415.3] },
  { note: "A", freq: [110.0, 220.0, 440.0] },
  { note: "A#", freq: [116.54, 233.08, 466.16] },
  { note: "Bb", freq: [116.54, 233.08, 466.16] },
  { note: "B", freq: [123.47, 246.94, 493.88] },
  { note: "C", freq: [130.81, 261.63, 523.25] },
  { note: "C#", freq: [138.59, 277.18, 554.37] },
  { note: "Db", freq: [138.59, 277.18, 554.37] },
  { note: "D", freq: [146.83, 293.66, 587.33] },
  { note: "D#", freq: [155.56, 311.13, 622.25] },
  { note: "Eb", freq: [155.56, 311.13, 622.25] },
];

export function getNoteFromFrequency(inputFreq: number) {
  function minDiff(freqs: number[]) {
    return Math.min(...freqs.map((f) => Math.abs(f - inputFreq)));
  }

  let closest = noteFreqs.reduce((prev, curr) => (minDiff(curr.freq) < minDiff(prev.freq) ? curr : prev));
  return closest.note;
}

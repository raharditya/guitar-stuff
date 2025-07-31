"use client";
import { useEffect, useState, useRef } from "react";
import { PitchDetector } from "pitchy";
import { getNoteFromFrequency } from "@/lib/pitchUtils";
import { FaArrowRotateLeft, FaArrowRight, FaCircleCheck } from "react-icons/fa6";

const NOTES = ["A", "B", "C", "D", "E", "F", "G"];
const SHARPS = ["A#", "C#", "D#", "F#", "G#"];
const FLATS = ["Bb", "Db", "Eb", "Gb", "Ab"];
const TOTAL_ROUNDS = 20;

export default function NoteTrainer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);

  const [currenttNote, setCurrenttNote] = useState<string | null>(null);
  const [targetNote, setTargetNote] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<DOMHighResTimeStamp | null>(null);
  const [elapsedTimes, setElapsedTimes] = useState<{ note: string; time: number }[]>([]);
  const [nextCountdown, setNextCountdown] = useState<number | null>(null);
  const [listening, setListening] = useState(false);

  const [userPreferences, setUserPreferences] = useState({
    includeInBetweens: false,
    useSharps: true,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const bufferRef = useRef(new Float32Array(2048));
  const detectorRef = useRef<PitchDetector<Float32Array<ArrayBufferLike>> | null>(null);

  useEffect(() => {
    startListening();
    return stopListening;
  }, []);

  const startListening = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioCtx = new window.AudioContext();
    const analyser = audioCtx.createAnalyser();
    const source = audioCtx.createMediaStreamSource(stream);

    analyser.fftSize = 2048;
    source.connect(analyser);

    audioContextRef.current = audioCtx;
    analyserRef.current = analyser;
    sourceRef.current = source;
    detectorRef.current = PitchDetector.forFloat32Array(analyser.fftSize);

    setListening(true);
  };

  const stopListening = () => {
    audioContextRef.current?.close();
    setListening(false);
  };

  const startGame = () => {
    setElapsedTimes([]);
    setCurrentRound(1);
    setGameFinished(false);
    pickNewNote();
    setIsPlaying(true);
  };

  const pickNewNote = (prevNote: string | null = null) => {
    let randomNote: string;

    do {
      const notes = !userPreferences.includeInBetweens
        ? NOTES
        : userPreferences.useSharps
        ? NOTES.concat(SHARPS)
        : NOTES.concat(FLATS);

      randomNote = notes[Math.floor(Math.random() * notes.length)];
    } while (randomNote === prevNote);

    setTargetNote(randomNote);
    setStartTime(performance.now());
  };

  const detectNote = () => {
    const analyser = analyserRef.current;
    const detector = detectorRef.current;
    const sampleRate = audioContextRef.current?.sampleRate;
    if (!analyser || !targetNote || !detector || !sampleRate || gameFinished) return;

    analyser.getFloatTimeDomainData(bufferRef.current);
    const buffer = bufferRef.current;

    const pitchResult = detectorRef.current?.findPitch(buffer, sampleRate);

    if (pitchResult) {
      const [freq, clarity] = pitchResult;

      if (clarity > 0.9 && freq) {
        const detectedNote = getNoteFromFrequency(freq);
        setCurrenttNote(detectedNote);

        if (detectedNote === targetNote) {
          const end = performance.now();
          const timeTaken = ((end - (startTime || 0)) / 1000).toFixed(2);
          setElapsedTimes((prev) => [...prev, { note: targetNote, time: parseFloat(timeTaken) }]);

          setTargetNote(null);

          if (currentRound < TOTAL_ROUNDS) {
            runCountdown(() => {
              const nextRound = currentRound + 1;
              setCurrentRound(nextRound);
              pickNewNote(targetNote);
            });
          } else {
            setGameFinished(true);
            setTargetNote(null);
          }
        }
      }
    }
  };

  const runCountdown = (onComplete: () => void) => {
    let counter = 3;
    setNextCountdown(counter);
    const countdownInterval = setInterval(() => {
      counter -= 1;
      if (counter === 0) {
        clearInterval(countdownInterval);
        setNextCountdown(null);
        onComplete();
      } else {
        setNextCountdown(counter);
      }
    }, 1000);
  };

  useEffect(() => {
    if (!targetNote || !listening || gameFinished) return;
    const interval = setInterval(() => {
      detectNote();
    }, 100);
    return () => clearInterval(interval);
  }, [targetNote, listening, gameFinished]);

  const averageTime = () => {
    const total = elapsedTimes.reduce((sum, e) => sum + e.time, 0);
    return (total / elapsedTimes.length).toFixed(2);
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }} className="bg-[#EFF1F7] min-h-screen space-y-6">
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-3xl">
        <h1 className="font-bold text-2xl mb-4">🎸 Fret Memorization Exercise 🎸</h1>
        <p className="mb-0 opacity-70">This exercise will help you memorize the notes on the fretboard.</p>
        <p className="mb-4 opacity-70">
          Focus on a single string and play the note shown below as accurately as possible.
        </p>
      </div>

      <div className="max-w-2xl mx-auto p-6 bg-white rounded-3xl flex justify-center">
        {!isPlaying && (
          <button
            onClick={startGame}
            className="bg-[#343638] text-white px-3 py-3 w-48 flex items-center rounded-full hover:bg-[#4A4D52] transition-colors cursor-pointer"
          >
            <p className="flex-grow-1 font-semibold">Start</p>
            <div className="flex items-center justify-center w-9 h-9 bg-white text-[#343638] rounded-full">
              <FaArrowRight className="" />
            </div>
          </button>
        )}

        {isPlaying && !gameFinished && (
          <div className="w-full">
            <div className="flex justify-end w-full mb-4">
              <h2 className="bg-[#343638] text-white px-4 py-2 rounded-full">
                <span className="font-semibold">{currentRound}</span> <span className="text-sm">/{TOTAL_ROUNDS}</span>
              </h2>
            </div>

            <div
              className={`text-center -mt-10 mb-2 w-fit m-auto p-6 rounded-xl ${
                nextCountdown !== null ? "bg-green-200" : "bg-cyan-100"
              }`}
            >
              {nextCountdown !== null ? (
                <>
                  <h2 className="text-2xl flex items-center gap-3 text-green-600 font-semibold">
                    <FaCircleCheck /> Correct!
                  </h2>
                </>
              ) : (
                <>
                  <p className="text-sm opacity-60">Play this note</p>
                  <h2 className="text-4xl font-bold text-cyan-600">{targetNote}</h2>
                </>
              )}
            </div>
            <p className="text-sm opacity-70 mb-2">
              {nextCountdown !== null ? (
                <>
                  Next note in <span className="font-semibold">{nextCountdown}</span>
                </>
              ) : (
                <>
                  Detected note: <span className="font-bold">{currenttNote}</span>
                </>
              )}
            </p>
          </div>
        )}

        {gameFinished && (
          <div className="w-full text-center flex flex-col items-center">
            <h2 className="font-medium text-2xl mb-4">🎉 Exercise Complete!</h2>
            <table className="w-full mt-4 border-collapse">
              <thead>
                <tr>
                  <th className="text-left px-4 py-2 bg-gray-100 rounded-tl-xl">#</th>
                  <th className="text-left px-4 py-2 bg-gray-100">Note</th>
                  <th className="text-left px-4 py-2 bg-gray-100 rounded-tr-xl">Time (s)</th>
                </tr>
              </thead>
              <tbody>
                {elapsedTimes.map((entry, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2 font-bold">{entry.note}</td>
                    <td className="px-4 py-2">{entry.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2">
              <span className="font-semibold">Average Time:</span> {averageTime()} seconds
            </p>

            <button
              onClick={startGame}
              className="bg-[#343638] text-white px-3 py-3 w-48 mt-6 mb-2 flex items-center rounded-full hover:bg-[#4A4D52] transition-colors cursor-pointer"
            >
              <p className="flex-grow-1 font-semibold">Play again</p>
              <div className="flex items-center justify-center w-9 h-9 bg-white text-[#343638] rounded-full">
                <FaArrowRotateLeft className="" />
              </div>
            </button>
          </div>
        )}
      </div>

      <footer>
        <p className="text-sm text-gray-500">
          Developed by{" "}
          <a
            href="https://raharditya.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Raharditya
          </a>
        </p>
        <p className="text-sm text-gray-500">
          Source code available on{" "}
          <a
            href="https://github.com/raharditya/guitar-stuff"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

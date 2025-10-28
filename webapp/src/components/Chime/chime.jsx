import React, { useEffect, useRef } from "react";

/**
 * 🔔 SimpleChime
 *
 * Plays a short chime sound repeatedly while `playing` is true.
 *
 * Props:
 * - playing: boolean — whether to play or stop
 * - src: string — URL of the chime audio file (e.g., "/sounds/chime.mp3")
 * - interval: number — how often to replay (ms), default 2000
 * - volume: number — volume 0.0–1.0 (default 1.0)
 */
export default function SimpleChime({
  playing,
  src = "/sounds/chime.mp3",
  interval = 3000,
  volume = 1.0,
}) {
  const audioRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Create audio object only once
    if (!audioRef.current) {
      const el = new Audio(src);
      el.volume = volume;
      el.preload = "auto";
      audioRef.current = el;
    } else {
      audioRef.current.volume = volume;
    }

    if (playing) {
      // Start playing immediately and then at intervals
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      intervalRef.current = setInterval(() => {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }, interval);
    } else {
      // Stop loop
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [playing, src, interval, volume]);

  return null; // no visible UI
}

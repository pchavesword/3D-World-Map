import { useEffect, useRef, useState } from 'react'

const fmt = (s: number) => {
  if (!Number.isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

export default function AudioPlayer({ src, label }: { src: string; label: string }) {
  const audio = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // Smooth progress while playing; `timeupdate` alone only fires ~4×/s.
  useEffect(() => {
    if (!playing) return
    let raf = 0
    const tick = () => {
      if (audio.current) setTime(audio.current.currentTime)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing])

  // Stop playback when the card closes or moves to another story.
  useEffect(() => {
    const el = audio.current
    return () => {
      el?.pause()
    }
  }, [])

  const toggle = () => {
    const el = audio.current
    if (!el) return
    if (el.paused) void el.play().catch(() => setPlaying(false))
    else el.pause()
  }

  const pct = duration > 0 ? (time / duration) * 100 : 0

  return (
    <div className="player" role="group" aria-label={label}>
      <audio
        ref={audio}
        src={src}
        preload="metadata"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onEnded={() => {
          setPlaying(false)
          setTime(0)
        }}
      />
      <button type="button" className="player__toggle" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
        <svg viewBox="0 0 12 12" aria-hidden="true">
          {playing ? <path d="M3 1.5v9M9 1.5v9" className="player__bars" /> : <path d="M3 1.5l7 4.5-7 4.5z" />}
        </svg>
      </button>
      <input
        className="player__seek"
        type="range"
        min={0}
        max={duration || 0}
        step={0.05}
        value={time}
        aria-label="Seek"
        aria-valuetext={`${fmt(time)} of ${fmt(duration)}`}
        style={{ '--pct': `${pct}%` } as React.CSSProperties}
        onChange={(e) => {
          const t = Number(e.target.value)
          if (audio.current) audio.current.currentTime = t
          setTime(t)
        }}
      />
      <span className="player__time label" aria-hidden="true">
        {fmt(time)} / {fmt(duration)}
      </span>
    </div>
  )
}

import { usePlayer, useAudioProgress } from '../state/PlayerContext.jsx';
import { NextIcon, PauseIcon, PlayIcon, PrevIcon } from './Icons.jsx';

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const whole = Math.floor(seconds);
  const minutes = Math.floor(whole / 60);
  const rest = whole % 60;
  return `${minutes}:${rest.toString().padStart(2, '0')}`;
}

function Progress() {
  const { time, duration, seek } = useAudioProgress();
  const fraction = duration > 0 ? time / duration : 0;

  const handleClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    seek((event.clientX - rect.left) / rect.width);
  };

  return (
    <div className="progress">
      <span>{formatTime(time)}</span>
      <div className="track" onClick={handleClick} role="presentation">
        <div className="fill" style={{ width: `${fraction * 100}%` }} />
      </div>
      <span>{formatTime(duration)}</span>
    </div>
  );
}

export default function PlayerBar() {
  const { status, isPlaying, togglePlay, next, previous } = usePlayer();

  return (
    <footer className="playerbar">
      <div className={`now${isPlaying ? ' playing' : ''}`} title={status}>
        {status}
      </div>
      <div className="controls">
        <button type="button" className="iconbtn" onClick={previous} aria-label="Previous track">
          <PrevIcon />
        </button>
        <button
          type="button"
          className="iconbtn primary"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button type="button" className="iconbtn" onClick={next} aria-label="Next track">
          <NextIcon />
        </button>
      </div>
      <Progress />
    </footer>
  );
}

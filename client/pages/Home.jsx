import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Scene from '../scene/Scene.jsx';
import TrackPanel from '../ui/TrackPanel.jsx';
import FlatPlaylist from '../ui/FlatPlaylist.jsx';
import { useAuth } from '../state/AuthContext.jsx';
import { usePlayer } from '../state/PlayerContext.jsx';
import { initialView, saveView, supportsWebGL } from '../util/capabilities.js';

const WHEEL_THRESHOLD = 50;
const WHEEL_COOLDOWN_MS = 220;

function isTyping(target) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

export default function Home() {
  const { tracks, loaded, focusedIndex, focusedTrack, currentId, play, focusBy, togglePlay } =
    usePlayer();
  const { isLoggedIn } = useAuth();
  const [view, setView] = useState(initialView);
  const canRing = useRef(supportsWebGL());
  const ringActive = view === 'ring' && canRing.current;

  const toggleView = () => {
    const nextView = ringActive ? 'list' : 'ring';
    setView(nextView);
    saveView(nextView);
  };

  // Scroll and arrow keys walk the ring; Enter plays the front card.
  useEffect(() => {
    if (!ringActive) return undefined;
    let accumulated = 0;
    let lockedUntil = 0;

    const onWheel = (event) => {
      if (event.target instanceof HTMLElement && event.target.closest('.panel, .page')) return;
      const now = performance.now();
      if (now < lockedUntil) return;
      accumulated += Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (Math.abs(accumulated) >= WHEEL_THRESHOLD) {
        focusBy(accumulated > 0 ? 1 : -1);
        accumulated = 0;
        lockedUntil = now + WHEEL_COOLDOWN_MS;
      }
    };

    const onKey = (event) => {
      if (isTyping(event.target)) return;
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          focusBy(1);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          focusBy(-1);
          break;
        case 'Enter':
          if (focusedTrack) play(focusedTrack);
          break;
        case ' ':
          event.preventDefault();
          togglePlay();
          break;
        default:
      }
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
    };
  }, [ringActive, focusBy, focusedTrack, play, togglePlay]);

  if (loaded && tracks.length === 0) {
    return (
      <div className="empty">
        <div>
          <p>Nothing has been shared yet.</p>
          {isLoggedIn ? (
            <Link className="btn" to="/share">
              Share the first track
            </Link>
          ) : (
            <Link className="btn" to="/login">
              Log in to share one
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (!ringActive) {
    return (
      <>
        <FlatPlaylist />
        {canRing.current && (
          <div className="hint">
            <button type="button" className="btn ghost" onClick={toggleView}>
              Ring view
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <Scene tracks={tracks} focusedIndex={focusedIndex} currentId={currentId} onSelect={play} />
      <TrackPanel />
      <div className="hint">
        <kbd>scroll</kbd> or <kbd>←</kbd> <kbd>→</kbd> to browse · <kbd>enter</kbd> to play ·{' '}
        <button type="button" className="btn ghost" onClick={toggleView}>
          List view
        </button>
      </div>
    </>
  );
}

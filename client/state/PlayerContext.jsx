import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { api } from '../api.js';

const PlayerContext = createContext(null);

const IDLE_TEXT = 'Press play';

export function PlayerProvider({ children }) {
  // A single native <audio>; anything the browser can decode will play.
  const audioRef = useRef(null);
  // Switching tracks aborts the previous play() promise. This token lets a
  // stale rejection be ignored instead of clobbering the new track's status.
  const playToken = useRef(0);

  const [tracks, setTracks] = useState([]);
  const [loaded, setLoaded] = useState(false);
  // The card at the front of the ring. Browsing moves it; playing a track
  // snaps it to that track.
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [currentId, setCurrentId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState(IDLE_TEXT);

  const tracksRef = useRef(tracks);
  tracksRef.current = tracks;
  const currentIdRef = useRef(currentId);
  currentIdRef.current = currentId;

  const loadTracks = useCallback(async () => {
    try {
      const response = await api.get('/songs');
      setTracks(Array.isArray(response.data) ? response.data : []);
    } catch {
      setTracks([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  const play = useCallback((track) => {
    const audio = audioRef.current;
    if (!track || !audio) return;
    const token = (playToken.current += 1);
    setCurrentId(track.id);
    const index = tracksRef.current.findIndex((item) => item.id === track.id);
    if (index !== -1) setFocusedIndex(index);
    setStatus(`${track.artist || 'Unknown artist'} — ${track.title || 'Untitled'}`);
    audio.src = track.audioUrl;
    audio.play().catch((error) => {
      // AbortError means we interrupted playback ourselves, by switching
      // tracks or pausing. Only a genuine failure (an autoplay block, say)
      // should replace the track name with a prompt.
      if (error?.name === 'AbortError' || token !== playToken.current) return;
      setStatus('Press play to start listening');
    });
  }, []);

  /** Walks the playlist from the playing track, wrapping around at either end. */
  const step = useCallback(
    (offset) => {
      const list = tracksRef.current;
      if (list.length === 0) return;
      const index = list.findIndex((item) => item.id === currentIdRef.current);
      if (index === -1) {
        play(list[0]);
        return;
      }
      play(list[(index + offset + list.length) % list.length]);
    },
    [play]
  );

  const next = useCallback(() => step(1), [step]);
  const previous = useCallback(() => step(-1), [step]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none';
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onError = () => {
      // Fires with an empty error during teardown and while swapping sources.
      if (audio.error && audio.currentSrc) setStatus("That track wouldn't load");
    };
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', next);
    audio.addEventListener('error', onError);
    audioRef.current = audio;
    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', next);
      audio.removeEventListener('error', onError);
      audio.pause();
      audio.removeAttribute('src');
      audioRef.current = null;
    };
  }, [next]);

  useEffect(() => {
    loadTracks();
  }, [loadTracks]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!currentIdRef.current) {
      const list = tracksRef.current;
      play(list[focusedIndex] ?? list[0]);
      return;
    }
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [play, focusedIndex]);

  const focus = useCallback((index) => {
    const count = tracksRef.current.length;
    if (count === 0) return;
    setFocusedIndex(((index % count) + count) % count);
  }, []);

  const focusBy = useCallback(
    (offset) => {
      setFocusedIndex((index) => {
        const count = tracksRef.current.length;
        if (count === 0) return 0;
        return (((index + offset) % count) + count) % count;
      });
    },
    []
  );

  const updateTrack = useCallback(async (id, patch) => {
    const response = await api.put(`/songs/${id}`, patch);
    setTracks((list) => list.map((item) => (item.id === id ? response.data : item)));
    if (currentIdRef.current === id) {
      const track = response.data;
      setStatus(`${track.artist || 'Unknown artist'} — ${track.title || 'Untitled'}`);
    }
    return response.data;
  }, []);

  const removeTrack = useCallback(async (id) => {
    await api.delete(`/songs/${id}`);
    if (currentIdRef.current === id) {
      audioRef.current?.pause();
      audioRef.current?.removeAttribute('src');
      setCurrentId(null);
      setStatus(IDLE_TEXT);
    }
    setTracks((list) => {
      const nextList = list.filter((item) => item.id !== id);
      setFocusedIndex((index) => Math.min(index, Math.max(nextList.length - 1, 0)));
      return nextList;
    });
  }, []);

  const value = useMemo(
    () => ({
      audioRef,
      tracks,
      loaded,
      focusedIndex,
      focusedTrack: tracks[focusedIndex] ?? null,
      currentId,
      currentTrack: tracks.find((item) => item.id === currentId) ?? null,
      isPlaying,
      status,
      loadTracks,
      play,
      togglePlay,
      next,
      previous,
      focus,
      focusBy,
      updateTrack,
      removeTrack,
    }),
    [
      tracks,
      loaded,
      focusedIndex,
      currentId,
      isPlaying,
      status,
      loadTracks,
      play,
      togglePlay,
      next,
      previous,
      focus,
      focusBy,
      updateTrack,
      removeTrack,
    ]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used inside <PlayerProvider>');
  }
  return context;
}

/**
 * Playback position, kept out of the main context so the few components that
 * need it re-render several times a second without dragging the scene along.
 */
export function useAudioProgress() {
  const { audioRef, currentId } = usePlayer();
  const [progress, setProgress] = useState({ time: 0, duration: 0 });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;
    const update = () =>
      setProgress({
        time: audio.currentTime || 0,
        duration: Number.isFinite(audio.duration) ? audio.duration : 0,
      });
    update();
    audio.addEventListener('timeupdate', update);
    audio.addEventListener('durationchange', update);
    audio.addEventListener('emptied', update);
    return () => {
      audio.removeEventListener('timeupdate', update);
      audio.removeEventListener('durationchange', update);
      audio.removeEventListener('emptied', update);
    };
  }, [audioRef, currentId]);

  const seek = useCallback(
    (fraction) => {
      const audio = audioRef.current;
      if (!audio || !Number.isFinite(audio.duration)) return;
      audio.currentTime = Math.max(0, Math.min(1, fraction)) * audio.duration;
    },
    [audioRef]
  );

  return { ...progress, seek };
}

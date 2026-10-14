import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { errorMessage } from '../api.js';
import { useAuth } from '../state/AuthContext.jsx';
import { usePlayer } from '../state/PlayerContext.jsx';

const EDITABLE = ['title', 'artist', 'album', 'postBody'];

function EditForm({ track, onDone }) {
  const { updateTrack } = usePlayer();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(() =>
    Object.fromEntries(EDITABLE.map((key) => [key, track[key] ?? '']))
  );
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await updateTrack(track.id, draft);
      onDone();
    } catch (requestError) {
      if (requestError?.response?.status === 401) {
        navigate('/login');
        return;
      }
      setError(errorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="message">{error}</p>}
      {EDITABLE.map((key) => (
        <div className="field" key={key}>
          <label htmlFor={`edit-${key}`}>{key === 'postBody' ? 'Notes' : key}</label>
          {key === 'postBody' ? (
            <textarea
              id={`edit-${key}`}
              value={draft[key]}
              onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
            />
          ) : (
            <input
              id={`edit-${key}`}
              value={draft[key]}
              onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
            />
          )}
        </div>
      ))}
      <div className="form-actions">
        <button type="submit" className="btn" disabled={busy}>
          Save
        </button>
        <button type="button" className="btn ghost" onClick={onDone}>
          Cancel
        </button>
      </div>
    </form>
  );
}

/** Details and actions for the card at the front of the ring. */
export default function TrackPanel() {
  const { focusedTrack, currentId, isPlaying, play, togglePlay, removeTrack } = usePlayer();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('view');
  const [error, setError] = useState('');

  // Reset the panel whenever the ring moves to a different track.
  useEffect(() => {
    setMode('view');
    setError('');
  }, [focusedTrack?.id]);

  if (!focusedTrack) return null;

  const track = focusedTrack;
  const isCurrent = track.id === currentId;

  const handleDelete = async () => {
    try {
      await removeTrack(track.id);
    } catch (requestError) {
      if (requestError?.response?.status === 401) {
        navigate('/login');
        return;
      }
      setError(errorMessage(requestError));
    }
  };

  return (
    <aside className="panel">
      {mode === 'edit' ? (
        <EditForm track={track} onDone={() => setMode('view')} />
      ) : (
        <>
          <h2>{track.title || 'Untitled'}</h2>
          <div className="artist">{track.artist || 'Unknown artist'}</div>
          {track.album && <div className="album">{track.album}</div>}
          {track.postBody && <p className="body">{track.postBody}</p>}
          <div className="meta">
            {track.sharedBy?.displayName ? `shared by ${track.sharedBy.displayName} · ` : ''}
            {new Date(track.createdAt).toLocaleDateString()}
          </div>
          {error && <p className="message">{error}</p>}
          <div className="actions">
            {isCurrent ? (
              <button type="button" className="btn accent" onClick={togglePlay}>
                {isPlaying ? 'Pause' : 'Resume'}
              </button>
            ) : (
              <button type="button" className="btn accent" onClick={() => play(track)}>
                Play
              </button>
            )}
            {isLoggedIn && mode === 'view' && (
              <>
                <button type="button" className="btn" onClick={() => setMode('edit')}>
                  Edit
                </button>
                <button type="button" className="btn ghost" onClick={() => setMode('confirm')}>
                  Delete
                </button>
              </>
            )}
            {mode === 'confirm' && (
              <>
                <button type="button" className="btn danger" onClick={handleDelete}>
                  Confirm delete
                </button>
                <button type="button" className="btn ghost" onClick={() => setMode('view')}>
                  Keep it
                </button>
              </>
            )}
          </div>
        </>
      )}
    </aside>
  );
}

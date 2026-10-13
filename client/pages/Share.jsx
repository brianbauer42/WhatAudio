import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api, errorMessage } from '../api.js';
import { useAuth } from '../state/AuthContext.jsx';
import { usePlayer } from '../state/PlayerContext.jsx';

const EMPTY = { title: '', artist: '', album: '', postBody: '' };

export default function Share() {
  const { isLoggedIn, checked } = useAuth();
  const { loadTracks, play } = usePlayer();
  const navigate = useNavigate();
  const [post, setPost] = useState(EMPTY);
  const [audioFile, setAudioFile] = useState(null);
  const [artFile, setArtFile] = useState(null);
  const [error, setError] = useState('');
  const [shared, setShared] = useState(null);
  const [busy, setBusy] = useState(false);

  if (checked && !isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const update = (key) => (event) => setPost({ ...post, [key]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!audioFile) {
      setError('Pick an audio file first.');
      return;
    }
    setBusy(true);
    setError('');
    const formData = new FormData();
    Object.entries(post).forEach(([key, value]) => formData.append(key, value));
    formData.append('audio', audioFile);
    if (artFile) formData.append('art', artFile);
    try {
      const response = await api.post('/songs/upload', formData);
      await loadTracks();
      setShared(response.data);
      setPost(EMPTY);
      setAudioFile(null);
      setArtFile(null);
      event.target.reset();
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
    <main className="page">
      <form className="card" onSubmit={handleSubmit}>
        <h1>
          Share a <span>track</span>
        </h1>
        {error && <p className="message">{error}</p>}
        {shared && (
          <p className="message ok">
            Shared “{shared.title || 'Untitled'}”.{' '}
            <Link
              to="/"
              onClick={() => {
                play(shared);
              }}
            >
              Play it now
            </Link>
          </p>
        )}
        <div className="field">
          <label htmlFor="share-title">Title</label>
          <input id="share-title" value={post.title} onChange={update('title')} />
        </div>
        <div className="field">
          <label htmlFor="share-artist">Artist</label>
          <input id="share-artist" value={post.artist} onChange={update('artist')} />
        </div>
        <div className="field">
          <label htmlFor="share-album">Album</label>
          <input id="share-album" value={post.album} onChange={update('album')} />
        </div>
        <div className="field">
          <label htmlFor="share-body">Notes</label>
          <textarea id="share-body" value={post.postBody} onChange={update('postBody')} />
        </div>
        <div className="field">
          <label htmlFor="share-audio">Audio file</label>
          <input
            id="share-audio"
            type="file"
            accept="audio/*,.flac,.ogg,.opus,.mp3,.m4a,.wav"
            required
            onChange={(event) => setAudioFile(event.target.files?.[0] ?? null)}
          />
        </div>
        <div className="field">
          <label htmlFor="share-art">Cover art (optional)</label>
          <input
            id="share-art"
            type="file"
            accept="image/*"
            onChange={(event) => setArtFile(event.target.files?.[0] ?? null)}
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn accent" disabled={busy}>
            {busy ? 'Uploading…' : 'Share'}
          </button>
        </div>
        <p className="fine">
          FLAC plays in Chrome and Firefox. Prefer MP3, Ogg or Opus if Safari matters to you.
        </p>
      </form>
    </main>
  );
}

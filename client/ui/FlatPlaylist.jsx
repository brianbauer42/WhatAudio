import { resourceUrl } from '../api.js';
import { usePlayer } from '../state/PlayerContext.jsx';

/** The playlist as a plain list, for browsers without WebGL or with reduced motion on. */
export default function FlatPlaylist() {
  const { tracks, currentId, play } = usePlayer();

  return (
    <section className="flat">
      <ul>
        {tracks.map((track) => {
          const art = resourceUrl(track.artUri);
          const initial = (track.artist || track.title || '?').trim().charAt(0).toUpperCase();
          return (
            <li
              key={track._id}
              className={track._id === currentId ? 'current' : ''}
              onClick={() => play(track)}
            >
              {art ? <img src={art} alt="" loading="lazy" /> : <div className="art">{initial}</div>}
              <div>
                <div className="title">{track.title || 'Untitled'}</div>
                <div className="sub">
                  {track.artist || 'Unknown artist'}
                  {track.album ? ` · ${track.album}` : ''}
                </div>
              </div>
              <div className="sub">{track.sharedBy?.displayName}</div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

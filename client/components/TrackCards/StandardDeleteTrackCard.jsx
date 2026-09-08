const artSrc = (track) => (track.artUri ? `/resources/${track.artUri}` : '/favicon.ico');
const authorName = (track) => track.sharedBy?.displayName ?? 'someone';

export default function StandardDeleteTrackCard(props) {
  const { track } = props;
  return (
    <div className={props.generateClassName(track)}>
      <div
        className="artContainer"
        onClick={(event) => props.handleTrackSelection(track, event)}
      >
        <img className="albumArt" src={artSrc(track)} alt="album cover" />
      </div>
      <div className="postBody">
        <h2 className="areYouSure">Are you sure you want to delete this track?</h2>
        <h3 className="trackTitle">
          {track.artist} - {track.title}
        </h3>
        <p className="postAuthor">Shared by: {authorName(track)}</p>
        <button
          type="button"
          className="redButton"
          onClick={(event) => props.handleDeletePost(track._id, event)}
        >
          Delete!
        </button>
        <button
          type="button"
          className="greenButton"
          onClick={(event) => props.toggleDeleteTrackCard(track, event)}
        >
          Keep!
        </button>
      </div>
    </div>
  );
}

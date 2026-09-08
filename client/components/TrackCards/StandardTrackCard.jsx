const artSrc = (track) => (track.artUri ? `/resources/${track.artUri}` : '/favicon.ico');
const authorName = (track) => track.sharedBy?.displayName ?? 'someone';

export default function StandardTrackCard(props) {
  const { track } = props;
  return (
    <div
      className={props.generateClassName(track)}
      onClick={(event) => props.handleTrackSelection(track, event)}
    >
      <div className="artContainer">
        <img className="albumArt" src={artSrc(track)} alt="album cover" />
      </div>
      <div className="postBody">
        <h4 className="trackTitle">
          {track.artist} - {track.title}
        </h4>
        <h5 className="albumTitle">{track.album}</h5>
        <p className="postBodyText">{track.postBody}</p>
        <p className="postAuthor">- {authorName(track)}</p>
      </div>
      {props.isLoggedIn() ? (
        <div className="postButtonsContainer">
          <i
            className="fa fa-pencil-square-o fa-lg colorClick postEditButton"
            onClick={(event) => props.toggleEditTrackCard(track, event)}
          />
          <i
            className="fa fa-times fa-lg colorClick postDeleteButton"
            onClick={(event) => props.toggleDeleteTrackCard(track, event)}
          />
        </div>
      ) : null}
    </div>
  );
}

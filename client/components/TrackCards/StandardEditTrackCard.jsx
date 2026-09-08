const artSrc = (track) => (track.artUri ? `/resources/${track.artUri}` : '/favicon.ico');
const authorName = (track) => track.sharedBy?.displayName ?? 'someone';

export default function StandardEditTrackCard(props) {
  const { track, inputState } = props;
  return (
    <div className={props.generateClassName(track)}>
      <div
        className="artContainer"
        onClick={(event) => props.handleTrackSelection(track, event)}
      >
        <img className="albumArt" src={artSrc(track)} alt="album cover" />
      </div>
      <div className="postBody">
        <form
          className="trackUpdateForm"
          onSubmit={(event) => props.handleEditPost(track, event)}
        >
          <h5>
            Artist:
            <input
              type="text"
              value={inputState.artist}
              onChange={(event) => props.handleInputChange('artist', track._id, event)}
            />
            Title:
            <input
              type="text"
              value={inputState.title}
              onChange={(event) => props.handleInputChange('title', track._id, event)}
            />
          </h5>
          <h5>
            Album:
            <input
              type="text"
              value={inputState.album}
              onChange={(event) => props.handleInputChange('album', track._id, event)}
            />
          </h5>
          <textarea
            value={inputState.postBody}
            onChange={(event) => props.handleInputChange('postBody', track._id, event)}
          />
          <p className="postAuthor">- {authorName(track)}</p>
          <button type="submit">Save Changes</button>
        </form>
      </div>
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
    </div>
  );
}

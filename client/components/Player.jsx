export default function Player(props) {
  return (
    <div className="playerContainer">
      <div className="player">
        <h3 className={`nowPlaying${props.isPlaying ? ' titleGlow' : ''}`}>
          {props.displayText}
        </h3>
        <div className="playerControls">
          <div className="audioControls">
            <i className="fa fa-backward fa-2x colorClick" onClick={props.previous} />
          </div>
          <div className="audioControls">
            <i className="fa fa-pause-circle-o fa-2x colorClick" onClick={props.pause} />
          </div>
          <div className="audioControls">
            <i className="fa fa-play-circle fa-2x colorClick" onClick={props.play} />
          </div>
          <div className="audioControls">
            <i className="fa fa-forward fa-2x colorClick" onClick={props.next} />
          </div>
        </div>
      </div>
    </div>
  );
}

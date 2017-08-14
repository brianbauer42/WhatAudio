import React, { Component } from 'react';

class Player extends Component {
  render() {
    return (
      <div className="playerContainer">
        <div className="player">
          <h3 className={"nowPlaying" + (this.props.isPlaying ? " titleGlow" : '')}>{this.props.displayText}</h3>
          <div className="playerControls">
            <div className="audioControls">
              <i className='fa fa-backward fa-2x colorClick' onClick={this.props.previous} />
            </div>
            <div className="audioControls">
              <i className='fa fa-pause-circle-o fa-2x colorClick' onClick={this.props.pause} />
            </div>
            <div className="audioControls">
              <i className='fa fa-play-circle fa-2x colorClick' onClick={this.props.play} />
            </div>
            <div className="audioControls">
              <i className='fa fa-forward fa-2x colorClick' onClick={this.props.next} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Player;